import { botConfig } from "./config";

const NEYNAR_API_BASE = "https://api.neynar.com/v2/farcaster";

const encoder = new TextEncoder();

function neynarPost(body: Record<string, unknown>) {
  return fetch(`${NEYNAR_API_BASE}/cast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-api-key": botConfig.neynarApiKey(),
    },
    body: encoder.encode(JSON.stringify(body)),
  });
}

export async function replyCast(
  parentHash: string,
  text: string,
  embeds?: Array<{ url: string }>,
): Promise<void> {
  const body: Record<string, unknown> = {
    signer_uuid: botConfig.botSignerUuid(),
    text,
    parent: parentHash,
  };
  if (embeds?.length) body.embeds = embeds;

  const response = await neynarPost(body);

  if (!response.ok) {
    const resBody = await response.text();
    throw new Error(`Neynar cast failed (${response.status}): ${resBody}`);
  }

  const data = await response.json();
  console.log(`[caster] Reply posted: hash=${data.cast?.hash ?? "unknown"}`);
}

export async function postCast(
  text: string,
  embeds?: Array<{ url: string }>,
  channelId?: string,
): Promise<string> {
  const body: Record<string, unknown> = {
    signer_uuid: botConfig.botSignerUuid(),
    text,
  };
  if (embeds?.length) body.embeds = embeds;
  if (channelId) body.channel_id = channelId;

  const response = await neynarPost(body);

  if (!response.ok) {
    const resBody = await response.text();
    throw new Error(`Neynar cast failed (${response.status}): ${resBody}`);
  }

  const data = await response.json();
  const hash = data.cast?.hash ?? "unknown";
  console.log(`[caster] Cast posted: hash=${hash}`);
  return hash;
}
