const FALLBACK_CALENDAR_API_KEY = "AIzaSyBIx6nTl2niOG6yD17L-jua2X-u-j2mFBU";
const FALLBACK_CALENDAR_ID =
  "shpemaesutep@gmail.com";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const GOOGLE_CALENDAR_API_KEY =
  process.env.EXPO_PUBLIC_CALENDAR_API_KEY?.trim() || FALLBACK_CALENDAR_API_KEY;

export const GOOGLE_CALENDAR_ID =
  process.env.EXPO_PUBLIC_CALENDAR_ID?.trim() || FALLBACK_CALENDAR_ID;

export const isGoogleCalendarConfigured = () =>
  Boolean(GOOGLE_CALENDAR_API_KEY && GOOGLE_CALENDAR_ID);

export const parseGoogleCalendarDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  // Google all-day events arrive as YYYY-MM-DD without a timezone.
  // Parsing those with new Date(...) treats them as UTC and can shift
  // the displayed day backward on devices in U.S. timezones.
  if (DATE_ONLY_PATTERN.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(value);
};

export const buildGoogleCalendarEventsUrl = () => {
  if (!isGoogleCalendarConfigured()) {
    return null;
  }

  return `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    GOOGLE_CALENDAR_ID
  )}/events?key=${GOOGLE_CALENDAR_API_KEY}&orderBy=startTime&singleEvents=true`;
};
