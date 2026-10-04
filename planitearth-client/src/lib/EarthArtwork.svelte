<script lang="ts">
  import { fade } from "svelte/transition";
  import airplaneUrl from "assets/airplane.svg";
  import earthUrl from "assets/earth.svg";
  import ferryUrl from "assets/ferry.svg";
  import plasticBottleUrl from "assets/plastic-bottle.svg";
  import pastureUrl from "assets/pasture.svg";
  import wheatClusterUrl from "assets/wheat-cluster.svg";
  import cowUrl from "assets/cow.svg";

  let {
    transform,
    showFlightPath,
    showFerries,
    fadeFlightPath,
    fadeDecorations,
    fadeBottles,
    flightExhaustLevel,
    ferryExhaustLevel,
    plasticBottleCount,
    showPasture,
    redMeatCount,
    earthShaking,
  }: {
    transform: string;
    showFlightPath: boolean;
    showFerries: boolean;
    fadeFlightPath: boolean;
    fadeDecorations: boolean;
    fadeBottles: boolean;
    flightExhaustLevel: number;
    ferryExhaustLevel: number;
    plasticBottleCount: number;
    showPasture: boolean;
    redMeatCount: number;
    earthShaking: boolean;
  } = $props();

  const ferries = [
    { x: 510, y: 285 },
    { x: 570, y: 285 },
    { x: 630, y: 285 },
  ];
  const flightExhaustParticles = Array.from({ length: 100 }, (_, index) => {
    const angle = (index / 100) * Math.PI * 2;
    return {
      index,
      x: 402 + Math.cos(angle) * 335,
      y: 403 + Math.sin(angle) * 360,
      radius: 3 + (index % 4),
    };
  });
  const ferryExhaustParticles = Array.from({ length: 30 }, (_, index) => {
    const ferry = ferries[index % ferries.length];
    const trailIndex = Math.floor(index / ferries.length);
    return {
      x: ferry.x + 34 - trailIndex * 5 + (index % 2) * 3,
      y: ferry.y + 17 - trailIndex * 3,
      radius: 2 + (index % 3),
    };
  });
  const bottles = [
    { x: 70, y: 210, rotation: -16 },
    { x: 173, y: 307, rotation: 8 },
    { x: 320, y: 270, rotation: 19 },
    { x: 119, y: 334, rotation: -7 },
    { x: 158, y: 344, rotation: -22 },
    { x: 196, y: 330, rotation: 13 },
    { x: 335, y: 345, rotation: -12 },
    { x: 45, y: 390, rotation: -18 },
    { x: 165, y: 383, rotation: 22 },
    { x: 202, y: 372, rotation: -9 },
    { x: 240, y: 359, rotation: 15 },
    { x: 111, y: 414, rotation: 11 },
    { x: 150, y: 423, rotation: -17 },
    { x: 188, y: 411, rotation: 24 },
    { x: 225, y: 400, rotation: -20 },
    { x: 133, y: 454, rotation: -11 },
    { x: 171, y: 461, rotation: 17 },
    { x: 209, y: 448, rotation: -4 },
    { x: 247, y: 432, rotation: 20 },
    { x: 185, y: 493, rotation: -14 },
  ];
  const livestockAnchors = [
    { x: 250, y: 190 },
    { x: 300, y: 180 },
    { x: 350, y: 195 },
    { x: 255, y: 230 },
    { x: 305, y: 225 },
    { x: 355, y: 235 },
    { x: 270, y: 270 },
    { x: 320, y: 265 },
    { x: 360, y: 275 },
    { x: 285, y: 300 },
    { x: 335, y: 295 },
  ];
  const livestockPositions = livestockAnchors.map(({ x, y }) => ({
    wheatX: x + (Math.random() - 0.5) * 12,
    wheatY: y + (Math.random() - 0.5) * 10,
    cowX: x + 19 + (Math.random() - 0.5) * 12,
    cowY: y + 6 + (Math.random() - 0.5) * 10,
  }));
</script>

<svg
  class="earth-artwork"
  class:earth-shaking={earthShaking}
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 804 806"
  aria-hidden="true"
  style:transform
