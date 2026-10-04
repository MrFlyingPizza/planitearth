<script lang="ts">
  import { cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";

  let { onNext }: { onNext: (answer: string) => void } = $props();

  let selectedIndex = $state(0);
  const options = ["0", "1-2", "2-4", "5-7", "8-10", "11+"];
</script>

<section
  class="question-content"
  aria-labelledby="flight-question"
  in:fly={{ y: -120, duration: 2000, easing: cubicOut }}
  out:fly={{ y: 120, duration: 2000, easing: cubicOut }}
>
  <h1 id="flight-question" class="text-header">How many flights do you take per year?</h1>
  <div class="flight-control">
    <label class="sr-only" for="flight-slider">Flights per year</label>
    <input
      id="flight-slider"
      type="range"
      min="0"
      max={options.length - 1}
      step="1"
      bind:value={selectedIndex}
      aria-valuetext={options[selectedIndex]}
    />
    <div class="flight-options" aria-hidden="true">
      {#each options as option (option)}
        <span>{option}</span>
      {/each}
    </div>
  </div>
  <button class="button next-button" type="button" onclick={() => onNext(options[selectedIndex])}>
    Next
  </button>
</section>

<style>
  .question-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin: 0 auto;
    padding: clamp(2rem, 7vh, 5rem) 1.5rem 2rem;
    box-sizing: border-box;
    text-align: center;
  }

  .question-content h1 {
    max-width: 56rem;
  }

  .flight-control {
    width: min(100%, 48rem);
    margin-top: clamp(2rem, 6vh, 4rem);
  }

  .flight-control input {
    display: block;
    width: 100%;
    height: 2rem;
    margin: 0;
    accent-color: var(--color-button);
    cursor: pointer;
  }

  .flight-options {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    margin-top: 0.5rem;
    font-size: 1rem;
    line-height: 1.25;
  }

  .next-button {
    margin-top: 2.5rem;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (max-width: 900px) {
    .question-content {
      padding: 2rem 1rem 1.5rem;
    }

    .flight-control {
      margin-top: 2rem;
    }

    .flight-options {
      font-size: 0.8rem;
    }
  }
</style>
