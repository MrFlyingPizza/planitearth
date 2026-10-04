<script lang="ts">
  import './app.css';
  import { onMount } from "svelte";
  import EarthArtwork from "./lib/EarthArtwork.svelte";
  import FerryQuestionContent from "./lib/contents/FerryQuestionContent.svelte";
  import FlightQuestionContent from "./lib/contents/FlightQuestionContent.svelte";
  import LandingContent from "./lib/contents/LandingContent.svelte";
  import PlasticQuestionContent from "./lib/contents/PlasticQuestionContent.svelte";
  import RedMeatQuestionContent from "./lib/contents/RedMeatQuestionContent.svelte";

  type Step =
    | "landing"
    | "flights"
    | "earth-intermission"
    | "ferry"
    | "plastic-earth-intermission"
    | "plastics"
    | "meat-earth-intermission"
    | "red-meat";
  type Viewport = { width: number; height: number };
  type EarthLayout = {
    size: (viewport: Viewport) => number;
    position: (viewport: Viewport, size: number) => { left: number; top: number };
    showFlightPath: boolean;
  };

  let viewport = $state({ width: 0, height: 0 });
  let currentStep = $state<Step>("landing");
  let answers = $state<{
    flights?: string;
    ferry?: string;
    flightExhaustLevel?: number;
    ferryExhaustLevel?: number;
    plasticBottles?: number;
    redMeatCount?: number;
  }>({});
  let intermissionTimeout: ReturnType<typeof setTimeout> | undefined;

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
    answers.flights = answer;
    startIntermission("ferry");
  }

  function saveFlightExhaustLevel(level: number) {
    answers.flightExhaustLevel = level;
  }

  function startIntermission(nextStep: "ferry" | "plastics" | "red-meat") {
    const intermissionStep: Record<typeof nextStep, Step> = {
      ferry: "earth-intermission",
      plastics: "plastic-earth-intermission",
      "red-meat": "meat-earth-intermission",
    };
    currentStep = intermissionStep[nextStep];
    clearTimeout(intermissionTimeout);
    intermissionTimeout = setTimeout(
      () => currentStep = nextStep,
      earthTransitionDuration + earthIntermissionDuration,
    );
  }

  function saveFerryAnswer(answer: string) {
    answers.ferry = answer;
    startIntermission("plastics");
  }

  function saveFerryExhaustLevel(level: number) {
    answers.ferryExhaustLevel = level;
  }

  function savePlasticAnswer(bottleCount: number) {
    answers.plasticBottles = bottleCount;
  }

  function nextFromPlastics(bottleCount: number) {
    answers.plasticBottles = bottleCount;
    startIntermission("red-meat");
  }

  function saveRedMeatAnswer(count: number) {
    answers.redMeatCount = count;
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
        ? (answers.flightExhaustLevel ?? 0)
        : 0
    }
    ferryExhaustLevel={
      currentStep === "ferry" || currentStep === "plastic-earth-intermission"
        ? (answers.ferryExhaustLevel ?? 0)
        : 0
    }
    plasticBottleCount={
      currentStep === "plastics" || currentStep === "meat-earth-intermission" || currentStep === "red-meat"
        ? (answers.plasticBottles ?? 1)
        : 0
    }
    showPasture={currentStep === "red-meat"}
    redMeatCount={currentStep === "red-meat" ? (answers.redMeatCount ?? 0) : 0}
  />
  <div class="content-stage">
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
        onNext={saveRedMeatAnswer}
        onSelectionChange={saveRedMeatAnswer}
      />
    {/if}
  </div>
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
  .content-stage :global(.red-meat-question-content) {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
  }
</style>
