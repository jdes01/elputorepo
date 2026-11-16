// El puerto: mandar un correo. La aplicacion no sabe si hay SMTP, una API o nada.
export abstract class Mailer {
  abstract send(to: string, subject: string, html: string): Promise<void>;
}
