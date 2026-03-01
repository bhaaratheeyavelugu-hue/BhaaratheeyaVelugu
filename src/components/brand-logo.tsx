"use client";

import Link from "next/link";
import { useState } from "react";

const SITE_NAME = "Bhaaratheeya velugu";

type Props = {
  href?: string | null;
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  /** When false, render as div (e.g. when wrapping in your own Link) */
  asLink?: boolean;
};

const sizes = {
  sm: { w: 32, h: 32, text: "text-lg", class: "max-h-8 max-w-8 w-8 h-8" },
  md: { w: 40, h: 40, text: "text-xl", class: "max-h-10 max-w-10 w-10 h-10" },
  lg: { w: 56, h: 56, text: "text-2xl", class: "max-h-14 max-w-14 w-14 h-14" },
};

export function BrandLogo({ href = "/", className = "", showText = true, size = "md", asLink = true }: Props) {
  const [logoError, setLogoError] = useState(false);
  const s = sizes[size];

  const content = (
    <>
      {!logoError && (
        <img
          src="/logo.png"
          alt=""
          width={s.w}
          height={s.h}
          className={`shrink-0 object-contain ${s.class}`}
          style={{ maxWidth: s.w, maxHeight: s.h, width: s.w, height: s.h }}
          onError={() => setLogoError(true)}
        />
      )}
      {showText && (
        <span className={`font-logo font-black tracking-tight text-gray-900 ${s.text} overflow-visible leading-[1.2] pb-0.5`}>
          {SITE_NAME}
        </span>
      )}
    </>
  );

  const wrap = (x: React.ReactNode) =>
    asLink && href ? (
      <Link href={href} className={`flex items-center gap-2 ${className}`}>
        {x}
      </Link>
    ) : (
      <div className={`flex items-center gap-2 ${className}`}>{x}</div>
    );

  return wrap(content);
}

export { SITE_NAME };
