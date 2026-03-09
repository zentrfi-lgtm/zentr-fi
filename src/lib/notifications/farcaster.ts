type NotificationToken = { token: string; url: string };

export async function sendFarcasterNotification(
  tokenInfo: NotificationToken,
  title: string,
  body: string,
  targetUrl: string,
): Promise<boolean> {
  try {
    const response = await fetch(tokenInfo.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notificationId: crypto.randomUUID(),
        title,
        body,
        targetUrl,
        tokens: [tokenInfo.token],
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
