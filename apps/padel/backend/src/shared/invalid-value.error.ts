// Un valor que no puede existir: una hora "25:00", una pista que cierra antes de
// abrir, un id negativo. Lo lanza el value object que lo rechaza.
export class InvalidValueError extends Error {
  override readonly name = 'InvalidValueError';
}
