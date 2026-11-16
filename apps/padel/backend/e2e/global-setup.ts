import { spawn } from 'node:child_process';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { GenericContainer, Wait } from 'testcontainers';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
  export interface ProvidedContext {
    apiUrl: string;
    mailpitUrl: string;
  }
}

// Caja negra de verdad: un postgres y un servidor de correo de usar y tirar, y la app COMPILADA
// (dist/main.js) arrancada como proceso aparte. El test solo habla HTTP, asi
// que sobrevive a cualquier refactor de dentro, incluso a cambiar de framework.
// El precio es la velocidad: contenedor + arranque de la app en cada ejecucion.
export default async function setup(project: TestProject) {
  const pg = await new PostgreSqlContainer('postgres:17-alpine').start();
  // Listo cuando lo dice Mailpit (/readyz), no cuando su puerto acepta conexiones.
  const mailpit = await new GenericContainer('axllent/mailpit:v1.27')
    // Sin DNS inverso: si la red de docker no resuelve, Mailpit tarda segundos en saludar.
    .withEnvironment({ MP_SMTP_DISABLE_RDNS: 'true' })
    .withExposedPorts(1025, 8025)
    .withWaitStrategy(Wait.forHttp('/readyz', 8025))
    .start();

  const port = '3999';
  const app = spawn('node', ['dist/main.js'], {
    env: {
      ...process.env,
      DATABASE_URL: pg.getConnectionUri(),
      SMTP_URL: `smtp://${mailpit.getHost()}:${mailpit.getMappedPort(1025)}`,
      PORT: port,
    },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  let stderr = '';
  app.stderr.on('data', (chunk) => (stderr += chunk));

  const apiUrl = `http://localhost:${port}`;
  await waitUntilUp(
    apiUrl,
    () => app.exitCode !== null,
    () => stderr,
  );
  project.provide('apiUrl', apiUrl);
  project.provide('mailpitUrl', `http://${mailpit.getHost()}:${mailpit.getMappedPort(8025)}`);

  return async () => {
    app.kill();
    await pg.stop();
    await mailpit.stop();
  };
}

// Sondeo: cada intento ESPERA al anterior a proposito, no se puede paralelizar.
/* oxlint-disable no-await-in-loop */
async function waitUntilUp(url: string, exited: () => boolean, stderr: () => string) {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (exited()) throw new Error(`la app no arranco:\n${stderr()}`);
    try {
      await fetch(`${url}/clubs`);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  throw new Error(`la app no respondio en 20 s:\n${stderr()}`);
}
