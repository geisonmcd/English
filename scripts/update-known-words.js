#!/usr/bin/env node
/**
 * Scan sessions/*.md for Geison's own text, extract words, and write:
 *   data/known-words.txt      — lowercase, deduped, sorted
 *   data/unknown-top-words.txt — words in data/top-5000.txt not yet known (frequency order)
 *
 * No dependencies. Run: node scripts/update-known-words.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SESSIONS_DIR = path.join(ROOT, "sessions");
const KNOWN_PATH = path.join(ROOT, "data", "known-words.txt");
const TOP_PATH = path.join(ROOT, "data", "top-5000.txt");
const UNKNOWN_PATH = path.join(ROOT, "data", "unknown-top-words.txt");

/** Very small irregular lemma map (enough for learner transcripts). */
const IRREGULAR = {
  am: "be",
  is: "be",
  are: "be",
  was: "be",
  were: "be",
  been: "be",
  being: "be",
  has: "have",
  had: "have",
  having: "have",
  does: "do",
  did: "do",
  doing: "do",
  done: "do",
  goes: "go",
  went: "go",
  gone: "go",
  going: "go",
  said: "say",
  says: "say",
  saying: "say",
  made: "make",
  makes: "make",
  making: "make",
  took: "take",
  takes: "take",
  taken: "take",
  taking: "take",
  came: "come",
  comes: "come",
  coming: "come",
  got: "get",
  gets: "get",
  getting: "get",
  knew: "know",
  knows: "know",
  known: "know",
  knowing: "know",
  thought: "think",
  thinks: "think",
  thinking: "think",
  found: "find",
  finds: "find",
  finding: "find",
  spoke: "speak",
  speaks: "speak",
  spoken: "speak",
  speaking: "speak",
  talked: "talk",
  talks: "talk",
  talking: "talk",
  used: "use",
  uses: "use",
  using: "use",
  created: "create",
  creates: "create",
  creating: "create",
  updated: "update",
  updates: "update",
  updating: "update",
  stored: "store",
  stores: "store",
  storing: "store",
  interacted: "interact",
  interacts: "interact",
  interacting: "interact",
  needed: "need",
  needs: "need",
  needing: "need",
  called: "call",
  calls: "call",
  calling: "call",
  focused: "focus",
  focuses: "focus",
  focusing: "focus",
  learnt: "learn",
  learned: "learn",
  learns: "learn",
  learning: "learn",
  taught: "teach",
  teaches: "teach",
  teaching: "teach",
  ran: "run",
  runs: "run",
  running: "run",
  built: "build",
  builds: "build",
  building: "build",
  kept: "keep",
  keeps: "keep",
  keeping: "keep",
  felt: "feel",
  feels: "feel",
  feeling: "feel",
  children: "child",
  men: "man",
  women: "woman",
  people: "person",
};

/** Words that look like plurals/3sg but should keep their final "s". */
const KEEP_FINAL_S = new Set([
  "always",
  "sometimes",
  "towards",
  "afterwards",
  "besides",
  "species",
  "series",
  "means",
  "news",
  "physics",
  "maths",
  "linguistics",
  "this",
  "thus",
  "plus",
  "bias",
  "focus",
  "campus",
  "status",
  "bonus",
  "analysis",
  "basis",
  "crisis",
]);

function lemmatize(word) {
  if (IRREGULAR[word]) return IRREGULAR[word];
  if (word.length <= 3) return word;

  // -ing / -ed before plural stripping (creating, based, …)
  if (word.endsWith("ing") && word.length > 5) {
    const stem = word.slice(0, -3);
    if (stem.length >= 2 && stem.at(-1) === stem.at(-2) && !"aeiou".includes(stem.at(-1))) {
      return stem.slice(0, -1); // running -> run
    }
    if (stem.endsWith("y") || stem.length <= 2) return word;
    // creating -> create; storing -> store
    if (!"aeiou".includes(stem.at(-1))) return stem + "e";
    return stem;
  }
  if (word.endsWith("ied") && word.length > 4) return word.slice(0, -3) + "y";
  if (word.endsWith("ed") && word.length > 4) {
    const stem = word.slice(0, -2);
    if (stem.length >= 2 && stem.at(-1) === stem.at(-2) && !"aeiou".includes(stem.at(-1))) {
      return stem.slice(0, -1); // stopped -> stop
    }
    if (stem.endsWith("e")) return stem;
    // based -> base; used already in IRREGULAR
    if (!"aeiou".includes(stem.at(-1))) return stem + "e";
    return stem;
  }

  // plurals / 3sg: cities -> city, watches -> watch, runs -> run
  if (KEEP_FINAL_S.has(word)) return word;
  if (word.endsWith("ies") && word.length > 4) return word.slice(0, -3) + "y";
  if (word.endsWith("ves") && word.length > 4) return word.slice(0, -3) + "f";
  if (/(?:sses|shes|ches|xes|zes)$/.test(word) && word.length > 4) {
    return word.slice(0, -2);
  }
  if (
    word.endsWith("s") &&
    !word.endsWith("ss") &&
    !word.endsWith("us") &&
    !word.endsWith("is") &&
    !word.endsWith("ous") &&
    !word.endsWith("as")
  ) {
    return word.slice(0, -1);
  }

  return word;
}

