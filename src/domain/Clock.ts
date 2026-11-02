/** Monotonic milliseconds; implemented outside the domain. */
export interface Clock {
  now(): number;
}
