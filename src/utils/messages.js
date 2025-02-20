// Date & Time Utilities in JavaScript
// - `getTime()` returns the timestamp (milliseconds since 1970).
// - If the date is before 1970, `getTime()` returns a negative number.

export const generateMessage = (username, text) => ({
  username,
  text,
  createdAt: Date.now(), // More concise than `new Date().getTime()`
});

export const generateLocationMessage = (username, url) => ({
  username,
  url,
  createdAt: Date.now(),
});