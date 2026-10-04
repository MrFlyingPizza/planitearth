<script lang="ts">
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
    plasticBottleCount,
    showPasture,
    redMeatCount,
  }: {
    transform: string;
    showFlightPath: boolean;
    showFerries: boolean;
    fadeFlightPath: boolean;
    fadeDecorations: boolean;
    fadeBottles: boolean;
    plasticBottleCount: number;
    showPasture: boolean;
    redMeatCount: number;
  } = $props();

  const ferries = [
    { x: 510, y: 285 },
    { x: 570, y: 285 },
    { x: 630, y: 285 },
  ];
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
    { x: 220, y: 160 },
    { x: 275, y: 150 },
    { x: 325, y: 165 },
    { x: 205, y: 205 },
    { x: 260, y: 198 },
    { x: 315, y: 210 },
    { x: 225, y: 250 },
    { x: 280, y: 242 },
    { x: 335, y: 255 },
    { x: 245, y: 292 },
    { x: 300, y: 285 },
  ];
  const livestockPositions = livestockAnchors.map(({ x, y }) => ({
    wheatX: x + (Math.random() - 0.5) * 22,
    wheatY: y + (Math.random() - 0.5) * 18,
    cowX: x + 19 + (Math.random() - 0.5) * 16,
    cowY: y + 6 + (Math.random() - 0.5) * 14,
  }));
</script>

<svg
  class="earth-artwork"
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
    <image href={pastureUrl} x="195" y="125" width="235" height="229" />
    {#each livestockPositions.slice(0, redMeatCount) as position, index (index)}
      <image
        href={wheatClusterUrl}
        x={position.wheatX}
        y={position.wheatY}
        width="22"
        height="27"
      />
      <image
        href={cowUrl}
        x={position.cowX}
        y={position.cowY}
        width="42"
        height="28"
      />
    {/each}
  {/if}
  <g transform="translate(306 358) scale(1.2)" fill="#ffffff" stroke="#ffffff" stroke-width="10">
    <ellipse cx="30" cy="50" rx="20" ry="30" stroke="none" />
    <ellipse cx="130" cy="50" rx="20" ry="30" stroke="none" />
    <path d="M0 20 C20 0 40 0 60 20" fill="none" />
    <path d="M100 20 C120 0 140 0 160 20" fill="none" />
  </g>
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

  .ferry {
    opacity: 0;
    animation: ferry-fade-in 700ms ease-out forwards;
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
    opacity: 0;
    animation: ferry-fade-in 500ms ease-out forwards;
    transition: opacity 700ms ease-out;
  }

  @keyframes ferry-fade-in {
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ferry,
    .flight-path,
    .plane-motion {
      animation-duration: 1ms;
      animation-delay: 0ms !important;
      transition-duration: 1ms;
    }
  }
</style>
