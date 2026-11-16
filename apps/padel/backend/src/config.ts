import { z } from 'zod';

// El UNICO sitio que lee process.env. Se valida al arrancar: si falta algo, la
// app no arranca y dice que falta.
const EnvSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  SMTP_URL: z.url({ protocol: /^smtps?$/ }),
  MONGO_URL: z.url({ protocol: /^mongodb(\+srv)?$/ }),
  REDIS_URL: z.url({ protocol: /^rediss?$/ }),
  // La lee el SDK de OpenTelemetry; se declara aqui para que este fichero sea el unico que mira el entorno.
  OTEL_EXPORTER_OTLP_ENDPOINT: z.url().optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  PORT: z.coerce.number().int().positive().default(3000),
});

export function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    throw new Error(`Configuracion invalida:\n${z.prettifyError(result.error)}`);
  }
  const { DATABASE_URL, SMTP_URL, MONGO_URL, REDIS_URL, OTEL_EXPORTER_OTLP_ENDPOINT, LOG_LEVEL, PORT } = result.data;
  return {
    databaseUrl: DATABASE_URL,
    smtpUrl: SMTP_URL,
    mongoUrl: MONGO_URL,
    redisUrl: REDIS_URL,
    otlpEndpoint: OTEL_EXPORTER_OTLP_ENDPOINT,
    logLevel: LOG_LEVEL,
    port: PORT,
  };
}
