#!/usr/bin/env node
/**
 * Rank mistake patterns from data/mistakes.jsonl over the last 90 days.
 * Writes data/top-mistakes-90d.md
 *
 * No dependencies. Run: node scripts/top-mistakes.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MISTAKES_PATH = path.join(ROOT, "data", "mistakes.jsonl");
const ERRORS_PATH = path.join(ROOT, "data", "errors.json");
const OUT_PATH = path.join(ROOT, "data", "top-mistakes-90d.md");
const WINDOW_DAYS = 90;

const SEVERITY_RANK = { high: 3, medium: 2, low: 1 };

function parseDateUTC(yyyyMmDd) {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function todayUTC() {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

function loadMistakes() {
  if (!fs.existsSync(MISTAKES_PATH)) return [];
  return fs
    .readFileSync(MISTAKES_PATH, "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l, i) => {
      try {
        return JSON.parse(l);
      } catch (e) {
        throw new Error(`Invalid JSON on mistakes.jsonl line ${i + 1}: ${e.message}`);
      }
    });
}

function loadErrorMeta() {
  const meta = new Map();
  if (!fs.existsSync(ERRORS_PATH)) return meta;
  const data = JSON.parse(fs.readFileSync(ERRORS_PATH, "utf8"));
  for (const item of data.items || []) {
    meta.set(item.id, {
      rule: item.rule || "",
      correct:
        (item.examples && item.examples[0] && item.examples[0].correct) || "",
      category: item.category || "",
      severity: item.severity || "medium",
    });
  }
  return meta;
}

function main() {
  const cutoff = todayUTC() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const mistakes = loadMistakes().filter((m) => {
    if (!m.date) return false;
    return parseDateUTC(m.date) >= cutoff;
  });
  const meta = loadErrorMeta();

  /** @type {Map<string, {count:number, lastSeen:string, said:string, correct:string, category:string, severity:string, rule:string}>} */
  const byPattern = new Map();

  for (const m of mistakes) {
    const id = m.pattern_id || "unknown";
    const fromMeta = meta.get(id) || {};
    const prev = byPattern.get(id);
    if (!prev) {
      byPattern.set(id, {
        count: 1,
        lastSeen: m.date,
        said: m.said || "",
        correct: m.correct || fromMeta.correct || "",
        category: m.category || fromMeta.category || "",
        severity: m.severity || fromMeta.severity || "medium",
        rule: fromMeta.rule || "",
      });
    } else {
      prev.count += 1;
      if (m.date > prev.lastSeen) {
        prev.lastSeen = m.date;
        if (m.said) prev.said = m.said;
        if (m.correct) prev.correct = m.correct;
      }
      if (!prev.rule && fromMeta.rule) prev.rule = fromMeta.rule;
    }
  }

  const ranked = [...byPattern.entries()].sort((a, b) => {
    const [idA, A] = a;
    const [idB, B] = b;
    if (B.count !== A.count) return B.count - A.count;
    const sDiff = (SEVERITY_RANK[B.severity] || 0) - (SEVERITY_RANK[A.severity] || 0);
    if (sDiff !== 0) return sDiff;
    return idA.localeCompare(idB);
  });

  const generated = new Date().toISOString().slice(0, 10);
  const lines = [
    "# Top mistakes (last 90 days)",
    "",
    `Generated: ${generated} · window: ${WINDOW_DAYS} days · source: \`data/mistakes.jsonl\``,
    "",
    "| Rank | Pattern | Count | Severity | Last seen | Correct form | Rule |",
    "|-----:|---------|------:|----------|-----------|--------------|------|",
  ];

  ranked.forEach(([id, row], i) => {
    const correct = (row.correct || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
    const rule = (row.rule || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
    lines.push(
      `| ${i + 1} | \`${id}\` | ${row.count} | ${row.severity} | ${row.lastSeen} | ${correct} | ${rule} |`
    );
  });

  if (ranked.length === 0) {
    lines.push("");
    lines.push("_No mistakes in the last 90 days._");
  }

  lines.push("");
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, lines.join("\n"));

  console.log(
    JSON.stringify(
      {
        window_days: WINDOW_DAYS,
        occurrences: mistakes.length,
        patterns: ranked.length,
        out: path.relative(ROOT, OUT_PATH),
      },
      null,
      2
    )
  );
}

main();
