"use client";

import * as React from "react";

export function AirplaneIcon({
  className,
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 34.5h13.8l10.2 19.2c.6 1.1 1.7 1.8 3 1.8h4.2l-6.6-22.8H53c2.8 0 5-2.2 5-5s-2.2-5-5-5H31.6l6.6-22.8H34c-1.3 0-2.4.7-3 1.8L20.8 21.5H7c-1.4 0-2.5 1.1-2.5 2.5v8c0 1.4 1.1 2.5 2.5 2.5Z"
        fill={color}
        fillOpacity="0.92"
      />
    </svg>
  );
}

