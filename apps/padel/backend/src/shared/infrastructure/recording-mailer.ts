import { Mailer } from '../application/mailer';

// El mismo puerto, sin mandar nada: apunta lo que se habria mandado. Para tests.
export class RecordingMailer extends Mailer {
  readonly sent: { to: string; subject: string; html: string }[] = [];

  async send(to: string, subject: string, html: string): Promise<void> {
    this.sent.push({ to, subject, html });
  }
}
