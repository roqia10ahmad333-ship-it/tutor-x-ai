// TutorX AI — local adaptive-learning engine (demo data stays in this browser).

export type Intelligence =
  | "visual"
  | "logical"
  | "verbal"
  | "kinesthetic"
  | "musical"
  | "social";

export type FocusProfile = "steady" | "hyperactive" | "distracted";

export type LessonFormat = "story" | "video" | "game" | "practice" | "quiz" | "live";

export type Profile = {
  name: string;
  age: number;
  background: string;
  goal: string;
  level: "new" | "some" | "experienced";
  intelligence: Intelligence;
  focus: FocusProfile;
  language: "en" | "ar";
  mode: "solo" | "team";
  createdAt: number;
};

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  formats: LessonFormat[];
  quiz: { question: string; options: string[]; answer: number; why: string };
};

export type Module = {
  id: string;
  title: string;
  intent: string;
  lessons: Lesson[];
};

export type Progress = {
  done: string[];
  breaks: number;
  reexplains: number;
};

export const STORAGE_KEY = "tutorx.profile";
export const PROGRESS_KEY = "tutorx.progress";

export const INTELLIGENCES: { id: Intelligence; label: string; blurb: string }[] = [
  { id: "visual", label: "Visual / spatial", blurb: "Diagrams, colour, layout, seeing the shape of an idea." },
  { id: "logical", label: "Logical / mathematical", blurb: "Rules, systems, cause and effect, structured steps." },
  { id: "verbal", label: "Verbal / linguistic", blurb: "Stories, analogies, explaining it back out loud." },
  { id: "kinesthetic", label: "Bodily / kinesthetic", blurb: "Doing it with your hands before reading about it." },
  { id: "musical", label: "Musical / rhythmic", blurb: "Pattern, rhythm, sound-anchored memory." },
  { id: "social", label: "Interpersonal", blurb: "Learning by discussing, teaching and building with others." },
];

export const FORMAT_LABEL: Record<LessonFormat, string> = {
  story: "Story explainer",
  video: "Interactive video",
  game: "Learning game",
  practice: "Hands-on practice",
  quiz: "Adaptive quiz",
  live: "Live AI session",
};

const FORMAT_BY_INTELLIGENCE: Record<Intelligence, LessonFormat[]> = {
  visual: ["video", "story", "practice", "quiz"],
  logical: ["story", "practice", "quiz", "game"],
  verbal: ["story", "live", "quiz", "practice"],
  kinesthetic: ["practice", "game", "video", "quiz"],
  musical: ["video", "game", "story", "quiz"],
  social: ["live", "game", "practice", "quiz"],
};

export function formatsFor(p: Profile): LessonFormat[] {
  const base = FORMAT_BY_INTELLIGENCE[p.intelligence];
  if (p.age <= 14 && !base.includes("game")) return ["game", ...base].slice(0, 4);
  return base;
}

/** Ladder of skill stages, trimmed by prior experience. */
const LADDER = [
  {
    key: "orient",
    title: "Orientation",
    intent: "Get the mental map before any tool is opened.",
    lessons: ["What this skill actually is", "The vocabulary you'll keep hearing", "Your first 10-minute win"],
  },
  {
    key: "core",
    title: "Core foundations",
    intent: "The handful of principles everything else stands on.",
    lessons: ["The three principles that matter", "Reading good work like a practitioner", "Deliberate practice drill"],
  },
  {
    key: "tools",
    title: "Tools for your level",
    intent: "Right-sized tools — not the industry monster app on day one.",
    lessons: ["Choosing a tool that fits you", "Guided walkthrough with your AI tutor", "Rebuild a reference piece"],
  },
  {
    key: "apply",
    title: "Applied project",
    intent: "You build it. The tutor coaches — it never builds it for you.",
    lessons: ["Scoping a project you care about", "Working session with live feedback", "Critique and revision round"],
  },
  {
    key: "master",
    title: "Proof of skill",
    intent: "Show the skill under real conditions and earn the certificate.",
    lessons: ["Timed challenge", "Explain it to someone else", "Final portfolio review"],
  },
];

function quizFor(skill: string, title: string, i: number) {
  const banks = [
    {
      question: `In ${skill}, what should drive your first decision on a new task?`,
      options: ["Copying the most popular example", "The outcome and who it is for", "The fanciest tool available", "Whatever takes least time"],
      answer: 1,
      why: "Every craft decision gets easier once the intended outcome and audience are fixed first.",
    },
    {
      question: `You get stuck halfway through a ${skill} task. Best next move?`,
      options: ["Ask the AI to finish it for you", "Restart from zero", "Shrink the problem and test one piece", "Wait until tomorrow"],
      answer: 2,
      why: "Isolating one small piece turns a vague block into a testable question — and keeps the learning yours.",
    },
    {
      question: `Which is the strongest evidence you actually learned "${title}"?`,
      options: ["You watched it twice", "You saved the notes", "You can rebuild it without the notes", "It felt easy"],
      answer: 2,
      why: "Retrieval without support is the only reliable signal of real understanding.",
    },
  ];
  return banks[i % banks.length]!;
}

