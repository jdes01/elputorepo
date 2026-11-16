import { describe, expect, it } from 'vitest';
import { InvalidValueError } from '../../../shared/domain/errors/invalid-value.error';
import { ClubName } from './club-name.value-object';

describe('ClubName', () => {
  it('quita los espacios de los extremos', () => {
    expect(ClubName.of('  Club Norte ').toString()).toBe('Club Norte');
  });

  it('no puede estar vacio', () => {
    expect(() => ClubName.of('   ')).toThrow(InvalidValueError);
  });

  it('no puede pasar del maximo', () => {
    expect(() => ClubName.of('x'.repeat(ClubName.MAX_LENGTH + 1))).toThrow(InvalidValueError);
  });

  it('dos nombres iguales son el mismo valor', () => {
    expect(ClubName.of('Club Norte').equals(ClubName.of(' Club Norte'))).toBe(true);
  });
});
