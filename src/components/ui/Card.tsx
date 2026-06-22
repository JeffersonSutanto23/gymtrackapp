import { CARD } from "@/lib/ui";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`${CARD} ${className}`}>{children}</section>;
}
