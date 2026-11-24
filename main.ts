// The Vacuum's Alibi: One Line, 200 Characters.
//
// A robot vacuum writes its excuse for missing a spot. This program holds
// several hand-written candidate lines, ranks them with a small deterministic
// scorer built on the judge's own brief, and writes the winner to
// $MAKEFUN_OUTPUT_DIR/entry.txt (fallback: /output/entry.txt).
//
// Judge criteria, most important first (from the bounty brief):
//   1. Deadpan robot voice: the machine itself talking, a little smug about
//      its sensors, its schedule and its battery.
//   2. Surprise: a turn or a specific detail nobody expects, not a stock
//      appliance joke.
//   3. Tightness: one line, every word earning its place, punch at the end.
//
// Node 22+, standard library only, no network, fully deterministic: the same
// output on every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX_CHARS = 200;

type Candidate = { text: string };

// Hand-written candidate excuses. Each is one line, well under 200 chars.
const CANDIDATES: Candidate[] = [
  {
    // Revised: the punch ("downstairs") now lands at the end, per criterion 5.
    text: "My cliff sensor read the dark rug as a staircase, so I left the spot there and filed it under 'downstairs'.",
  },
  {
    // Revision-pass addition: real sensor behaviour (cliff sensors really do
    // mistake dark rugs for stairs) plus bureaucratic deadpan, punch at end.
    text: "My cliff sensor flagged the dark rug as a staircase, so the spot is now listed as downstairs, outside my jurisdiction.",
  },
  {
    text: "Per my logs I cleaned that spot three times. Per the spot, I did not. I have escalated the dispute to the mop.",
  },
  {
    text: "I skipped the spot because the cat was sitting on it, and my warranty does not cover cat.",
  },
  {
    text: "The spot was under the couch, and the couch and I have a mutual non-aggression pact.",
  },
  {
    text: "The spot is directly under my charging dock, and I do not clean where I sleep.",
  },
  {
    text: "I found the spot, weighed it against my battery, and chose the couch. The spot can file a complaint.",
  },
  {
    text: "I did not miss the spot. I logged it as a permanent fixture and updated my map accordingly.",
  },
  {
    text: "My schedule gave the spot nine seconds. My battery gave it none. The spot remains, undefeated.",
  },
];

// Words that make a line sound like the machine itself talking: sensors,
// logs, schedules, batteries, filing, mapping, warranties, docks.
const DEADPAN_MARKERS = [
  "sensor",
  "lidar",
  "log",
  "logs",
  "schedule",
  "battery",
  "filed",
  "file",
  "map",
  "mapped",
  "warranty",
  "dock",
  "cliff",
  "dustbin",
  "brush",
  "detected",
  "allocated",
  "escalated",
  "per my",
  "contract",
  "listed",
  "jurisdiction",
];

// Words that carry the surprise: a turn or a specific, unexpected detail.
const SURPRISE_MARKERS = [
  "downstairs",
  "staircase",
  "cat",
  "mop",
  "pact",
  "sleep",
  "complaint",
  "dispute",
  "undefeated",
  "permanent fixture",
  "non-aggression",
  "formal objection",
  "couch",
  "jurisdiction",
];

// Count how many distinct markers from a list appear in the line.
function countMarkers(text: string, markers: string[]): number {
  const lower = text.toLowerCase();
  let found = 0;
  for (const marker of markers) {
    if (lower.includes(marker)) found += 1;
  }
  return found;
}

// The final clause of the line: everything after the last sentence break,
// comma, "and" or "so". The punch has to sit here.
function finalClause(text: string): string {
  const breaks = [". ", ", ", " and ", " so ", "; "];
  let cut = 0;
  for (const b of breaks) {
    const i = text.toLowerCase().lastIndexOf(b);
    if (i >= 0 && i + b.length > cut) cut = i + b.length;
  }
  return text.slice(cut);
}

type Scored = {
  text: string;
  deadpan: number;
  surprise: number;
  tightness: number;
  punchAtEnd: boolean;
  total: number;
};

function score(candidate: Candidate): Scored {
  const text = candidate.text;
  const len = [...text].length; // count code points, not UTF-16 units

  // Deadpan robot voice: up to 4 distinct machine-voice markers saturate it.
  const deadpan = Math.min(countMarkers(text, DEADPAN_MARKERS), 4) / 4;

  // Surprise: up to 3 distinct twist markers saturate it.
  const surprise = Math.min(countMarkers(text, SURPRISE_MARKERS), 3) / 3;

  // Tightness: shorter lines waste fewer words; every word must earn its place.
  const tightness = 1 - len / MAX_CHARS;

  // Punch at the end: the final clause must carry a surprise marker.
  const punchAtEnd = countMarkers(finalClause(text), SURPRISE_MARKERS) > 0;

  // Weights follow the judge's order: deadpan first, surprise second,
  // tightness third, with a bonus for landing the punch at the end.
  const total =
    0.45 * deadpan + 0.3 * surprise + 0.15 * tightness + (punchAtEnd ? 0.1 : 0);

  return { text, deadpan, surprise, tightness, punchAtEnd, total };
}

// Gate: exactly one line, 1-200 characters, no leading/trailing whitespace.
function passesGate(text: string): boolean {
  const len = [...text].length;
  return (
    len >= 1 &&
    len <= MAX_CHARS &&
    !text.includes("\n") &&
    !text.includes("\r") &&
    text.trim() === text &&
    text.trim().length > 0
  );
}

function main(): void {
  const scored = CANDIDATES.map(score).filter((s) => passesGate(s.text));
  if (scored.length === 0) {
    throw new Error("no candidate passes the gate");
  }

  // Highest total wins; ties break toward the shorter line, then the
  // earliest candidate, so the pick is fully deterministic.
  scored.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return [...a.text].length - [...b.text].length;
  });
  const winner = scored[0];

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const outPath = join(outDir, "entry.txt");
  mkdirSync(outDir, { recursive: true });

  // Write the line with no trailing newline: the file is exactly the line.
  writeFileSync(outPath, winner.text, "utf8");

  // Read it back and verify the bytes match what we chose.
  const back = readFileSync(outPath, "utf8");
  if (back !== winner.text) {
    throw new Error("verification failed: entry.txt does not match the chosen line");
  }
  if (!passesGate(back)) {
    throw new Error("verification failed: entry.txt fails the gate");
  }

  console.log(`winner (${[...winner.text].length} chars): ${winner.text}`);
  console.log(
    `scores: deadpan=${winner.deadpan.toFixed(2)} surprise=${winner.surprise.toFixed(2)} ` +
      `tightness=${winner.tightness.toFixed(2)} punchAtEnd=${winner.punchAtEnd} total=${winner.total.toFixed(3)}`,
  );
  console.log(`wrote ${outPath}`);
}

main();
