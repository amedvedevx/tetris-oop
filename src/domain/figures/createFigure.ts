import type { PieceKind } from '../pieces';
import type { Figure } from './Figure';
import { IFigure } from './IFigure';
import { OFigure } from './OFigure';
import { TFigure } from './TFigure';
import { SFigure } from './SFigure';
import { ZFigure } from './ZFigure';
import { JFigure } from './JFigure';
import { LFigure } from './LFigure';

const constructors: Record<PieceKind, new () => Figure> = {
  I: IFigure, O: OFigure, T: TFigure, S: SFigure, Z: ZFigure, J: JFigure, L: LFigure,
};

export function createFigure(kind: PieceKind): Figure {
  const ConcreteFigure = constructors[kind];
  return new ConcreteFigure();
}
