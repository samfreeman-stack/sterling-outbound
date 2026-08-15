// Server-side proxy to Calendly's "List Event Type Available Times" endpoint.
// The Calendly Personal Access Token stays here (Netlify env var), never sent
// to the browser. Client only ever receives start_time + scheduling_url per slot.
//
// Required Netlify environment variables (set in Site settings, not in this repo):
//   CALENDLY_API_TOKEN       - a Calendly Personal Access Token
//   CALENDLY_EVENT_TYPE_URI  - e.g. https://api.calendly.com/event_types/XXXXXXXXXXXXXXXX

const MAX_RANGE_DAYS = 31; // hard cap enforced by Calendly's API

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };

  const token = process.env.CALENDLY_API_TOKEN;
  const eventTypeUri = process.env.CALENDLY_EVENT_TYPE_URI;

  if (!token || !eventTypeUri) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Booking is temporarily unavailable. Please try again shortly or use the direct booking link." }),
    };
  }

  const params = event.queryStringParameters || {};
  let days = parseInt(params.days, 10);
  if (!Number.isFinite(days) || days <= 0) days = 14;
  days = Math.min(days, MAX_RANGE_DAYS);

  const start = new Date();
  start.setUTCSeconds(0, 0);
  const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);

  const url = new URL("https://api.calendly.com/event_type_available_times");
  url.searchParams.set("event_type", eventTypeUri);
  url.searchParams.set("start_time", start.toISOString());
  url.searchParams.set("end_time", end.toISOString());

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers,
        body: JSON.stringify({
          error: (data && data.message) || "Could not load available times right now.",
        }),
      };
    }

    const slots = ((data && data.collection) || [])
      .filter((s) => s.status === "available")
      .map((s) => ({
        start_time: s.start_time,
        scheduling_url: s.scheduling_url,
      }));

    return {
      statusCode: 200,
      headers: { ...headers, "Cache-Control": "public, max-age=60" },
      body: JSON.stringify({ slots }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Unexpected error loading available times." }),
    };
  }
};
