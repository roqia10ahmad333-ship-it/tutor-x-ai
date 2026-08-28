import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Btn, Logo, Panel, Tag } from "@/components/ui-kit";
import { INTELLIGENCES, saveProfile, type Intelligence, type Profile } from "@/lib/tutorx";

export const Route = createFileRoute("/interview")({
  component: Interview,
  validateSearch: (search: Record<string, unknown>) => ({
    name: typeof search["name"] === "string" ? (search["name"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "AI Interview — TutorX AI" },
      {
        name: "description",
        content:
          "Talk to the TutorX tutor: it learns your age, background, intelligence type, focus pattern and goal before a single lesson exists.",
      },
      { property: "og:title", content: "AI Interview — TutorX AI" },
      { property: "og:description", content: "Your Personal Learning Profile starts with a conversation." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/interview" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/interview" }],
  }),
});

type Turn = { who: "ai" | "me"; text: string };

type Draft = Partial<Profile> & { name: string };

const STEPS = [
  "name",
  "age",
  "background",
  "goal",
  "level",
  "intelligence",
  "focus",
  "mode",
  "done",
] as const;
type Step = (typeof STEPS)[number];

function question(step: Step, d: Draft): string {
  switch (step) {
    case "name":
      return "Hi — I'm TutorX. Before anything else: what should I call you?";
    case "age":
      return `Good to meet you, ${d.name}. How old are you? A 10-year-old and a 40-year-old should never get the same explanation.`;
    case "background":
      return "What's your background — study, job, or what you already spend your time on? I'll pull examples from there.";
    case "goal":
      return "What do you want to be able to do? Say the skill, not a course name.";
    case "level":
      return `And where are you with ${d.goal ?? "it"} right now?`;
    case "intelligence":
      return "Everyone has a different kind of intelligence. Which one sounds most like how things click for you?";
    case "focus":
      return "Last honest question — how does your attention usually behave while studying?";
    case "mode":
      return "Learning alone, or with a team on a shared project?";
    default:
      return "That's everything I need. Building your Personal Learning Profile and roadmap now…";
  }
}

function Interview() {
  const navigate = useNavigate();
  const { name: preset } = Route.useSearch();
  const [draft, setDraft] = useState<Draft>({ name: preset });
  const [step, setStep] = useState<Step>(preset ? "age" : "name");
  const [log, setLog] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLog((l) => {
      const q = question(step, draft);
      if (l.length && l[l.length - 1]?.who === "ai" && l[l.length - 1]?.text === q) return l;
      return [...l, { who: "ai", text: q }];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [log]);

  const answer = (value: string, patch: Partial<Draft>, next: Step) => {
    setLog((l) => [...l, { who: "me", text: value }]);
    setDraft((d) => ({ ...d, ...patch }));
    setText("");
    setTimeout(() => setStep(next), 220);
  };

  useEffect(() => {
    if (step !== "done") return;
    const profile: Profile = {
      name: draft.name || "Learner",
      age: draft.age ?? 22,
      background: draft.background ?? "",
      goal: draft.goal ?? "a new skill",
      level: draft.level ?? "new",
      intelligence: draft.intelligence ?? "visual",
      focus: draft.focus ?? "steady",
      language: "en",
      mode: draft.mode ?? "solo",
      createdAt: Date.now(),
    };
    saveProfile(profile);
    const t = setTimeout(() => navigate({ to: "/dashboard" }), 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const textStep = step === "name" || step === "background" || step === "goal" || step === "age";

  return (
    <div className="min-h-screen px-5 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Logo />
          <Tag tone="accent">Live interview</Tag>
        </div>

        <Panel className="flex h-[62vh] flex-col gap-4 overflow-y-auto bg-background">
          {log.map((t, i) => (
            <div key={i} className={t.who === "ai" ? "flex gap-3" : "flex justify-end gap-3"}>
              {t.who === "ai" && (
                <div className="brut-sm label-mono grid size-9 shrink-0 place-items-center rounded-full bg-brand font-bold text-brand-foreground">
                  AI
                </div>
              )}
              <p
                className={`brut-sm max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  t.who === "ai" ? "bg-card" : "bg-primary text-primary-foreground"
                }`}
              >
                {t.text}
              </p>
            </div>
          ))}
          <div ref={endRef} />
        </Panel>

        <div className="mt-5">
          {textStep && (
            <form
              className="flex gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                const v = text.trim();
                if (!v) return;
                if (step === "name") answer(v, { name: v }, "age");
                else if (step === "age") answer(v, { age: Math.max(5, Math.min(99, parseInt(v, 10) || 22)) }, "background");
                else if (step === "background") answer(v, { background: v }, "goal");
                else answer(v, { goal: v }, "level");
              }}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                inputMode={step === "age" ? "numeric" : "text"}
                placeholder="Type your answer…"
                aria-label="Your answer"
                className="brut w-full rounded-xl bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <Btn type="submit">Send</Btn>
            </form>
          )}

          {step === "level" && (
            <Choices
              options={[
                ["new", "Complete beginner"],
                ["some", "I've dabbled a bit"],
                ["experienced", "Experienced — skip the basics"],
              ]}
              onPick={(v, label) => answer(label, { level: v as Profile["level"] }, "intelligence")}
            />
          )}

          {step === "intelligence" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {INTELLIGENCES.map((it) => (
                <button
                  key={it.id}
                  onClick={() => answer(it.label, { intelligence: it.id as Intelligence }, "focus")}
                  className="brut-sm press rounded-xl bg-card p-4 text-left"
                >
                  <p className="font-display text-sm font-bold">{it.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{it.blurb}</p>
                </button>
              ))}
            </div>
          )}

          {step === "focus" && (
            <Choices
              options={[
                ["steady", "I can sit and focus for a long stretch"],
                ["hyperactive", "I fidget — I need to move often"],
                ["distracted", "My mind drifts after a few minutes"],
              ]}
              onPick={(v, label) => answer(label, { focus: v as Profile["focus"] }, "mode")}
            />
          )}

          {step === "mode" && (
            <Choices
              options={[
                ["solo", "Just me"],
                ["team", "With a team on a project"],
              ]}
              onPick={(v, label) => answer(label, { mode: v as Profile["mode"] }, "done")}
            />
          )}

          {step === "done" && (
            <Panel tone="lime" className="text-center">
              <p className="font-display font-bold">Generating your roadmap…</p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function Choices({
  options,
  onPick,
}: {
  options: [string, string][];
  onPick: (value: string, label: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onPick(v, label)}
          className="brut-sm press rounded-xl bg-card px-4 py-3 font-display text-sm font-bold"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
