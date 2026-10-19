# Spaced repetition (SM-2 style)

Used for items in `data/errors.json`, learning entries in `data/vocabulary.json`, and `data/pronunciation.json`.

## Fields

| Field | Meaning |
|-------|---------|
| `ease` | Ease factor (starts at **2.5**, minimum **1.3**) |
| `interval_days` | Days until next review |
| `repetitions` | Successful reviews in a row (resets to 0 on fail) |
| `due_date` | Next review date (`YYYY-MM-DD`) |
| `last_reviewed` | Last review date, or `null` if never reviewed |

## New item

When an item is first logged:

- `ease` = `2.5`
- `interval_days` = `1`
- `repetitions` = `0`
- `due_date` = tomorrow (first review the next day)
- `last_reviewed` = `null`

## Review outcomes

Treat each review as **pass** (he produced the correct form / recalled the word) or **fail** (wrong, heavily prompted, or unnatural again).

### On fail

1. `repetitions` = `0`
2. `interval_days` = `1`
3. `ease` = `max(1.3, ease - 0.2)`
4. `due_date` = tomorrow
5. `last_reviewed` = today

### On pass

1. `repetitions` = `repetitions + 1`
2. Set `interval_days`:
   - if `repetitions` was `0` before this pass → `1` (still first success → next day)
   - if `repetitions` was `1` before this pass → `6`
   - otherwise → `round(interval_days * ease)` (at least `1`)
3. Optionally bump ease slightly: `ease` = `ease + 0.1` (cap is optional; keep ≥ 1.3)
4. `due_date` = today + `interval_days`
5. `last_reviewed` = today

Classic SM-2 also adjusts ease from a 0–5 quality grade. For this repo we keep two outcomes only (pass/fail) so an agent can update files without a quiz UI:

- **pass** ≈ quality ≥ 3 → grow interval as above; small ease bump (`+0.1`)
- **fail** ≈ quality < 3 → reset interval to 1 day; ease −0.2

## What to review when

On a conversation day (or weekly lesson):

1. Load all items with `due_date <= today`
2. Prioritize `errors` with `severity: high`, then due vocabulary, then pronunciation
3. After practice, update the five SRS fields in the JSON files and commit

## Example timeline

| Review # | Result | interval_days | due |
|----------|--------|---------------|-----|
| created  | —      | 1             | +1 day |
| 1        | pass   | 1             | +1 day |
| 2        | pass   | 6             | +6 days |
| 3        | pass   | ~15 (6 × 2.5) | +~15 days |
| any      | fail   | 1             | +1 day |
