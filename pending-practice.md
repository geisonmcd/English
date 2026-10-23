# Pending practice

Silent mistakes (logged in `data/mistakes.jsonl` / `data/errors.json`) that were **not** taught in the voice reply. Later conversation turns should steer Geison to practice these naturally.

**How to use:** pick one pending item when crafting the next follow-up question or prompt; after he produces the correct form in conversation, mark it `done` (or remove) and update SRS on the pattern id.

| added | pattern_id | said | target | status | source |
|-------|------------|------|--------|--------|--------|
| 2026-10-23 | `err-filler-i-dont-know` | just fix the I don't know the most important one | just fix the most important one | pending | msg 62 |
| 2026-10-23 | `err-the-same-of` | repeat the same of the other four mistakes | practice the other four mistakes again | pending | msg 62 |
| 2026-10-23 | `err-answers-short` | Keep your answers small | Keep your answers short | pending | msg 62 |
| 2026-10-23 | `err-pron-after-ash` | after (/æ/ weak, score 58) | after /ˈæftər/ (a as in cat) | pending | msg 62 |
| 2026-10-23 | `err-had-past-participle` | If he had test the page | If he had tested the page | practiced (msg 67: *had tested* OK) | msg 65 |
| 2026-10-23 | `err-gotten-up-vs-stayed-up` | wouldn't have gotten up so late | wouldn't have stayed up so late | practiced (msg 67: *stayed up* OK) | msg 65 |
| 2026-10-23 | `err-article-the-page` | tested page earlier | tested the page earlier | pending | msg 65 |
| 2026-10-23 | `err-pronoun-drift` | If you had tested…, he wouldn't… | keep the same subject | pending (msg 67: slipped again on 3rd try) | msg 65 |
| 2026-10-23 | `err-pron-so-late` | so late (run together → obsolete) | so… late (two clear words; /oʊ/ in so) | pending | msg 65 |
| 2026-10-23 | `err-wouldnt-have-stayed` | wouldn't have to stay up | wouldn't have stayed up | improving — **2/3** correct on msg 67; keep pending | msg 65/66/67 |
| 2026-10-23 | `err-payment-page-earlier` | the payment early | the payment page earlier | pending | msg 67 |
| 2026-10-23 | `err-pron-final-d` | tested / wouldn't (weak final /d/) | clear final /d/ | pending | msg 67 |

| 2026-10-23 | `err-would-have-called` | we'll have to call (after If … had failed) | we would have called a war room | pending | msg 69 |
| 2026-10-23 | `err-think-about` | Thought what | thought about what | pending | msg 69 |
| 2026-10-23 | `err-restart-you-can` | You can also… you can teach me | In our conversations, you can also teach me… | pending | msg 69 |
| 2026-10-23 | `err-already-know-order` | I know already / different than | I already know / different from (than OK US) | pending | msg 70 |
| 2026-10-23 | `err-pron-vocabulary` | vocabulary (43) | /voʊˈkæbjəˌlɛri/ | pending | msg 69 |
| 2026-10-23 | `err-pron-generator-er` | generator (44) | final /ɚ/ | pending | msg 69 |
| 2026-10-23 | `err-pron-payment-syllables` | payement | payment (2 syllables) | pending | msg 69 |
| 2026-10-23 | `err-like-when` | Like someone goes to prison? | Like when someone goes to prison? | pending | msg 72 |
| 2026-10-23 | `err-pron-that-th` | that (/ð/ 64) | clearer /ð/ in that | pending | msg 72 |
| 2026-10-23 | `err-pron-bailable` | bailable (41, weak schwa) | /ˈbeɪləbəl/ | pending | msg 74 |
| 2026-10-23 | `err-it-is-bailable` | I mean it is bailable | I mean it's related to bail / It's about bail | pending | msg 74 |

## Recently taught (not pending)

| taught | pattern_id | target | reply |
|--------|------------|--------|-------|
| 2026-10-23 | `err-at-a-time` | at a time | msg 64 |
| 2026-10-23 | `err-wouldnt-have-stayed` | wouldn't have stayed up (not *have to stay*) | msg 66 (still improving — see pending) |
| 2026-10-23 | `err-pron-earlier-er` | earlier /ˈɝliɚ/ (*her*, not *oh*) | msg 68 |
| 2026-10-23 | `err-embedded-question-order` | what the next steps would be (statement order) | msg 71 |
| 2026-10-23 | `err-bound-out-bail` | bail (not *bound out*) | msg 73 — **BOT mis-guess**; superseded by `err-bound-vs-bond` |
| 2026-10-23 | `err-bound-vs-bond` | bond out /bɑːnd/ (not bound /baʊnd/) | msg 75 |
