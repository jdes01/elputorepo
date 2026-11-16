// Algo que el dominio no permite. Cada caso es una subclase con nombre propio:
// quien la captura decide que hacer con ella (en HTTP, que codigo devolver).
export abstract class DomainError extends Error {
  override get name(): string {
    return this.constructor.name;
  }
}
