import { Global, Injectable, Module } from '@nestjs/common';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import { createTransport } from 'nodemailer';
import { loadConfig } from '../../config';
import { Mailer } from '../application/mailer';

@Injectable()
export class NodemailerMailer extends Mailer {
  private readonly transport = createTransport(loadConfig().smtpUrl);

  async send(to: string, subject: string, html: string): Promise<void> {
    // Un span propio: nodemailer no esta instrumentado y asi se ve cuanto tarda el SMTP.
    // Sin SDK arrancado, la API de OpenTelemetry no hace nada.
    await trace.getTracer('padel').startActiveSpan('smtp.send', async (span) => {
      try {
        await this.transport.sendMail({ from: 'reservas@padel.local', to, subject, html });
      } catch (error) {
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw error;
      } finally {
        span.end();
      }
    });
  }
}

// Un servidor de correo para toda la app. Global: cualquier caso de uso pide el Mailer en su constructor.
@Global()
@Module({ providers: [{ provide: Mailer, useClass: NodemailerMailer }], exports: [Mailer] })
export class MailModule {}
