"use client";

import { signOut } from "next-auth/react";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export function LogoutButton({ className, children }: Props) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={className}
    >
      {children ?? "Log out"}
    </button>
  );
}
