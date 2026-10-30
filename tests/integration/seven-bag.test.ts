import { describe, expect, it } from 'vitest';
import { SevenBag } from '../../src/domain/SevenBag';
import { ScriptedRandom } from '../fixtures/ScriptedRandom';
import { identityBag, lBag, upper } from '../fixtures/new-game-data';

describe('seven-bag boundary behavior', () => {
  it('draws three complete independently shuffled bags with non-consuming peek across both boundaries', () => {
    const random = new ScriptedRandom([...identityBag, 0, 0, 0, 0, 0, 0, ...identityBag]);
    const bag = new SevenBag(random);
    const expected = [
      'I', 'O', 'T', 'S', 'Z', 'J', 'L',
      'O', 'T', 'S', 'Z', 'J', 'L', 'I',
      'I', 'O', 'T', 'S', 'Z', 'J', 'L',
    ];
    const actual: string[] = [];
    expect(random.calls).toBe(0);
    for (const [index, kind] of expected.entries()) {
      expect(bag.peek()).toBe(kind);
      expect(bag.peek()).toBe(kind);
      expect(bag.take()).toBe(kind);
      expect(random.calls).toBe(Math.ceil((index + 1) / 7) * 6);
      actual.push(kind);
    }
    expect(actual).toEqual(expected);
    for (let start = 0; start < actual.length; start += 7) {
      expect([...actual.slice(start, start + 7)].sort()).toEqual(['I', 'J', 'L', 'O', 'S', 'T', 'Z']);
    }
  });

  it('allows the same type on either side of a bag boundary without skipping it', () => {
    const bag = new SevenBag(new ScriptedRandom([...identityBag, ...lBag]));
    expect(Array.from({ length: 6 }, () => bag.take())).toEqual(['I', 'O', 'T', 'S', 'Z', 'J']);
    expect(bag.peek()).toBe('L');
    expect(bag.take()).toBe('L');
    expect(bag.peek()).toBe('L');
    expect(bag.peek()).toBe('L');
    expect(bag.take()).toBe('L');
    expect(Array.from({ length: 6 }, () => bag.take())).toEqual(['O', 'T', 'S', 'Z', 'J', 'I']);
  });

  it.each([NaN, Infinity, -Infinity, -0.01, 1, 2])('rejects %s late in a shuffle and recovers without publishing a partial bag', invalid => {
    const random = new ScriptedRandom([upper, upper, invalid, 0, 0, 0, 0, 0, 0]);
    const bag = new SevenBag(random);
    expect(() => bag.peek()).toThrow(RangeError);
    expect(bag.peek()).toBe('O');
    expect(bag.peek()).toBe('O');
    expect(bag.take()).toBe('O');
    expect(Array.from({ length: 6 }, () => bag.take())).toEqual(['T', 'S', 'Z', 'J', 'L', 'I']);
    expect(random.calls).toBe(9);
  });
});
