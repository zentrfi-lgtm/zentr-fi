"use client";

import * as React from "react";
import Image from "next/image";
import { cx } from "@/src/lib/cx";

export function AgentCard({
  title,
  description,
  accentClassName,
  imageSrc,
}: {
  title: string;
  description: string;
  accentClassName?: string;
  imageSrc?: string;
}) {
  const [imgFailed, setImgFailed] = React.useState(false);
  const fallbackSrc =
    title === "Scout"
      ? "/agents/agent-scout.svg"
      : title === "Logician"
        ? "/agents/agent-logician.svg"
        : title === "Auditor"
          ? "/agents/agent-auditor.svg"
          : "/agents/agent-negotiator.svg";

  return (
    <div className="group rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-[color:var(--panel-strong)]">
      <div className="flex items-start justify-between gap-4">
        <div className={cx("text-black/90", accentClassName)}>
          <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white">
            {imageSrc && !imgFailed ? (
              // These lovable.app asset links redirect to an auth bridge (302) and may not be public.
              // If they fail, we fallback to local placeholders.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt={`${title} agent`}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <Image
                src={fallbackSrc}
                alt={`${title} agent`}
                height={44}
                width={44}
                className="object-cover"
              />
            )}
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-plane h-6 w-6 text-primary"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>
      </div>
      <div className="mt-4 font-[family-name:var(--font-kanit)] text-lg text-black">
        {title}
      </div>
      <div className="mt-1 text-sm leading-6 text-black/70">{description}</div>
    </div>
  );
}

