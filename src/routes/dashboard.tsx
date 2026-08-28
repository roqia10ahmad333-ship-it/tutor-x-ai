import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Btn, LinkBtn, Panel, Tag } from "@/components/ui-kit";
import { Shell } from "@/components/ui-kit";
import {
  buildRoadmap,
  FORMAT_LABEL,
  INTELLIGENCES,
  loadProfile,
  loadProgress,
  nudgeFor,
  saveProgress,
  type Profile,
  type Progress,
} from "@/lib/tutorx";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Your roadmap — TutorX AI" },
      {
        name: "description",
        content:
          "A roadmap generated for your age, background, intelligence type and focus pattern — with lesson formats that change when you get stuck.",
      },
      { property: "og:title", content: "Your personalized roadmap — TutorX AI" },
      { property: "og:description", content: "Same skill never means the same course." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/dashboard" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/dashboard" }],
  }),
});

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<Progress>({ done: [], breaks: 0, reexplains: 0 });
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      navigate({ to: "/" });
      return;
    }
    setProfile(p);
    setProgress(loadProgress());
  }, [navigate]);

  useEffect(() => {
    const t = setInterval(() => setMinutes((m) => m + 1), 20000);
    return () => clearInterval(t);
  }, []);

  const roadmap = useMemo(() => (profile ? buildRoadmap(profile) : []), [profile]);
  const all = roadmap.flatMap((m) => m.lessons);
  const doneCount = all.filter((l) => progress.done.includes(l.id)).length;
  const pct = all.length ? Math.round((doneCount / all.length) * 100) : 0;
  const totalMin = all.reduce((s, l) => s + l.minutes, 0);
  const nudge = profile ? nudgeFor(profile, minutes) : null;

  if (!profile) return null;

  const intel = INTELLIGENCES.find((i) => i.id === profile.intelligence)!;

  return (
    <Shell>
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" tone="plain">
          <Tag tone="accent">Personal learning profile</Tag>
          <h1 className="mt-4 text-3xl font-bold uppercase sm:text-4xl">
            {profile.name}, here's the path built only for you.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Goal: <strong>{profile.goal}</strong> · Age {profile.age} · Coming from {profile.background || "no stated background"} ·{" "}
            {profile.level === "new" ? "Starting fresh" : profile.level === "some" ? "Some experience" : "Experienced — basics skipped"}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Tag>{intel.label}</Tag>
            <Tag tone="brand">
              {profile.focus === "steady" ? "Steady focus" : profile.focus === "hyperactive" ? "High movement need" : "Attention drifts"}
            </Tag>
            <Tag tone="primary">{profile.mode === "team" ? "Team learning" : "Solo learning"}</Tag>
          </div>
          <div className="mt-6">
            <div className="flex items-baseline justify-between">
              <span className="label-mono">Roadmap progress</span>
              <span className="font-display text-2xl font-bold">{pct}%</span>
            </div>
            <div className="brut-sm mt-2 h-5 overflow-hidden rounded-full bg-background p-0">
              <div className="h-full bg-lime transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {doneCount}/{all.length} lessons · about {Math.round(totalMin / 60)}h total · {progress.reexplains} re-explanations
              requested · {progress.breaks} coached breaks
            </p>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel tone="brand">
            <p className="label-mono">Live coach</p>
            {nudge ? (
              <>
                <p className="mt-3 text-sm">{nudge.text}</p>
                <Btn
                  tone="lime"
                  className="mt-4"
                  onClick={() => {
                    const next = { ...progress, breaks: progress.breaks + 1 };
                    setProgress(next);
                    saveProgress(next);
                    setMinutes(0);
                  }}
                >
                  {nudge.action}
                </Btn>
              </>
            ) : (
              <p className="mt-3 text-sm">
                Watching your session ({minutes} min focused). I'll step in the moment your attention pattern says you need
                a different rhythm.
              </p>
            )}
          </Panel>

          <Panel>
            <p className="label-mono">Formats picked for you</p>
            <ul className="mt-3 space-y-2 text-sm">
              {(profile ? buildRoadmap(profile)[0]!.lessons[0]!.formats : []).map((f) => (
                <li key={f} className="brut-sm rounded-lg bg-background px-3 py-2 font-display text-xs font-bold">
                  {FORMAT_LABEL[f]}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">{intel.blurb}</p>
          </Panel>
        </div>
      </div>

      <section className="mt-10 space-y-6">
        <h2 className="text-2xl font-bold uppercase">Your roadmap</h2>
        {roadmap.map((m, mi) => (
          <Panel key={m.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="label-mono text-muted-foreground">Milestone {String(mi + 1).padStart(2, "0")}</p>
                <h3 className="mt-1 text-xl font-bold">{m.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{m.intent}</p>
              </div>
              <Tag tone={m.lessons.every((l) => progress.done.includes(l.id)) ? "lime" : "plain"}>
                {m.lessons.filter((l) => progress.done.includes(l.id)).length}/{m.lessons.length} done
              </Tag>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {m.lessons.map((l) => {
                const done = progress.done.includes(l.id);
                return (
                  <Link
                    key={l.id}
                    to="/lesson/$lessonId"
                    params={{ lessonId: l.id }}
                    className={`brut-sm press rounded-xl p-4 ${done ? "bg-lime" : "bg-background"}`}
                  >
                    <p className="label-mono">{done ? "Completed" : `${l.minutes} min`}</p>
                    <p className="mt-2 font-display text-sm font-bold">{l.title}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{FORMAT_LABEL[l.formats[0]!]}</p>
                  </Link>
                );
              })}
            </div>
          </Panel>
        ))}
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <LinkBtn to="/team" tone="accent">
          Open team learning
        </LinkBtn>
        <LinkBtn to="/certificate" tone="lime">
          {pct === 100 ? "Claim your certificate" : "See the finish line"}
        </LinkBtn>
      </div>
    </Shell>
  );
}
