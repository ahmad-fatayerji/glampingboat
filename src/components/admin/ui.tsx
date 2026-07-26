import Link from "next/link";
import type { ReactNode } from "react";
import { IconArrowRight, IconInbox } from "./icons";

/**
 * Shared admin presentation primitives. Every admin page composes these so
 * spacing, radii and tone stay consistent across the panel.
 */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  backLink,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  backLink?: { href: string; label: string };
}) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {backLink ? (
          <Link
            href={backLink.href}
            className="admin-link mb-3 inline-flex items-center gap-1.5 text-sm"
          >
            <span className="text-base">&larr;</span>
            {backLink.label}
          </Link>
        ) : null}
        <p className="admin-eyebrow">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight">{title}</h1>
        {description ? (
          <p className="admin-muted mt-2 max-w-2xl text-sm leading-relaxed">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function Panel({
  title,
  description,
  href,
  openLabel,
  actions,
  children,
  padding = "normal",
}: {
  title?: string;
  description?: string;
  href?: string;
  openLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
  padding?: "normal" | "flush";
}) {
  const hasHeader = Boolean(title || actions || href);

  return (
    <section className="admin-surface flex flex-col overflow-hidden">
      {hasHeader ? (
        <div
          className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-[var(--admin-line)] ${
            padding === "flush" ? "px-4 py-3.5" : "px-5 py-4"
          }`}
        >
          <div className="min-w-0">
            {title ? <h2 className="text-lg font-medium leading-tight">{title}</h2> : null}
            {description ? (
              <p className="admin-muted mt-1 text-xs leading-relaxed">{description}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {actions}
            {href && openLabel ? (
              <Link href={href} className="admin-link inline-flex items-center gap-1 text-sm">
                {openLabel}
                <IconArrowRight className="button-arrow-icon text-[0.9em]" />
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className={padding === "flush" ? "" : "flex-1 p-5"}>{children}</div>
    </section>
  );
}

export function Metric({
  label,
  value,
  icon,
  tone,
  hint,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: "warn" | "ok";
  hint?: string;
}) {
  const toneClass =
    tone === "warn"
      ? "admin-pill-warn"
      : tone === "ok"
        ? "admin-pill-ok"
        : "border-[var(--admin-line)] bg-[rgba(228,219,206,0.08)] text-[var(--admin-ink)]";

  return (
    <div className="admin-surface flex items-start gap-4 p-5">
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-[var(--admin-radius-sm)] border text-lg ${toneClass}`}
        aria-hidden
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="admin-eyebrow">{label}</p>
        <p className="mt-2 text-2xl font-semibold leading-none tabular-nums">{value}</p>
        {hint ? <p className="admin-muted mt-1.5 text-xs">{hint}</p> : null}
      </div>
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "blue" | "ok" | "warn";
}) {
  const toneClass =
    tone === "ok"
      ? "admin-pill-ok"
      : tone === "warn"
        ? "admin-pill-warn"
        : tone === "blue"
          ? "admin-pill-blue"
          : "admin-pill";

  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium leading-none ${toneClass}`}
    >
      {children}
    </span>
  );
}

export function Info({
  label,
  value,
  href,
  mono,
}: {
  label: string;
  value: string;
  href?: string;
  mono?: boolean;
}) {
  const valueClass = `break-words text-sm ${mono ? "font-mono" : ""}`;

  return (
    <div className="min-w-0">
      <p className="admin-eyebrow">{label}</p>
      <p className="mt-1.5">
        {href ? (
          <Link href={href} className={`admin-link ${valueClass}`}>
            {value}
          </Link>
        ) : (
          <span className={valueClass}>{value}</span>
        )}
      </p>
    </div>
  );
}

export function EmptyState({ label, icon }: { label: string; icon?: ReactNode }) {
  return (
    <div className="grid place-items-center gap-2 rounded-[var(--admin-radius-sm)] border border-dashed border-[var(--admin-line)] px-4 py-10 text-center">
      <span className="admin-muted text-2xl" aria-hidden>
        {icon ?? <IconInbox />}
      </span>
      <p className="admin-muted text-sm">{label}</p>
    </div>
  );
}

/** Definition-list row used inside dense side panels. */
export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-[var(--admin-line)] pb-2 last:border-0 last:pb-0">
      <span className="admin-muted text-xs uppercase tracking-wider">{label}</span>
      <span className="break-words text-sm">{value}</span>
    </div>
  );
}
