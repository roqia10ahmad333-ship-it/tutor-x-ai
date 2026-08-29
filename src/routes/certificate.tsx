import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LinkBtn, Panel, Shell, Tag } from "@/components/ui-kit";
import { buildRoadmap, loadProfile, loadProgress, type Profile, type Progress } from "@/lib/tutorx";

export const Route = createFileRoute("/certificate")({
  component: CertificatePage,
  head: () => ({
    meta: [
      { title: "Skill certificate — TutorX AI" },
      {
        name: "description",
        content:
          "Finish every milestone of your adaptive roadmap and earn a TutorX AI certificate that names the skill you can actually demonstrate.",
      },
      { property: "og:title", content: "Your TutorX AI certificate" },
      { property: "og:description", content: "Proof of a skill you can demonstrate, not a video you watched." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function CertificatePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<Progress>({ done: [], breaks: 0, reexplains: 0 });

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      navigate({ to: "/" });
      return;
    }
    setProfile(p);
    setProgress(loadProgress());
  }, [navigate]);

  const lessons = useMemo(() => (profile ? buildRoadmap(profile).flatMap((m) => m.lessons) : []), [profile]);
  if (!profile) return null;

  const doneCount = lessons.filter((l) => progress.done.includes(l.id)).length;
  const pct = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;
  const earned = pct === 100;

  return (
    <Shell>
      {earned ? (
        <Panel tone="lime" className="text-center">
          <Tag tone="plain">Certificate issued</Tag>
          <h1 className="mt-5 text-4xl font-bold uppercase">{profile.goal}</h1>
          <p className="mt-3 font-display text-lg font-bold">{profile.name}</p>
          <p className="mt-2 text-sm">
            completed every milestone of a roadmap adapted to their age, background, intelligence type and focus
            pattern — including {progress.reexplains} re-explanations in alternative formats.
          </p>
          <p className="label-mono mt-6">
            Issued {new Date().toLocaleDateString()} · TutorX AI · ID {String(profile.createdAt).slice(-8)}
          </p>
        </Panel>
      ) : (
        <Panel>
          <Tag tone="accent">Finish line</Tag>
          <h1 className="mt-4 text-3xl font-bold uppercase sm:text-4xl">
            {lessons.length - doneCount} lessons stand between you and your certificate.
          </h1>
          <div className="brut-sm mt-6 h-5 overflow-hidden rounded-full bg-background">
            <div className="h-full bg-lime transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {doneCount}/{lessons.length} lessons complete ({pct}%). The certificate names the skill you can demonstrate
            — so it only unlocks when the whole roadmap is done.
          </p>
        </Panel>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <LinkBtn to="/dashboard" tone="primary">
          Back to roadmap
        </LinkBtn>
        <LinkBtn to="/interview" tone="plain">
          Re-run the interview
        </LinkBtn>
      </div>
    </Shell>
  );
}
