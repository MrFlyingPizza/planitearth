<script lang="ts">
  import './app.css';
  import { onMount } from "svelte";
  import EarthArtwork from "./lib/EarthArtwork.svelte";
  import FerryQuestionContent from "./lib/contents/FerryQuestionContent.svelte";
  import FlightQuestionContent from "./lib/contents/FlightQuestionContent.svelte";
  import LandingContent from "./lib/contents/LandingContent.svelte";
  import PlasticQuestionContent from "./lib/contents/PlasticQuestionContent.svelte";
  import ReadyImpactContent from "./lib/contents/ReadyImpactContent.svelte";
  import RedMeatQuestionContent from "./lib/contents/RedMeatQuestionContent.svelte";
  import { createQuestionResponses } from "./lib/state/questions-and-answers.svelte";

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
  let responsesPrinted = false;
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

  function printResponsesAfterWhiteout(event: TransitionEvent) {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== "opacity" ||
      !screenWhitening ||
      responsesPrinted
    ) {
      return;
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
  <div
    class:active={screenWhitening}
    class="impact-whiteout"
    aria-hidden="true"
    ontransitionend={printResponsesAfterWhiteout}
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
