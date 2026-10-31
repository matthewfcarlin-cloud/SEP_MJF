# RECO

**A smart tape and app that helps people recovering from an injury get back to their lives sooner, with fewer setbacks. It tracks the injured joint every day, shows their progress and what comes before their pain, and gives their PT the full picture between visits.**

A PT sees you for 1 to 3 hours a week. RECO covers the other 160+.

- **Track:** the tape records how the joint moves and how much it's used through daily life.
- **Log:** press the button on the device when something hurts.
- **Learn:** RECO finds what comes before your pain and learns your line.
- **Adapt:** your progress, plan and warnings update from what you actually did.
- **Share:** your PT gets a data-driven report before each appointment.

The vision covers knee, shoulder and elbow injuries, with or without a PT. The first version starts with the knee. RECO was first called Kinn, so the code still lives under `kinn/`.

## Start here

- **Vision:** [`kinn/docs/vision.md`](kinn/docs/vision.md) is the source of truth for what RECO is, who it's for, and what's still open.
- **Decisions:** [`kinn/docs/decisions.md`](kinn/docs/decisions.md) is the running log of what was decided and why.
- **History:** [`kinn/CONTEXT.md`](kinn/CONTEXT.md) covers how the product got here, along with brand, site and market notes.

## In this repo

- **App:** [`kinn/app/`](kinn/app/) is the Expo app and the `@reco/core` logic package. Details are in [`feature-spec.md`](kinn/docs/feature-spec.md) (written before the current vision), [`architecture.md`](kinn/docs/architecture.md), [`scoring-methods.md`](kinn/docs/scoring-methods.md) and [`backend.md`](kinn/docs/backend.md).
- **Hardware:** [`kinn/firmware/`](kinn/firmware/) and [`kinn/hardware/`](kinn/hardware/) hold the prototype tape firmware and coin PCB. [`kinn/cad/`](kinn/cad/) holds the CAD.
- **Website and waitlist:** [`kinn/site/`](kinn/site/) is the static site and a small Express API, deployed on Vercel. Setup is in its README.
- **Renders and video:** [`kinn/renders/`](kinn/renders/), [`kinn/video/`](kinn/video/) and the scene scripts in [`kinn/blender/`](kinn/blender/).
- **Archive:** [`kinn/archive/`](kinn/archive/) holds earlier concepts and demos, including the Poise posture strip and the hackathon learning demo.
