import type { Point } from '../pieces';
import { Figure } from './Figure';

export class OFigure extends Figure {
  constructor(position?: Point) {
    super('O', 4, [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], position);
  }

  protected override createAt(position: Point): OFigure {
    return new OFigure(position);
  }
}
