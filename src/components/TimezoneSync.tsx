"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TZ_OFFSET_COOKIE } from "@/lib/timezone-cookie";

function readCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

export function TimezoneSync() {
  const router = useRouter();

  useEffect(() => {
    const offset = String(new Date().getTimezoneOffset());
    if (readCookie(TZ_OFFSET_COOKIE) === offset) return;
    document.cookie = `${TZ_OFFSET_COOKIE}=${offset}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);

  return null;
}
