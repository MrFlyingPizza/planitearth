<script lang="ts">
  import { cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";

  let { onNext }: { onNext: (answer: string) => void } = $props();

  let selectedIndex = $state(0);
  const options = ["0", "1-7", "8-15", "16-23", "24-30", "31+"];
</script>

<section
  class="ferry-question-content"
  aria-labelledby="ferry-question"
  in:fly={{ y: -120, duration: 2000, easing: cubicOut }}
>
  <h1 id="ferry-question" class="text-header">
    On average, how many days per year do you travel by ferry?
  </h1>
  <div class="ferry-control">
    <label class="sr-only" for="ferry-slider">Days traveling by ferry per year</label>
    <input
      id="ferry-slider"
      type="range"
      min="0"
      max={options.length - 1}
      step="1"
      bind:value={selectedIndex}
      aria-valuetext={options[selectedIndex]}
    />
    <div class="ferry-options" aria-hidden="true">
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
  .ferry-question-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: min(62%, 52rem);
    min-height: 100vh;
    min-height: 100svh;
    margin-left: auto;
    padding: 3rem clamp(2rem, 5vw, 5rem);
    box-sizing: border-box;
    text-align: center;
  }

  .ferry-question-content h1 {
    max-width: 48rem;
  }

  .ferry-control {
    width: min(100%, 48rem);
    margin-top: clamp(2rem, 6vh, 4rem);
  }

  .ferry-control input {
    display: block;
    width: 100%;
    height: 2rem;
    margin: 0;
    accent-color: var(--color-button);
    cursor: pointer;
  }

  .ferry-options {
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
    .ferry-question-content {
      justify-content: flex-start;
      width: 100%;
      min-height: 0;
      padding: 2rem 1rem;
    }

    .ferry-control {
      margin-top: 2rem;
    }

    .ferry-options {
      font-size: 0.8rem;
    }
  }
</style>
