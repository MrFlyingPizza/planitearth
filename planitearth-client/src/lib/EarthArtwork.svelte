<script lang="ts">
  import airplaneUrl from "assets/airplane.svg";
  import earthUrl from "assets/earth.svg";

  let {
    transform,
    showFlightPath,
  }: {
    transform: string;
    showFlightPath: boolean;
  } = $props();
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
      d="M 67 403 A 335 360 0 0 0 737 403"
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
      d="M 737 403 A 335 360 0 0 0 67 403"
      fill="none"
      stroke="#ffffff"
      stroke-width="0.8"
      stroke-dasharray="5 5"
      stroke-linecap="round"
      opacity="0.9"
    />
  {/if}
  <g transform="translate(306 358) scale(1.2)" fill="#ffffff" stroke="#ffffff" stroke-width="10">
    <ellipse cx="30" cy="50" rx="20" ry="30" stroke="none" />
    <ellipse cx="130" cy="50" rx="20" ry="30" stroke="none" />
    <path d="M0 20 C20 0 40 0 60 20" fill="none" />
    <path d="M100 20 C120 0 140 0 160 20" fill="none" />
  </g>
  {#if showFlightPath}
    <g class="plane-motion">
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

</style>
