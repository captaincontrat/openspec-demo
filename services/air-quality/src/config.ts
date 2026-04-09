import { z } from "zod";

const configSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3004),
  HOST: z.string().min(1).default("0.0.0.0"),
  OPEN_METEO_BASE_URL: z
    .string()
    .url()
    .default("https://air-quality-api.open-meteo.com/v1"),
  UPSTREAM_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  LOG_LEVEL: z
    .enum(["silent", "error", "warn", "info", "debug", "trace"])
    .default("info"),
});

export interface AppConfig {
  port: number;
  host: string;
  openMeteoBaseUrl: string;
  upstreamTimeoutMs: number;
  logLevel: "silent" | "error" | "warn" | "info" | "debug" | "trace";
}

export function loadConfig(
  env: NodeJS.ProcessEnv = process.env,
): AppConfig {
  const parsed = configSchema.safeParse(env);

  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration: ${parsed.error.message}`,
    );
  }

  return {
    port: parsed.data.PORT,
    host: parsed.data.HOST,
    openMeteoBaseUrl: parsed.data.OPEN_METEO_BASE_URL,
    upstreamTimeoutMs: parsed.data.UPSTREAM_TIMEOUT_MS,
    logLevel: parsed.data.LOG_LEVEL,
  };
}
