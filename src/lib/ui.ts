export const CARD = "rounded-2xl border border-neutral-200 bg-white shadow-sm p-6";

export const INPUT =
  "rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-shadow focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50";

export const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50";

export const BTN_GHOST =
  "inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900";

export const ICON_BTN =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900";

export function pillClass(active: boolean) {
  return `inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
    active ? "bg-neutral-900 text-white" : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
  }`;
}
