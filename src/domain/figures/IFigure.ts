import type { Point } from '../pieces';
import { Figure } from './Figure';

export class IFigure extends Figure {
  constructor(position?: Point) {
    super('I', 4, [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }], position);
  }

  protected override createAt(position: Point): IFigure {
    return new IFigure(position);
  }
}
