"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/calendar", label: "Calendar" },
  { href: "/workouts", label: "Workouts" },
  { href: "/progress", label: "Progress" },
  { href: "/nutrition", label: "Nutrition" },
  { href: "/foods", label: "Foods" },
  { href: "/profile", label: "Profile" },
];

export function NavBar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-neutral-300 bg-white/95 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <span className="font-bold text-emerald-600">Macrofit</span>
          <nav className="hidden sm:flex gap-1">
            {LINKS.map((link) => {
              const active = pathname === link.href || pathname?.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    active ? "bg-emerald-600 text-white" : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-600 hidden sm:inline">{userName}</span>
          <button
            onClick={handleLogout}
            className="text-sm rounded-md px-3 py-1.5 border border-neutral-300 hover:bg-neutral-100 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
      <nav className="sm:hidden flex gap-1 overflow-x-auto px-4 pb-2">
        {LINKS.map((link) => {
          const active = pathname === link.href || pathname?.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
                active ? "bg-emerald-600 text-white" : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
