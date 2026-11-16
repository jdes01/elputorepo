import { describe, expect, it } from 'vitest';
import { loadConfig } from './config';

const base = {
  DATABASE_URL: 'postgres://u:p@localhost:5432/padel',
  SMTP_URL: 'smtp://localhost:1025',
  MONGO_URL: 'mongodb://localhost:27017/padel',
  REDIS_URL: 'redis://localhost:6379',
};

describe('loadConfig', () => {
  it('sin colector de OpenTelemetry la config es valida y no hay endpoint', () => {
    expect(loadConfig(base).otlpEndpoint).toBeUndefined();
  });

  it('con colector, lo devuelve', () => {
    const config = loadConfig({ ...base, OTEL_EXPORTER_OTLP_ENDPOINT: 'http://localhost:4318' });

    expect(config.otlpEndpoint).toBe('http://localhost:4318');
  });

  it('un endpoint que no es una URL no arranca', () => {
    expect(() => loadConfig({ ...base, OTEL_EXPORTER_OTLP_ENDPOINT: 'localhost' })).toThrow(
      'OTEL_EXPORTER_OTLP_ENDPOINT',
    );
  });
});
