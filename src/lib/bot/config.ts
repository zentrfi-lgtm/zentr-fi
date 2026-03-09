function env(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

export const botConfig = {
  neynarApiKey: () => env("NEYNAR_API_KEY"),
  botSignerUuid: () => env("BOT_SIGNER_UUID"),
  anthropicApiKey: () => env("ANTHROPIC_API_KEY"),
  webhookSecret: () => env("NEYNAR_WEBHOOK_SECRET"),
};
