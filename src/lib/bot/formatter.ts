import type { TravelOption } from "./travel";
import type { ParsedQuery } from "./parser";

const MAX_CAST_LENGTH = 1024;

export function formatCastReply(
  options: TravelOption[],
  query: ParsedQuery
): string {
  const origin = options[0].origin.label;
  const dest = options[0].destination.label;

  const header = `✈️ ${origin} -> ${dest}`;
  const dateLine = query.date ? ` | ${formatDate(query.date)}` : "";
  const budgetLine =
    query.budget !== null ? `\n💰 Budget: $${query.budget}` : "";

  const lines = [`${header}${dateLine}${budgetLine}`, ""];

  for (let i = 0; i < options.length; i++) {
    const o = options[i];
    lines.push(`${i + 1}. 🛫 ${o.airline} - $${o.priceUsd} | ${o.stops} | ${o.duration}`);
  }

  if (query.budget !== null) {
    const allWithin = options.every((o) => o.priceUsd <= query.budget!);
    if (allWithin && options.length > 0) {
      lines.push("");
      lines.push(`✅ All ${options.length} options within your $${query.budget} budget`);
    }
  }

  lines.push("");
  lines.push("🤖 Powered by zentrfi");

  let result = lines.join("\n");

  if (result.length > MAX_CAST_LENGTH) {
    result = result.slice(0, MAX_CAST_LENGTH - 3) + "...";
  }

  return result;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