export function buildRoadmap(p: Profile): Module[] {
  const skill = p.goal.trim() || "your skill";
  let stages = LADDER;
  if (p.level === "some") stages = LADDER.slice(1);
  if (p.level === "experienced") stages = LADDER.slice(2);

  const formats = formatsFor(p);
  const kid = p.age <= 14;
  const pace = p.focus === "steady" ? 1 : 0.7;

  return stages.map((stage, si) => ({
    id: stage.key,
    title: `${stage.title} — ${skill}`,
    intent: kid
      ? stage.intent.replace("practitioner", "pro").replace("industry monster app", "big grown-up app")
      : stage.intent,
    lessons: stage.lessons.map((title, li) => ({
      id: `${stage.key}-${li}`,
      title,
      summary: lessonSummary(title, skill, p),
      minutes: Math.max(8, Math.round((kid ? 12 : 25) * pace + li * 4)),
      formats: [formats[li % formats.length]!, formats[(li + 1) % formats.length]!],
      quiz: quizFor(skill, title, si + li),
    })),
  }));
}

function lessonSummary(title: string, skill: string, p: Profile) {
  const bg = p.background.trim();
  const bridge = bg ? ` Examples are pulled from ${bg} so they land on ground you already know.` : "";
  const age =
    p.age <= 14
      ? " Written short, playful, and split into small chunks."
      : p.age >= 45
        ? " Paced calmly, with the why before the how."
        : "";
  return `${title} for ${skill}, rebuilt for a ${p.level === "new" ? "first-time" : p.level === "some" ? "partly experienced" : "experienced"} learner.${bridge}${age}`;
}

export function reexplain(lesson: Lesson, attempt: number, p: Profile): { format: LessonFormat; text: string } {
  const pool = formatsFor(p).filter((f) => f !== "quiz");
  const format = pool[attempt % pool.length]!;
  const lines: Record<LessonFormat, string> = {
    story: `Same idea, told as a short story: imagine someone facing exactly the problem "${lesson.title}" solves, and watch what they try first, what fails, and why the correct move works.`,
    video: `Switching to a visual walkthrough — a slowed-down demo of "${lesson.title}" where each step is annotated on screen instead of described in words.`,
    game: `Let's turn "${lesson.title}" into a game: five quick rounds, each one slightly harder, and you get feedback the instant you answer.`,
    practice: `Enough explaining. Open your tool and do the smallest possible version of "${lesson.title}" right now — the tutor watches and nudges at each step.`,
    quiz: `Quick retrieval check on "${lesson.title}".`,
    live: `Jumping into a live voice session on "${lesson.title}" — you talk it through, the tutor asks the questions you'd be embarrassed to ask a human.`,
  };
  return { format, text: lines[format] };
}

export type Nudge = { kind: "move" | "focus" | "music" | "praise"; text: string; action: string };

export function nudgeFor(p: Profile, minutesFocused: number): Nudge | null {
  if (p.focus === "hyperactive" && minutesFocused >= 12)
    return {
      kind: "move",
      text: `${p.name}, that's ${minutesFocused} solid minutes. Deal's a deal — stand up, 60 seconds of movement, then we sprint again.`,
      action: "Take the movement break",
    };
  if (p.focus === "distracted" && minutesFocused >= 8)
    return {
      kind: "music",
      text: "Your attention is drifting. Want focus audio and a faster, more interactive format for the next stretch?",
      action: "Switch to high-stimulation mode",
    };
  if (minutesFocused >= 20)
    return { kind: "praise", text: "Deep work detected. Bank the win with a two-minute recall, then rest.", action: "Do the recall" };
  return null;
}

export function loadProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: Profile) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function loadProgress(): Progress {
  if (typeof window === "undefined") return { done: [], breaks: 0, reexplains: 0 };
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as Progress) : { done: [], breaks: 0, reexplains: 0 };
  } catch {
    return { done: [], breaks: 0, reexplains: 0 };
  }
}

export function saveProgress(p: Progress) {
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

export const DEMO_PROFILE: Profile = {
  name: "Jamie Davis",
  age: 22,
  background: "medical school",
  goal: "Python for data",
  level: "some",
  intelligence: "logical",
  focus: "distracted",
  language: "en",
  mode: "solo",
  createdAt: Date.now(),
};
