import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Btn, LinkBtn, Panel, Shell, Tag } from "@/components/ui-kit";
import { buildRoadmap, INTELLIGENCES, loadProfile, type Profile } from "@/lib/tutorx";

export const Route = createFileRoute("/team")({
  component: TeamPage,
  head: () => ({
    meta: [
      { title: "Team learning — TutorX AI" },
      {
        name: "description",
        content:
          "Learn the same skill together while each teammate keeps their own format, pace and difficulty — with shared milestones and a group project.",
      },
      { property: "og:title", content: "Team learning — TutorX AI" },
      { property: "og:description", content: "One shared goal, one adapted path per person." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const MATES = [
  { name: "Nour", age: 16, intelligence: "visual", pace: "Fast, visual-first", progress: 72 },
  { name: "Karim", age: 31, intelligence: "kinesthetic", pace: "Hands-on, short bursts", progress: 48 },
  { name: "Salma", age: 24, intelligence: "verbal", pace: "Discussion-led", progress: 61 },
] as const;

function TeamPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!p) navigate({ to: "/" });
    else setProfile(p);
  }, [navigate]);

  const roadmap = useMemo(() => (profile ? buildRoadmap(profile) : []), [profile]);
  if (!profile) return null;

  return (
    <Shell>
      <Panel>
        <Tag tone="brand">Team learning</Tag>
        <h1 className="mt-4 text-3xl font-bold uppercase sm:text-4xl">
          Same goal. Four different brains. Four different paths.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Your group is learning <strong>{profile.goal}</strong> together. Everyone sees the same milestones, but the
          lesson format, difficulty and pace are rebuilt per person — so nobody is bored and nobody is left behind.
        </p>
      </Panel>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Panel tone="lime">
          <p className="label-mono">You</p>
          <h2 className="mt-2 text-xl font-bold">{profile.name}</h2>
          <p className="mt-1 text-xs">
            {INTELLIGENCES.find((i) => i.id === profile.intelligence)!.label} · age {profile.age}
          </p>
          <p className="mt-3 text-sm">
            You lead the {roadmap[0]?.title.split(" — ")[0]?.toLowerCase()} stage for the group.
          </p>
        </Panel>
        {MATES.map((m) => (
          <Panel key={m.name}>
            <p className="label-mono text-muted-foreground">Teammate</p>
            <h2 className="mt-2 text-xl font-bold">{m.name}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {INTELLIGENCES.find((i) => i.id === m.intelligence)!.label} · age {m.age} · {m.pace}
            </p>
            <div className="brut-sm mt-4 h-4 overflow-hidden rounded-full bg-background">
              <div className="h-full bg-primary" style={{ width: `${m.progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{m.progress}% of the shared roadmap</p>
          </Panel>
        ))}
      </section>

      <Panel className="mt-8" tone="plain">
        <p className="label-mono">Group project</p>
        <h2 className="mt-2 text-xl font-bold">Build one thing together in {profile.goal}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Each teammate owns the part that fits their strength. The tutor coaches each of you privately, then reviews the
          combined result as one piece of work.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Btn tone="accent">Start a group session</Btn>
          <LinkBtn to="/dashboard" tone="plain">
            Back to my roadmap
          </LinkBtn>
        </div>
      </Panel>
    </Shell>
  );
}
