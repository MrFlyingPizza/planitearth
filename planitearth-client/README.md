# Planit Earth

A six-question Svelte 5 survey with a persistent Phaser 4 planet built from local
SVG textures. Answer a question, watch the camera focus on the planet and the
effect animate, then return to the next question. The finale replays recorded
state snapshots and opens an answer summary.

## Development

Use Node.js 24 and pnpm with the existing lockfile.

```sh
pnpm install
pnpm dev
pnpm check
pnpm test
pnpm build
```

## Architecture

- [App.svelte](src/App.svelte): survey controls, progression, feedback, and results.
  Related reactive data is grouped into `$state` objects for survey data/input,
  experience phase/feedback, and DOM element references; `$derived` runes expose
  the current question and final planet state.
- [survey-data.ts](src/lib/survey-data.ts): the preprogrammed, typed question and
  answer sequence. Change the local sequence to control the experience.
- [survey.ts](src/lib/survey.ts): input validation, normalized Earth state, and
  before/after records.
- [Planet.svelte](src/lib/Planet.svelte): Phaser mounting and teardown.
- [earth-view.ts](src/lib/earth-view.ts): SVG loading, camera compositions,
  completion-driven animation promises, and lifecycle cancellation.
- [earth assets](src/assets/earth): individually animated SVG layers. Phaser
  rasterizes them at load time; these are not live DOM SVG paths.

Questions support single selection, multi-selection (including no selections),
and stepped sliders with optional not-applicable answers. Tentative input has
no effect until submission. The planet is decorative: textual explanations and
the final summary communicate its meaning without relying on the canvas.

## Effect contract

The sequence is `{ id, questions }`. Each question has an ID, title, description,
category, and discriminated `type`:

- `single`: options with IDs, labels, explanations, and `effects`.
- `multi`: the same options, plus `baseEffects`; selected option effects are
  additive deltas against those reference values, then clamped to 0–1.
- `slider`: `min`, `max`, `step`, `unit`, `metric`, `from`, `to`, `explanation`,
  and `allowSkip`. The endpoints interpolate linearly between `from` and `to`.

Supported metrics are `transport`, `agriculture`, `energy`, `waste`, `water`,
and `habitat`. Single-select and slider effects set a metric to a normalized
0–1 value; each of the six questions owns a different metric. An empty effect
object means unassessed, not zero impact. If future questions share a metric,
the latest assessed value replaces the earlier value: redesign the aggregation
contract before using them for additive impacts.

The initial planet is an arbitrary reference illustration, not a measured
world average. Haze combines transport, agriculture, and energy values.
Other layers show agricultural footprint, energy mix, new waste, water demand,
and habitat diversity. Larger bars mean more of the named property, not a
universal good/bad score. All magnitudes are authored visual signals, not
scientific measurements or personal footprint calculations.

The sequence is authored directly in `survey-data.ts`; questions, answers, and
effects are bundled with the frontend. There are no network requests for survey
content or answer submission. To change the experience, edit that typed sequence.

## Accessibility and verification

Controls use native HTML inputs, fieldsets, keyboard focus, and validation
feedback. Pending animations cancel on teardown. Restart creates a fresh scene
and resets the answer history.

`pnpm test` uses Node's built-in test runner and TypeScript stripping to cover
the programmed question sequence, all answer types, endpoint values,
accumulation, unassessed answers, and duplicate submission.
Browser checks should also cover the six-question flow, responsive resizing,
finale, restart, and reduced motion.
