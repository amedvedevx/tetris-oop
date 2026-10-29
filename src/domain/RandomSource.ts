export interface RandomSource {
  /** A finite number in [0, 1). */
  next(): number;
}
