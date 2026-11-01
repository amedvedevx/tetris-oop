import type { Point } from '../pieces';
import { Figure } from './Figure';

export class ZFigure extends Figure {
  constructor(position?: Point) {
    super('Z', 3, [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], position);
  }

  protected override createAt(position: Point): ZFigure {
    return new ZFigure(position);
  }
}