function normalizeToken(raw) {
  let w = raw.toLowerCase();
  w = w.replace(/^[^a-z]+|[^a-z]+$/g, ""); // strip edge punctuation
  w = w.replace(/'s$/, "").replace(/n't$/, " not").replace(/'re$/, "").replace(/'ve$/, "").replace(/'ll$/, "").replace(/'d$/, "").replace(/'m$/, "");
  // if contractions expanded to two words, split later — here keep first chunk
  if (w.includes(" ")) return w.split(/\s+/).filter(Boolean);
  if (!w || !/^[a-z]+$/.test(w)) return [];
  if (/^\d+$/.test(w)) return [];
  return [lemmatize(w)];
}

/**
 * Extract only Geison's spoken/written text from a session markdown file.
 * Collects every "## Geison's message…" section until the next ## heading.
 */
function extractGeisonText(markdown) {
  const lines = markdown.split(/\r?\n/);
  const chunks = [];
  let inGeison = false;

  for (const line of lines) {
    if (/^##\s+Geison'?s\s+message/i.test(line)) {
      inGeison = true;
      continue;
    }
    if (inGeison && /^#{2,3}\s+/.test(line)) {
      inGeison = false;
      // do not continue: this line may start another Geison section
      if (/^##\s+Geison'?s\s+message/i.test(line)) {
        inGeison = true;
      }
      continue;
    }
    if (inGeison) {
      if (/^\|/.test(line)) continue;
      chunks.push(line);
    }
  }

  if (chunks.length === 0) {
    let capture = false;
    for (const line of lines) {
      if (/^##\s+.*geison/i.test(line)) {
        capture = true;
        continue;
      }
      if (capture && /^##\s+/.test(line)) {
        capture = /^##\s+.*geison/i.test(line);
        continue;
      }
      if (capture) chunks.push(line);
    }
  }

  return chunks.join("\n");
}

function wordsFromText(text) {
  const out = new Set();
  const tokens = text.split(/[\s_/\\]+/);
  for (const tok of tokens) {
    for (const w of normalizeToken(tok)) {
      if (w.length >= 1) out.add(w);
    }
  }
  return out;
}

function readLines(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim().toLowerCase())
    .filter(Boolean);
}

function writeLines(filePath, lines) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, lines.join("\n") + (lines.length ? "\n" : ""));
}

function main() {
  if (!fs.existsSync(SESSIONS_DIR)) {
    console.error("Missing sessions/ directory");
    process.exit(1);
  }
  if (!fs.existsSync(TOP_PATH)) {
    console.error("Missing data/top-5000.txt — add the frequency list first");
    process.exit(1);
  }

  const known = new Set(readLines(KNOWN_PATH));
  const sessionFiles = fs
    .readdirSync(SESSIONS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  let added = 0;
  for (const file of sessionFiles) {
    const full = path.join(SESSIONS_DIR, file);
    const text = extractGeisonText(fs.readFileSync(full, "utf8"));
    const words = wordsFromText(text);
    for (const w of words) {
      if (!known.has(w)) {
        known.add(w);
        added += 1;
      }
    }
  }

  const knownSorted = [...known].sort((a, b) => a.localeCompare(b));
  writeLines(KNOWN_PATH, knownSorted);

  const top = readLines(TOP_PATH);
  const unknown = top.filter((w) => !known.has(w));
  writeLines(UNKNOWN_PATH, unknown);

  console.log(
    JSON.stringify(
      {
        sessions: sessionFiles.length,
        known_words: knownSorted.length,
        newly_added: added,
        unknown_top_words: unknown.length,
        known_path: path.relative(ROOT, KNOWN_PATH),
        unknown_path: path.relative(ROOT, UNKNOWN_PATH),
      },
      null,
      2
    )
  );
}

main();
