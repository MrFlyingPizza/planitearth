<script lang="ts">
  import { cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";
  import { Button } from "$lib/components/ui/button/index.js";
  import { questionTexts } from "$lib/state/question-texts.js";

  let {
    onNext,
    onSelectionChange,
  }: {
    onNext: (count: number) => void;
    onSelectionChange: (count: number) => void;
  } = $props();

  const options = [
    { label: "0", count: 0 },
    { label: "1-2", count: 2 },
    { label: "2-4", count: 3 },
    { label: "5-7", count: 6 },
    { label: "8-10", count: 9 },
    { label: "11+", count: 11 },
  ];
  let selectedIndex = $state(0);

  function selectIndex(index: number) {
    selectedIndex = index;
    onSelectionChange(options[index].count);
  }
</script>

<section
  class="red-meat-question-content"
  aria-labelledby="red-meat-question"
  in:fly={{ y: -120, duration: 2000, easing: cubicOut }}
>
  <h1 id="red-meat-question" class="text-display">
    {questionTexts.redMeat}
  </h1>
  <p>(e.g. beef, lamb, etc.)</p>
  <div class="red-meat-control">
    <label class="sr-only" for="red-meat-slider">Red meat meals per week</label>
    <input
      id="red-meat-slider"
      type="range"
      min="0"
      max={options.length - 1}
      step="1"
      value={selectedIndex}
      aria-valuetext={options[selectedIndex].label}
      oninput={(event) => selectIndex(Number(event.currentTarget.value))}
    />
    <div class="red-meat-options" aria-hidden="true">
      {#each options as option (option.label)}
        <span>{option.label}</span>
      {/each}
    </div>
  </div>
  <Button
    class="mt-10 min-h-[4.5rem] min-w-[13rem] rounded-[0.25rem] px-6 text-2xl font-bold"
    onclick={() => onNext(options[selectedIndex].count)}
  >
    Next
  </Button>
</section>

<style>
  .red-meat-question-content {
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

  .red-meat-question-content h1 {
    max-width: 48rem;
  }

  .red-meat-question-content p {
    margin: 0.75rem 0 0;
    font-size: 1.25rem;
  }

  .red-meat-control {
    width: min(100%, 48rem);
    margin-top: clamp(2rem, 6vh, 4rem);
  }

  .red-meat-control input {
    display: block;
    width: 100%;
    height: 2rem;
    margin: 0;
    accent-color: var(--color-button);
    cursor: pointer;
  }

  .red-meat-options {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    margin-top: 0.5rem;
    font-size: 1rem;
    line-height: 1.25;
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
    .red-meat-question-content {
      justify-content: flex-start;
      width: 100%;
      min-height: 0;
      padding: 2rem 1rem;
    }

    .red-meat-question-content p {
      font-size: 1rem;
    }

    .red-meat-control {
      margin-top: 2rem;
    }

    .red-meat-options {
      font-size: 0.8rem;
    }
  }
</style>