>
  {#if showFlightPath}
    <path
      id="flight-path-back"
      class:fade-out={fadeFlightPath}
      d="M 67 403 A 335 360 0 0 0 737 403"
      class="flight-path"
      fill="none"
      stroke="#ffffff"
      stroke-width="0.8"
      stroke-dasharray="5 5"
      stroke-linecap="round"
      opacity="0.9"
    />
  {/if}
  <image href={earthUrl} x="0" y="0" width="804" height="806" />
  {#if showFlightPath}
    <path
      id="flight-path-front"
      class:fade-out={fadeFlightPath}
      d="M 737 403 A 335 360 0 0 0 67 403"
      class="flight-path"
      fill="none"
      stroke="#ffffff"
      stroke-width="0.8"
      stroke-dasharray="5 5"
      stroke-linecap="round"
      opacity="0.9"
    />
  {/if}
  {#if showPasture}
    <image
      class="pasture-decoration"
      href={pastureUrl}
      x="195"
      y="125"
      width="235"
      height="229"
      transition:fade|global={{ duration: 700 }}
    />
    {#each livestockPositions.slice(0, redMeatCount) as position, index (index)}
      <image
        href={wheatClusterUrl}
        x={position.wheatX}
        y={position.wheatY}
        width="22"
        height="27"
        transition:fade|global={{ duration: 500, delay: index * 80 }}
      />
      <image
        href={cowUrl}
        x={position.cowX}
        y={position.cowY}
        width="42"
        height="28"
        transition:fade|global={{ duration: 500, delay: index * 80 + 40 }}
      />
    {/each}
  {/if}
  {#each flightExhaustParticles.filter((particle) => particle.index % 5 < flightExhaustLevel) as particle (particle.index)}
    <circle
      class="exhaust-particle"
      cx={particle.x}
      cy={particle.y}
      r={particle.radius}
      opacity={0.55 + (particle.index % 4) * 0.1}
      transition:fade={{ duration: 700 }}
    />
  {/each}
  <g transform="translate(306 358) scale(1.2)" fill="#ffffff" stroke="#ffffff" stroke-width="10">
    <ellipse cx="30" cy="50" rx="20" ry="30" stroke="none" />
    <ellipse cx="130" cy="50" rx="20" ry="30" stroke="none" />
    <path d="M0 20 C20 0 40 0 60 20" fill="none" />
    <path d="M100 20 C120 0 140 0 160 20" fill="none" />
  </g>
  {#each ferryExhaustParticles.slice(0, ferryExhaustLevel * 4) as particle, index (index)}
    <circle
      class="exhaust-particle"
      cx={particle.x}
      cy={particle.y}
      r={particle.radius}
      opacity={0.35 + (index % 3) * 0.15}
      transition:fade={{ duration: 700 }}
    />
  {/each}
  {#if showFerries}
    {#each ferries as ferry, index (index)}
      <image
        class="ferry"
        class:fade-out={fadeDecorations}
        href={ferryUrl}
        x={ferry.x}
        y={ferry.y}
        width="64"
        height="66"
        style:animation-delay={`${index * 180}ms`}
      />
    {/each}
  {/if}
  {#each bottles.slice(0, plasticBottleCount) as bottle, index (index)}
    <image
      class="plastic-bottle"
      class:fade-out={fadeBottles}
      href={plasticBottleUrl}
      x={bottle.x}
      y={bottle.y}
      width="30"
      height="52"
      transform={`rotate(${bottle.rotation} ${bottle.x + 15} ${bottle.y + 26})`}
      transition:fade={{ duration: 500 }}
    />
  {/each}
  {#if showFlightPath}
    <g class="plane-motion" class:fade-out={fadeFlightPath}>
      <animateMotion dur="12s" repeatCount="indefinite" rotate="auto">
        <mpath href="#flight-orbit" />
      </animateMotion>
      <animate
        attributeName="opacity"
        values="1;1;0;0;1"
        keyTimes="0;0.499;0.5;0.999;1"
        calcMode="discrete"
        dur="12s"
        repeatCount="indefinite"
      />
      <g transform="translate(-19.5 -14.6) scale(0.09)">
        <g transform="rotate(15 229.5 105.5)">
          <image href={airplaneUrl} x="0" y="0" width="459" height="211" />
        </g>
      </g>
    </g>
  {/if}
  {#if showFlightPath}
    <path
      id="flight-orbit"
      d="M 67 403 A 335 360 0 0 1 737 403 A 335 360 0 0 1 67 403"
      fill="none"
      stroke="none"
    />
  {/if}
</svg>

<style>
  .earth-artwork {
    position: fixed;
    z-index: 0;
    top: 0;
    left: 0;
    width: 804px;
    height: 806px;
    overflow: visible;
    pointer-events: none;
    transform-origin: top left;
    transition: transform 2000ms cubic-bezier(0.33, 1, 0.68, 1);
  }

  .earth-shaking {
    animation: earth-shake 700ms ease-in-out infinite;
  }

  @keyframes earth-shake {
    0%, 100% { translate: 0 0; }
    20% { translate: -12px 3px; }
    40% { translate: 11px -4px; }
    60% { translate: -8px -2px; }
    80% { translate: 8px 4px; }
  }

  .ferry {
    opacity: 0;
    animation: ferry-fade-in 700ms ease-out forwards;
  }

  .exhaust-particle {
    fill: #f4f0dc;
    stroke: #66757d;
    stroke-width: 1;
  }

  .flight-path,
  .plane-motion,
  .ferry {
    transition: opacity 700ms ease-out;
  }

  .fade-out {
    opacity: 0 !important;
  }

  .plastic-bottle {
    transition: opacity 700ms ease-out;
  }

  .pasture-decoration {
    opacity: 1;
  }

  @keyframes ferry-fade-in {
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .earth-shaking {
      animation-duration: 1ms;
    }

    .ferry,
    .flight-path,
    .plane-motion {
      animation-duration: 1ms;
      animation-delay: 0ms !important;
      transition-duration: 1ms;
    }
  }
</style>
