import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Btn, LinkBtn, Panel, Shell, Tag } from "@/components/ui-kit";
import {
  buildRoadmap,
  FORMAT_LABEL,
  loadProfile,
  loadProgress,
  reexplain,
  saveProgress,
  type Lesson,
  type Profile,
  type Progress,
} from "@/lib/tutorx";

export const Route = createFileRoute("/lesson/$lessonId")({
  component: LessonPage,
  head: () => ({
    meta: [
      { title: "Lesson player — TutorX AI" },
      {
        name: "description",
        content:
          "An adaptive lesson that re-explains itself in a different format every time you get stuck, then checks understanding with a quiz.",
      },
      { property: "og:title", content: "Adaptive lesson player — TutorX AI" },
      { property: "og:description", content: "If it doesn't land, the format changes — not your ability." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function LessonPage() {
  const { lessonId } = Route.useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<Progress>({ done: [], breaks: 0, reexplains: 0 });
  const [attempt, setAttempt] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      navigate({ to: "/" });
      return;
    }
    setProfile(p);
    setProgress(loadProgress());
  }, [navigate]);

  const lesson: Lesson | undefined = useMemo(() => {
    if (!profile) return undefined;
    return buildRoadmap(profile)
      .flatMap((m) => m.lessons)
      .find((l) => l.id === lessonId);
  }, [profile, lessonId]);

  if (!profile || !lesson) return null;

  const done = progress.done.includes(lesson.id);
  const alt = attempt > 0 ? reexplain(lesson, attempt - 1, profile) : null;
  const correct = picked !== null && picked === lesson.quiz.answer;

  const complete = () => {
    const next = { ...progress, done: [...new Set([...progress.done, lesson.id])] };
    setProgress(next);
    saveProgress(next);
  };

  return (
    <Shell>
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone="accent">{FORMAT_LABEL[lesson.formats[0]!]}</Tag>
            <Tag tone="plain">{lesson.minutes} min</Tag>
            {done ? <Tag tone="lime">Completed</Tag> : null}
          </div>
          <h1 className="mt-4 text-3xl font-bold uppercase sm:text-4xl">{lesson.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{lesson.summary}</p>

          <div className="brut-sm mt-6 rounded-xl bg-background p-5">
            <p className="label-mono text-muted-foreground">
              {alt ? `Re-explained as ${FORMAT_LABEL[alt.format]}` : "Main explanation"}
            </p>
            <p className="mt-3 text-sm leading-relaxed">
              {alt
                ? alt.text
                : `Here is "${lesson.title}" the way your profile learns best. Work through it at your own pace — the tutor never moves faster than you do, and every example is grounded in ${profile.background || "everyday situations"}.`}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Btn
              tone="brand"
              onClick={() => {
                setAttempt((a) => a + 1);
                const next = { ...progress, reexplains: progress.reexplains + 1 };
                setProgress(next);
                saveProgress(next);
              }}
            >
              I didn't get it — explain differently
            </Btn>
            <Btn tone="plain" onClick={() => setAttempt(0)}>
              Back to main explanation
            </Btn>
          </div>
        </Panel>

        <Panel tone="plain">
          <p className="label-mono">Understanding check</p>
          <p className="mt-3 font-display text-sm font-bold">{lesson.quiz.question}</p>
          <div className="mt-4 space-y-2">
            {lesson.quiz.options.map((o, i) => {
              const state =
                picked === null ? "bg-background" : i === lesson.quiz.answer ? "bg-lime" : i === picked ? "bg-accent text-accent-foreground" : "bg-background";
              return (
                <button
                  key={o}
                  onClick={() => setPicked(i)}
                  className={`brut-sm press w-full rounded-lg px-3 py-2 text-left text-xs font-bold ${state}`}
                >
                  {o}
                </button>
              );
            })}
          </div>
          {picked !== null ? (
            <>
              <p className="mt-4 text-xs text-muted-foreground">{lesson.quiz.why}</p>
              <Btn
                tone={correct ? "lime" : "primary"}
                className="mt-4 w-full"
                onClick={() => {
                  if (correct) complete();
                  else setAttempt((a) => a + 1);
                }}
              >
                {correct ? "Mark lesson complete" : "Try another explanation"}
              </Btn>
            </>
          ) : null}
        </Panel>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <LinkBtn to="/dashboard" tone="plain">
          Back to roadmap
        </LinkBtn>
        {!done ? (
          <Btn tone="lime" onClick={complete}>
            Mark as done
          </Btn>
        ) : null}
      </div>
    </Shell>
  );
}
