import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Logo, Tag } from "@/components/ui-kit";
import { DEMO_PROFILE, saveProfile } from "@/lib/tutorx";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "TutorX AI — Adaptive AI-Powered Personalized Learning" },
      {
        name: "description",
        content:
          "TutorX AI interviews you, builds a personalized roadmap, and changes how it teaches when you don't understand. Learn anything, anytime, anywhere.",
      },
      { property: "og:title", content: "TutorX AI — Adaptive Personalized Learning" },
      {
        property: "og:description",
        content: "Education that adapts to the learner, not the learner adapting to education.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function Landing() {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-16">
      <Slash className="left-[8%] top-[6%] bg-primary" />
      <Slash className="right-[10%] top-[18%] bg-accent" />
      <Slash className="bottom-[8%] left-[22%] bg-brand" />
      <Slash className="bottom-[18%] right-[24%] bg-lime" />

      <div className="brut-lg relative z-10 w-full max-w-xl rounded-3xl bg-card p-8 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <Logo className="h-24" />
          <p className="label-mono mt-3 text-muted-foreground">Adaptive learning copilot</p>

          <h1 className="mt-6 text-4xl font-bold uppercase leading-[0.95] sm:text-5xl">
            Learn anything,
            <br />
            <span className="text-accent">anytime, anywhere.</span>
          </h1>

          <p className="mt-5 max-w-md text-sm text-muted-foreground">
            TutorX interviews you first — your age, background, intelligence type and focus — then generates the
            course itself and rewrites how it teaches whenever you don't understand.
          </p>

          <form
            className="mt-8 w-full space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/interview", search: { name: name.trim() || "Learner" } });
            }}
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              aria-label="Your name"
              className="brut w-full rounded-xl bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
            <Btn type="submit" className="w-full py-4 text-base">
              Start the AI interview →
            </Btn>
          </form>

          <button
            onClick={() => {
              saveProfile(DEMO_PROFILE);
              navigate({ to: "/dashboard" });
            }}
            className="brut-sm press mt-3 rounded-lg bg-lime px-4 py-2 font-display text-xs font-bold text-lime-foreground"
          >
            Sign in as Jamie Davis
          </button>

          <p className="label-mono mt-6 text-muted-foreground">Demo data stays locally in this browser.</p>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <Tag tone="plain">Education adapts to the learner — not the reverse</Tag>
      </div>
    </div>
  );
}

function Slash({ className }: { className: string }) {
  return <div className={`absolute h-64 w-28 skew-x-[-24deg] opacity-90 ${className}`} aria-hidden="true" />;
}
