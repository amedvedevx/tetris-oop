import type { Point } from '../pieces';
import { Figure } from './Figure';

export class LFigure extends Figure {
  constructor(position?: Point) {
    super('L', 3, [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], position);
  }

  protected override createAt(position: Point): LFigure {
    return new LFigure(position);
  }
}
