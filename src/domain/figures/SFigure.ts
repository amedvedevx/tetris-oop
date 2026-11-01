import type { Point } from '../pieces';
import { Figure } from './Figure';

export class SFigure extends Figure {
  constructor(position?: Point) {
    super('S', 3, [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], position);
  }

  protected override createAt(position: Point): SFigure {
    return new SFigure(position);
  }
}
