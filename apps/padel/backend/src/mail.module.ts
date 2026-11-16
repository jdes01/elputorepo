import { Global, Injectable, Module } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { loadConfig } from './config';

@Injectable()
export class Mailer {
  private readonly transport = createTransport(loadConfig().smtpUrl);

  async send(to: string, subject: string, html: string): Promise<void> {
    await this.transport.sendMail({ from: 'reservas@padel.local', to, subject, html });
  }
}

// Un servidor de correo para toda la app. Global: cualquier service pide el Mailer en su constructor.
@Global()
@Module({ providers: [Mailer], exports: [Mailer] })
export class MailModule {}
