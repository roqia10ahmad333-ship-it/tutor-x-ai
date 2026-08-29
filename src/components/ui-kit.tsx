import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import logo from "@/assets/tutorx-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return <img src={logo.url} alt="TutorX AI" className={cn("h-14 w-auto object-contain object-left", className)} />;
}

type Tone = "primary" | "accent" | "lime" | "brand" | "plain";

const TONES: Record<Tone, string> = {
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  lime: "bg-lime text-lime-foreground",
  brand: "bg-brand text-brand-foreground",
  plain: "bg-card text-card-foreground",
};

export function Btn({
  tone = "primary",
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  return (
    <button
      {...rest}
      className={cn(
        "brut press inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-display text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50",
        TONES[tone],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function LinkBtn({
  to,
  tone = "primary",
  className,
  children,
}: {
  to: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "brut press inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-display text-sm font-bold",
        TONES[tone],
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Panel({
  className,
  children,
  tone = "plain",
}: {
  className?: string;
  children: ReactNode;
  tone?: Tone;
}) {
  return <div className={cn("brut rounded-2xl p-6", TONES[tone], className)}>{children}</div>;
}

export function Tag({ children, tone = "lime" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={cn("brut-sm label-mono inline-block rounded-full px-3 py-1 font-bold", TONES[tone])}>
      {children}
    </span>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="brut sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 rounded-none border-x-0 border-t-0 bg-card px-5 py-3 shadow-none">
        <Link to="/dashboard" className="flex items-center gap-3">
          <Logo />
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          <NavItem to="/dashboard">Roadmap</NavItem>
          <NavItem to="/team">Team</NavItem>
          <NavItem to="/certificate">Certificate</NavItem>
          <NavItem to="/interview">Re-interview</NavItem>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-5 py-10">{children}</main>
      <footer className="mx-auto w-full max-w-6xl px-5 pb-12">
        <p className="label-mono text-muted-foreground">
          Education that adapts to the learner — demo data stays locally in this browser.
        </p>
      </footer>
    </div>
  );
}

function NavItem({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      activeProps={{ className: "bg-primary" }}
      className="brut-sm rounded-lg bg-card px-3 py-2 font-display text-xs font-bold"
    >
      {children}
    </Link>
  );
}
