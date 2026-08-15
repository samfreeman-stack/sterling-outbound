/* ==========================================================================
   Sterling Outbound — on-brand Calendly availability picker.
   Reads real open slots via a Netlify Function (server-side proxy that holds
   the Calendly token). Clicking a slot opens Calendly's own hosted page,
   pre-filled to that exact time, in a new tab to complete the booking -
   Calendly's "create invitee" API requires a paid plan, so the final
   confirm step happens on their page rather than fully custom here.
   ========================================================================== */

(function initBookingPicker() {
  const root = document.getElementById("bookingPicker");
  if (!root) return;

  const tzLabel = document.getElementById("bookingTz");
  const daysEl = document.getElementById("bookingDays");
  const slotsEl = document.getElementById("bookingSlots");

  const FALLBACK_URL = root.dataset.fallbackUrl || "#";
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  if (tzLabel) {
    tzLabel.textContent = "Showing times in your local timezone (" + timezone + ")";
  }

  function setState(html) {
    slotsEl.innerHTML = html;
    daysEl.innerHTML = "";
  }

  function loadingState() {
    setState(
      '<div class="booking-state"><div class="booking-spinner"></div>Loading available times&hellip;</div>'
    );
  }

  function errorState(message) {
    setState(
      '<div class="booking-state">' +
        (message || "Couldn't load available times right now.") +
        '<br><br><a href="' +
        FALLBACK_URL +
        '" target="_blank" rel="noopener">Open the full booking page instead &rarr;</a></div>'
    );
  }

  function emptyState() {
    setState(
      '<div class="booking-state">No open times in the next couple of weeks &mdash; ' +
        '<a href="' +
        FALLBACK_URL +
        '" target="_blank" rel="noopener">check the full calendar</a> for later availability.</div>'
    );
  }

  function dayKey(date) {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  }

  function dayLabel(date) {
    return new Intl.DateTimeFormat("en-GB", { timeZone: timezone, weekday: "short", day: "numeric", month: "short" }).format(date);
  }

  function timeLabel(date) {
    return new Intl.DateTimeFormat("en-GB", { timeZone: timezone, hour: "numeric", minute: "2-digit" }).format(date);
  }

  function groupByDay(slots) {
    const groups = new Map();
    slots.forEach((slot) => {
      const date = new Date(slot.start_time);
      const key = dayKey(date);
      if (!groups.has(key)) groups.set(key, { label: dayLabel(date), slots: [] });
      groups.get(key).slots.push({ date, url: slot.scheduling_url });
    });
    return groups;
  }

  function renderDays(groups) {
    const keys = Array.from(groups.keys()).sort();
    daysEl.innerHTML = "";
    keys.forEach((key, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "booking-day-btn" + (i === 0 ? " active" : "");
      btn.textContent = groups.get(key).label;
      btn.addEventListener("click", () => {
        daysEl.querySelectorAll(".booking-day-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderSlots(groups.get(key).slots);
      });
      daysEl.appendChild(btn);
    });
    if (keys.length) renderSlots(groups.get(keys[0]).slots);
  }

  function renderSlots(slots) {
    slotsEl.innerHTML = "";
    slots
      .sort((a, b) => a.date - b.date)
      .forEach((slot) => {
        const btn = document.createElement("a");
        btn.className = "booking-slot-btn";
        btn.href = slot.url;
        btn.target = "_blank";
        btn.rel = "noopener";
        btn.textContent = timeLabel(slot.date);
        slotsEl.appendChild(btn);
      });
  }

  async function load() {
    loadingState();
    try {
      const res = await fetch("/.netlify/functions/get-availability?days=14");
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        errorState(data && data.error);
        return;
      }

      const slots = (data && data.slots) || [];
      if (!slots.length) {
        emptyState();
        return;
      }

      const groups = groupByDay(slots);
      renderDays(groups);
    } catch (err) {
      errorState("Couldn't reach the booking system.");
    }
  }

  load();
})();
