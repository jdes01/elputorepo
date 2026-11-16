import { Mailer } from '../application/mailer';

// El mismo puerto, sin mandar nada: apunta lo que se habria mandado. Para tests.
// Con `down = true` se comporta como un servidor de correo caido.
export class RecordingMailer extends Mailer {
  readonly sent: { to: string; subject: string; html: string }[] = [];
  down = false;

  async send(to: string, subject: string, html: string): Promise<void> {
    if (this.down) throw new Error('el servidor de correo no responde');
    this.sent.push({ to, subject, html });
  }
}
