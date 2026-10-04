<script lang="ts">
  import './app.css';
  import { Info } from "@lucide/svelte";
  import { onMount } from "svelte";
  import EarthArtwork from "./lib/EarthArtwork.svelte";
  import FerryQuestionContent from "./lib/contents/FerryQuestionContent.svelte";
  import FlightQuestionContent from "./lib/contents/FlightQuestionContent.svelte";
  import ImpactFeedbackContent from "./lib/contents/ImpactFeedbackContent.svelte";
  import LandingContent from "./lib/contents/LandingContent.svelte";
  import PlasticQuestionContent from "./lib/contents/PlasticQuestionContent.svelte";
  import ReadyImpactContent from "./lib/contents/ReadyImpactContent.svelte";
  import RedMeatQuestionContent from "./lib/contents/RedMeatQuestionContent.svelte";
  import { parseImpactFeedback, type ImpactFeedback } from "./lib/state/impact-feedback";
  import {
    createQuestionResponses,
    type QuestionResponse,
  } from "./lib/state/questions-and-answers.svelte";

  type Step =
    | "landing"
    | "flights"
    | "earth-intermission"
    | "ferry"
    | "plastic-earth-intermission"
    | "plastics"
    | "meat-earth-intermission"
    | "red-meat"
    | "final-earth-intermission"
    | "ready-impact"
    | "impact-reveal";
  type Viewport = { width: number; height: number };
  type EarthLayout = {
    size: (viewport: Viewport) => number;
    position: (viewport: Viewport, size: number) => { left: number; top: number };
    showFlightPath: boolean;
  };

  let viewport = $state({ width: 0, height: 0 });
  let currentStep = $state<Step>("landing");
  let impactRevealStarted = $state(false);
  let earthShaking = $state(false);
  let screenWhitening = $state(false);
  let feedbackRequested = false;
  let feedbackResult = $state<ImpactFeedback | undefined>();
  let feedbackError = $state<string | undefined>();
  let attributionOpen = $state(false);
  const responses = createQuestionResponses();
  let intermissionTimeout: ReturnType<typeof setTimeout> | undefined;
  let impactRevealTimeout: ReturnType<typeof setTimeout> | undefined;

  const flightOptions = ["0", "1-2", "2-4", "5-7", "8-10", "11+"];
  const ferryOptions = ["0", "1-7", "8-15", "16-23", "24-30", "31+"];
  const plasticOptions = [
    { label: "I do my best to avoid single-use plastics", bottleCount: 1 },
    { label: "I try to avoid it, but could be better", bottleCount: 5 },
    { label: "It doesn't matter to me", bottleCount: 20 },
  ];
  const redMeatOptions = [
    { label: "0", count: 0 },
    { label: "1-2", count: 2 },
    { label: "2-4", count: 3 },
    { label: "5-7", count: 6 },
    { label: "8-10", count: 9 },
    { label: "11+", count: 11 },
  ];

  let flightExhaustLevel = $derived(
    flightOptions.indexOf(responses.get("flights")?.answer ?? "0"),
  );
  let ferryExhaustLevel = $derived(
    ferryOptions.indexOf(responses.get("ferry")?.answer ?? "0"),
  );
  let plasticBottleCount = $derived(
    plasticOptions.find(({ label }) => label === responses.get("plastics")?.answer)?.bottleCount ?? 1,
  );
  let redMeatCount = $derived(
    redMeatOptions.find(({ label }) => label === responses.get("redMeat")?.answer)?.count ?? 0,
  );

  const earthTransitionDuration = 2000;
  const earthIntermissionDuration = 1000;

  const flightEarthLayout: EarthLayout = {
    size: ({ height }) => height / 0.2,
    position: ({ width, height }, size) => ({
      left: width / 2 - size / 2,
      top: height * 0.56,
    }),
    showFlightPath: true,
  };

  const centeredEarthLayout: EarthLayout = {
    size: ({ width, height }) => Math.min(width * 0.7, height * 0.85, 640),
    position: ({ width, height }, size) => ({
      left: width / 2 - size / 2,
      top: height / 2 - size / 2,
    }),
    showFlightPath: false,
  };

  const readyImpactEarthLayout: EarthLayout = {
    size: ({ width, height }) => Math.min(width * 0.42, height * 0.42, 340),
    position: ({ width, height }, size) => ({
      left: width / 2 - size / 2,
      top: height * 0.05,
    }),
    showFlightPath: false,
  };

  const stepStates: Record<Step, EarthLayout> = {
    landing: {
      size: ({ width, height }) =>
        Math.min(width < 900 ? width * 0.9 : width * 0.45, height * 0.9, 640),
      position: ({ width, height }, size) => ({
        left: (width < 900 ? width / 2 : width * 0.25) - size / 2,
        top: height / 2 - size / 2,
      }),
      showFlightPath: false,
    },
    flights: flightEarthLayout,
    "earth-intermission": { ...centeredEarthLayout, showFlightPath: true },
    "plastic-earth-intermission": centeredEarthLayout,
    "meat-earth-intermission": centeredEarthLayout,
    "final-earth-intermission": centeredEarthLayout,
    "ready-impact": readyImpactEarthLayout,
    "impact-reveal": centeredEarthLayout,
    ferry: {
      size: ({ height }) => height * 2,
      position: ({ height }, size) => ({
        left: -size * 0.42,
        top: height - size * 0.45,
      }),
      showFlightPath: false,
    },
    plastics: {
      size: ({ width, height }) =>
        width < 900
          ? Math.min(width * 0.48, height * 0.72, 440)
          : Math.min(width * 0.62, height * 0.9, 720),
      position: ({ width, height }, size) => ({
        left: width - size,
        top: height / 2 - size / 2,
      }),
      showFlightPath: false,
    },
    "red-meat": {
      size: ({ width, height }) => Math.min(width, height * 1.8),
      position: ({ height }, size) => ({
        left: -size * 0.25,
        top: height - size * 0.5,
      }),
      showFlightPath: false,
    },
  };

  function begin() {
    currentStep = "flights";
  }

  function next(answer: string) {
    responses.set("flights", answer);
    startIntermission("ferry");
  }

  function saveFlightExhaustLevel(level: number) {
    responses.set("flights", flightOptions[level]);
  }

  function startIntermission(
    nextStep: "ferry" | "plastics" | "red-meat" | "ready-impact",
  ) {
    const intermissionStep: Record<typeof nextStep, Step> = {
      ferry: "earth-intermission",
      plastics: "plastic-earth-intermission",
      "red-meat": "meat-earth-intermission",
      "ready-impact": "final-earth-intermission",
    };
    currentStep = intermissionStep[nextStep];
    clearTimeout(intermissionTimeout);
    intermissionTimeout = setTimeout(
      () => currentStep = nextStep,
      earthTransitionDuration + earthIntermissionDuration,
    );
  }

  function saveFerryAnswer(answer: string) {
    responses.set("ferry", answer);
    startIntermission("plastics");
  }

  function saveFerryExhaustLevel(level: number) {
    responses.set("ferry", ferryOptions[level]);
  }

  function savePlasticAnswer(bottleCount: number) {
    const answer = plasticOptions.find((option) => option.bottleCount === bottleCount);
    if (!answer) throw new Error(`Unknown plastic bottle count: ${bottleCount}`);
    responses.set("plastics", answer.label);
  }

  function nextFromPlastics(bottleCount: number) {
    savePlasticAnswer(bottleCount);
    startIntermission("red-meat");
  }

  function saveRedMeatAnswer(count: number) {
    const answer = redMeatOptions.find((option) => option.count === count);
    if (!answer) throw new Error(`Unknown red meat count: ${count}`);
    responses.set("redMeat", answer.label);
  }

  function finishSurvey(count: number) {
    saveRedMeatAnswer(count);
    startIntermission("ready-impact");
  }

  function beginImpactReveal() {
    impactRevealStarted = true;
    currentStep = "impact-reveal";
    clearTimeout(impactRevealTimeout);
    impactRevealTimeout = setTimeout(() => {
      earthShaking = true;
      screenWhitening = true;
    }, earthTransitionDuration);
  }

  async function requestImpactFeedback(
    responseData: QuestionResponse[],
  ): Promise<ImpactFeedback> {
    const maxRetries = 2;
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        const response = await fetch("/api/client-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(responseData),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(
            `Feedback API request failed (${response.status}): ${errorBody}`,
          );
        }

        return parseImpactFeedback(await response.json());
      } catch (error) {
        lastError = error;
        if (attempt === maxRetries) break;

        console.warn(
          `Feedback API attempt ${attempt + 1} failed; retrying.`,
          error,
        );
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }

    throw lastError;
  }

  async function postResponsesAfterWhiteout(event: TransitionEvent) {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== "opacity" ||
      !screenWhitening ||
      feedbackRequested
    ) {
      return;
    }

    feedbackRequested = true;
    const responseData = Object.values(responses.all).filter(
      (response) => response !== undefined,
    );

    try {
      const result = await requestImpactFeedback(responseData);
      console.log("Feedback API response:", result);
      feedbackResult = result;
      screenWhitening = false;
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      feedbackError = "We couldn't load your impact feedback. Please try again later.";
      screenWhitening = false;
    }
  }

  let earthTransform = $derived.by(() => {
    const { width, height } = viewport;
    if (!width || !height) return "translate3d(-1000px, -1000px, 0) scale(0)";

    const layout = stepStates[currentStep];
    const earthSize = layout.size(viewport);
    const scale = earthSize / 804;
    const { left, top } = layout.position(viewport, earthSize);

    return `translate3d(${left}px, ${top}px, 0) scale(${scale})`;
  });

  function measureViewport() {
    viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  onMount(() => {
    measureViewport();
    window.addEventListener("resize", measureViewport);

    return () => window.removeEventListener("resize", measureViewport);
  });

  onMount(() => () => clearTimeout(intermissionTimeout));
  onMount(() => () => clearTimeout(impactRevealTimeout));
</script>

<main>
  <div class="attribution-control" class:is-open={attributionOpen}>
    <button
      class="attribution-trigger"
      type="button"
      aria-label="Show application attribution"
      aria-describedby="attribution-tooltip"
      aria-expanded={attributionOpen}
      onclick={() => attributionOpen = !attributionOpen}
    >
      <Info size={16} aria-hidden="true" />
    </button>
    <div class="attribution-tooltip" id="attribution-tooltip" role="tooltip">
      <p><strong>Designers</strong> Honbete Lee and Kobe Duyvestyn</p>
      <p><strong>Developers</strong> Jarel Tan and Richard Gao</p>
      <p>Made for SFU Surge StormHacks 2026</p>
    </div>
  </div>
  <EarthArtwork
    transform={earthTransform}
    showFlightPath={stepStates[currentStep].showFlightPath || currentStep === "ferry"}
    showFerries={currentStep === "ferry" || currentStep === "plastic-earth-intermission"}
    fadeFlightPath={currentStep === "ferry"}
    fadeDecorations={currentStep === "plastics"}
    fadeBottles={currentStep === "red-meat"}
    flightExhaustLevel={
      currentStep === "flights" || currentStep === "earth-intermission"
        ? flightExhaustLevel
        : 0
    }
    ferryExhaustLevel={
      currentStep === "ferry" || currentStep === "plastic-earth-intermission"
        ? ferryExhaustLevel
        : 0
    }
    plasticBottleCount={
      currentStep === "plastics" || currentStep === "meat-earth-intermission" || currentStep === "red-meat"
        ? plasticBottleCount
        : 0
    }
    showPasture={currentStep === "red-meat" || currentStep === "final-earth-intermission"}
    redMeatCount={
      currentStep === "red-meat" || currentStep === "final-earth-intermission"
        ? redMeatCount
        : 0
    }
    earthShaking={earthShaking}
  />
  <div class="content-stage" class:impact-fading={impactRevealStarted}>
    {#if currentStep === "landing"}
      <LandingContent onBegin={begin} />
    {:else if currentStep === "flights"}
      <FlightQuestionContent onNext={next} onSelectionChange={saveFlightExhaustLevel} />
    {:else if currentStep === "ferry"}
      <FerryQuestionContent
        onNext={saveFerryAnswer}
        onSelectionChange={saveFerryExhaustLevel}
      />
    {:else if currentStep === "plastics"}
      <PlasticQuestionContent
        onNext={nextFromPlastics}
        onSelectionChange={savePlasticAnswer}
      />
    {:else if currentStep === "red-meat"}
      <RedMeatQuestionContent
        onNext={finishSurvey}
        onSelectionChange={saveRedMeatAnswer}
      />
    {:else if currentStep === "ready-impact" || currentStep === "impact-reveal"}
      <ReadyImpactContent onYes={beginImpactReveal} />
    {/if}
  </div>
  {#if feedbackResult}
    <ImpactFeedbackContent result={feedbackResult} />
  {:else if feedbackError}
    <div class="impact-feedback-error" role="alert">{feedbackError}</div>
  {/if}
  <div
    class:active={screenWhitening}
    class="impact-whiteout"
    aria-hidden="true"
    ontransitionend={postResponsesAfterWhiteout}
  ></div>
</main>

<style>
  main {
    position: relative;
    min-height: 100vh;
    min-height: 100svh;
    overflow: hidden;
    isolation: isolate;
  }

  .attribution-control {
    position: fixed;
    z-index: 3;
    bottom: 0.75rem;
    right: 0.75rem;
  }

  .attribution-trigger {
    display: grid;
    width: 2rem;
    height: 2rem;
    place-items: center;
    border: 1px solid rgb(255 255 255 / 14%);
    border-radius: 9999px;
    background: rgb(40 43 65 / 46%);
    color: rgb(255 255 255 / 62%);
    cursor: pointer;
    opacity: 0.72;
    transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease, opacity 150ms ease;
  }

  .attribution-trigger:hover,
  .attribution-trigger:focus-visible {
    border-color: #4aff8f;
    background: #373b55;
    color: #fff;
    opacity: 1;
  }

  .attribution-trigger:focus-visible {
    outline: 2px solid #4aff8f;
    outline-offset: 3px;
  }

  .attribution-tooltip {
    position: absolute;
    bottom: calc(100% + 0.625rem);
    right: 0;
    width: min(20rem, calc(100vw - 2rem));
    padding: 1rem 1.125rem;
    border: 1px solid rgb(255 255 255 / 20%);
    border-radius: 0.5rem;
    background: #282b41;
    box-shadow: 0 0.75rem 2rem rgb(0 0 0 / 28%);
    color: #fff;
    font-size: 0.875rem;
    line-height: 1.5;
    opacity: 0;
    pointer-events: none;
    transform: translateY(0.25rem);
    transition: opacity 150ms ease, transform 150ms ease, visibility 150ms;
    visibility: hidden;
  }

  .attribution-tooltip p {
    margin: 0;
  }

  .attribution-tooltip p + p {
    margin-top: 0.5rem;
  }

  .attribution-control:hover .attribution-tooltip,
  .attribution-control:focus-within .attribution-tooltip,
  .attribution-control.is-open .attribution-tooltip {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
    visibility: visible;
  }

  .content-stage {
    position: absolute;
    inset: 0;
    transition: opacity 700ms ease-out;
  }

  .content-stage.impact-fading {
    opacity: 0;
    pointer-events: none;
  }

  .impact-whiteout {
    position: fixed;
    z-index: 2;
    inset: 0;
    background: #fff;
    opacity: 0;
    pointer-events: none;
    transition: opacity 1400ms ease-in;
  }

  .impact-whiteout.active {
    opacity: 1;
  }

  .impact-feedback-error {
    position: fixed;
    z-index: 1;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 2rem;
    background: #fff;
    color: #282b41;
    text-align: center;
    font-size: clamp(1.25rem, 3vw, 2rem);
  }

  @media (prefers-reduced-motion: reduce) {
    .content-stage,
    .impact-whiteout {
      transition-duration: 1ms;
    }
  }

  .content-stage :global(.landing-content),
  .content-stage :global(.question-content),
  .content-stage :global(.ferry-question-content) {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
  }

  .content-stage :global(.plastic-question-content),
  .content-stage :global(.red-meat-question-content),
  .content-stage :global(.ready-impact-content) {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
  }
</style>
