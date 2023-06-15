/**
 * Checks if a given value is numeric.
 *
 * @param {any} str - The value to be checked for numericness.
 * @returns {boolean} - Returns true if the value is numeric, false otherwise.
 */
export function isNumeric(str: any): boolean {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str as unknown as number) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  );
}

/**
 * Returns a human-readable relative time string based on the time difference
 * between the current time and a given time string.
 *
 * @param {number} timestamp - The time in milliseconds since the epoch (Unix timestamp).
 * @returns {string} - The relative time string.
 */
export function getRelativeTimeString(timestamp: number): string {
  let deltaSeconds = Math.round((new Date().getTime() - timestamp) / 1000);

  // Determine if the time is in the past or the future
  const past = deltaSeconds >= 0;
  const future = !past;

  deltaSeconds = Math.abs(deltaSeconds);

  // Define time intervals in seconds
  let minute = 60,
    hour = minute * 60,
    day = hour * 24,
    week = day * 7,
    year = day * 365;

  // Use a switch statement to handle different time intervals and return the appropriate relative time string
  switch (true) {
    case past && deltaSeconds < 5:
      return "Less than 5 seconds ago";
    case past && deltaSeconds < minute:
      return `${deltaSeconds} seconds ago`;
    case past && deltaSeconds < 2 * minute:
      return "A minute ago";
    case past && deltaSeconds < hour:
      return `${Math.floor(deltaSeconds / minute)} minutes ago`;
    case past && Math.floor(deltaSeconds / hour) === 1:
      return "1 hour ago";
    case past && deltaSeconds < day:
      return `${Math.floor(deltaSeconds / hour)} hours ago`;
    case past && deltaSeconds < day * 2:
      return "Yesterday";
    case past && deltaSeconds < week:
      return `${Math.floor(deltaSeconds / day)} days ago`;
    case past && deltaSeconds < 2 * week:
      return "A week ago";
    case past && deltaSeconds < year:
      return `${Math.floor(deltaSeconds / week)} weeks ago`;
    case past && deltaSeconds < 2 * year:
      return "A year ago";
    case future && deltaSeconds < 5:
      return "In less than 5 seconds";
    case future && deltaSeconds < minute:
      return `In ${deltaSeconds} seconds`;
    case future && deltaSeconds < 2 * minute:
      return "In a minute";
    case future && deltaSeconds < hour:
      return `In ${Math.floor(deltaSeconds / minute)} minutes`;
    case future && Math.floor(deltaSeconds / hour) === 1:
      return "In 1 hour";
    case future && deltaSeconds < day:
      return `In ${Math.floor(deltaSeconds / hour)} hours`;
    case future && deltaSeconds < day * 2:
      return "Tomorrow";
    case future && deltaSeconds < week:
      return `In ${Math.floor(deltaSeconds / day)} days`;
    case future && deltaSeconds < 2 * week:
      return "In a week";
    case future && deltaSeconds < year:
      return `In ${Math.floor(deltaSeconds / week)} weeks`;
    case future && deltaSeconds < 2 * year:
      return "In year";
    case past:
      return "A long time ago";
    case future:
      return "In a long time";
  }

  // Default case: return "Sometime" if none of the above cases match
  return "Sometime";
}

export function pick(obj: object, keys: string[]) {
  return keys.reduce<{ [key: string]: unknown }>((finalObj, key) => {
    if (obj && Object.hasOwnProperty.call(obj, key)) {
      finalObj[key] = obj[key as keyof typeof obj];
    }
    return finalObj;
  }, {});
}

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string | undefined, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}