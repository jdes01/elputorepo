import { z } from 'zod';

// El UNICO sitio que lee process.env. Se valida al arrancar: si falta algo, la
// app no arranca y dice que falta.
const EnvSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  SMTP_URL: z.url({ protocol: /^smtps?$/ }),
  PORT: z.coerce.number().int().positive().default(3000),
});

export function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    throw new Error(`Configuracion invalida:\n${z.prettifyError(result.error)}`);
  }
  return { databaseUrl: result.data.DATABASE_URL, smtpUrl: result.data.SMTP_URL, port: result.data.PORT };
}
