<script lang="ts">
  import { onMount } from "svelte";
  import EarthArtwork from "./lib/EarthArtwork.svelte";
  import FerryQuestionContent from "./lib/contents/FerryQuestionContent.svelte";
  import FlightFactContent from "./lib/contents/FlightFactContent.svelte";
  import FlightQuestionContent from "./lib/contents/FlightQuestionContent.svelte";
  import LandingContent from "./lib/contents/LandingContent.svelte";

  type Step = "landing" | "flights" | "flight-fact" | "earth-intermission" | "ferry";
  type Viewport = { width: number; height: number };
  type EarthLayout = {
    size: (viewport: Viewport) => number;
    position: (viewport: Viewport, size: number) => { left: number; top: number };
    showFlightPath: boolean;
  };

  let viewport = $state({ width: 0, height: 0 });
  let currentStep = $state<Step>("landing");
  let answers = $state<{ flights?: string; ferry?: string }>({});
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
    "flight-fact": flightEarthLayout,
    "earth-intermission": centeredEarthLayout,
    ferry: {
      size: ({ height }) => height * 2,
      position: ({ height }, size) => ({
        left: -size * 0.42,
        top: height - size * 0.45,
      }),
      showFlightPath: false,
    },
  };

  function begin() {
    currentStep = "flights";
  }

  function next(answer: string) {
    answers.flights = answer;
    currentStep = "flight-fact";
  }

  function continueToFerry() {
    currentStep = "earth-intermission";
    intermissionTimeout = setTimeout(
      () => (currentStep = "ferry"),
      earthTransitionDuration + earthIntermissionDuration,
    );
  }

  function saveFerryAnswer(answer: string) {
    answers.ferry = answer;
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
    showFlightPath={stepStates[currentStep].showFlightPath}
  />
  <div class="content-stage">
    {#if currentStep === "landing"}
      <LandingContent onBegin={begin} />
    {:else if currentStep === "flights"}
      <FlightQuestionContent onNext={next} />
    {:else if currentStep === "flight-fact"}
      <FlightFactContent onContinue={continueToFerry} />
    {:else if currentStep === "ferry"}
      <FerryQuestionContent onNext={saveFerryAnswer} />
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
  .content-stage :global(.fact-content),
  .content-stage :global(.ferry-question-content) {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
  }
</style>
