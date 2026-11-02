/** Requests a refresh; elapsed time always comes from the game clock. */
export interface Ticker {
  subscribe(onTick: () => void): () => void;
}
