# Kinn · How it learns

The source for the **/learn** page of the Kinn site (`kinn/site`). An interactive demo of Kinn's AI for the hackathon's **Continual Learning** track: the knee-recovery tape gets smarter from each wearer and from everyone. A story rail, the phone app (Today / Check in / Learned) and the charts all run on one real learning engine fed by simulated wearers.

## What it shows

1. **Learning from you (on the phone).** Each morning Kinn makes a call (Push / Ease off / Rest) and sets your line, the knee bend to stay under. The evening check-in (one tap, or a sentence Claude reads) is the answer, and the phone's model takes one learning step from it.
2. **Learning from everyone (across phones).** Each night is a round of federated averaging: phones improve a copy of the fleet model on their own days and send back only the new weights (32 numbers), never readings or words. New wearers start from the fleet model.
3. **Proof that it works.** Every call is checked against that evening's check-in on 400 simulated newcomers the fleet never saw:

| Week of wear | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| Only your data | 53% | 63% | 70% | 71% | 77% | 78% |
| Only everyone else's (3,000 wearers) | 79% | 78% | 80% | 79% | 79% | 80% |
| Everyone's + yours | 79% | 81% | 83% | 81% | 84% | 84% |

"Right" is balanced accuracy (flare-ups it warned about and calm days it called calm, averaged), so a coin flip scores 50%. Rare recoveries need a bigger fleet: week-one calls for a knee replacement under 35 go from 53% to 74%, and most of that needs 30+ wearers; for an ACL under 35, 10 wearers already get 79%.

## The sensors (the product claim)

The strip pairs four signals. Each kind of recovery weighs them differently, and so does each person:

| Signal | Sensor | Status |
|---|---|---|
| How far you bend | Printed stretch traces | Kinn design |
| How many deep bends | Stretch traces + motion sensor in the coin | Kinn design |
| Muscle fatigue | Muscle sensor over the quad (thin-film pressure, i.e. force myography; printed EMG electrodes later) | Built in the KineTape prototype |
| Warmth at the knee | Skin temperature in the coin | Cheap to add |

Keep the claims honest: it estimates the chance of a flare-up and suggests a limit, it doesn't measure tissue strain, and it isn't a medical device.

## 3-minute demo script

Use **Next →** or the arrow keys.

1. **Meet Maya:** day one, a call and a line already, from 3,000 earlier recoveries.
2. **It learns her:** day 21, the line has moved 93° → 123° and the Learned tab shows her strongest warning sign (muscle fatigue).
3. **Tell it how it went:** tap Flare-up (or type "knee swelled after practice, 6/10"). The phone shows what that answer changed for tomorrow: Rest instead of Push, line 121° instead of 128°.
4. **Every Kinn learns:** the fleet is set to 0. Maya's phone says "Learning you". Drag the fleet up and watch the call, the line and the chart come back.
5. **It never stops:** the weekly chart: alone it starts at a coin flip, the fleet alone plateaus, together it's best and keeps improving.

Side demo: drag "Try it: bend the knee" past her line and the phone buzzes.

## Tracks

- **Continual Learning:** the whole demo. Two loops (online on the phone, federated across phones), evaluated honestly on unseen people, with the curve getting better week after week.
- **Design (Figma):** one screen with one answer instead of the earlier 8-tab app. Plain words, the coin's light ring as the only color, a reason to come back every evening (the check-in visibly changes tomorrow).
- **Scale (pitch angle, no extra build):** every wearer makes the next wearer's first week better, a data network effect competitors without the strip can't copy. Payer path: US remote therapeutic monitoring codes (see `../CONTEXT.md`).

## Run

```bash
cd kinn/learn
npm install
npm run dev          # http://localhost:5173
npm test             # engine tests (incl. that src/data/curves.json is current)
npm run build        # typecheck + build into ../site/public/learn/
npm run precompute   # regenerate src/data/curves.json after changing the engine
```

**Publish to the site:** `npm run build` writes the page into `../site/public/learn/` (commit that folder). The Kinn site on Railway serves it at `/learn/`, and its server answers `/api/checkin` (`kinn/site/checkin.js`). Add `ANTHROPIC_API_KEY` to the Railway service so Claude reads typed check-ins; without it they're read on the device by keywords, and the app labels which one read it. For live check-ins in `npm run dev`, also run the site (`cd ../site && npm start`); the dev server forwards `/api` to it.

## How it's built

- `src/engine/sim.ts`: simulated wearers. Six groups (injury × age) with different hidden rules (e.g. after a knee replacement, more deep bends help), plus personal quirks.
- `src/engine/model.ts`: logistic model, online learning on the phone (pulled toward the fleet model), federated averaging across phones, balanced-accuracy scoring.
- `src/engine/hero.ts`: Maya's days, mornings (call, line, fatigue cap, record) and the "what Kinn learned" timeline, all computed.
- `src/engine/curves.ts`: the chart numbers, precomputed into `src/data/curves.json`.
- `src/ui/`: phone, gauge, charts (hand-built SVG with hover, direct labels and a table view), panel.
- `kinn/site/checkin.js` (in the site, not here): the `/api/checkin` route, where Claude (structured JSON output) turns a sentence into a check-in.
