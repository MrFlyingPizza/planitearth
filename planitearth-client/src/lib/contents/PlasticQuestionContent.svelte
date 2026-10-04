<script lang="ts">
  import { cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";
  import { Button } from "$lib/components/ui/button/index.js";
  import { questionTexts } from "$lib/state/question-texts.js";

  let {
    onNext,
    onSelectionChange,
  }: {
    onNext: (bottleCount: number) => void;
    onSelectionChange: (bottleCount: number) => void;
  } = $props();

  const options = [
    { label: "I do my best to avoid single-use plastics", bottleCount: 1 },
    { label: "I try to avoid it, but could be better", bottleCount: 5 },
    { label: "It doesn't matter to me", bottleCount: 20 },
  ];
  let selectedIndex = $state(0);

  function selectOption(index: number) {
    selectedIndex = index;
    onSelectionChange(options[index].bottleCount);
  }
</script>

<section
  class="plastic-question-content"
  aria-labelledby="plastic-question"
  in:fly={{ x: -100, duration: 1200, easing: cubicOut }}
>
  <h1 id="plastic-question" class="text-subheading">
    {questionTexts.plastics}
  </h1>
  <p class="plastic-question-description">
    (e.g. plastic bags, bottles, straws, take-out containers, etc.)
  </p>
  <div class="plastic-options" role="group" aria-label="Single-use plastic consumption">
    {#each options as option, index (option.label)}
      <Button
        variant={selectedIndex === index ? "default" : "outline"}
        class="plastic-option"
        aria-pressed={selectedIndex === index}
        onclick={() => selectOption(index)}
      >
        {option.label}
      </Button>
    {/each}
  </div>
  <Button
    class="next-button min-h-[4.5rem] min-w-[13rem] rounded-[0.25rem] px-6 text-2xl font-bold"
    onclick={() => onNext(options[selectedIndex].bottleCount)}
  >
    Next
  </Button>
</section>

<style>
  .plastic-question-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: min(49%, 44rem);
    min-height: 100vh;
    min-height: 100svh;
    padding: 3rem clamp(2rem, 5vw, 5rem);
    box-sizing: border-box;
  }

  .plastic-question-content h1 {
    margin: 0;
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    line-height: 1.15;
  }

  .plastic-question-description {
    margin: 0.75rem 0 1.5rem;
    font-size: clamp(1rem, 1.4vw, 1.2rem);
    line-height: 1.45;
  }

  .plastic-options {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .plastic-options :global(.plastic-option) {
    min-height: 3.25rem;
    justify-content: flex-start;
    padding: 0.75rem 1rem;
    text-align: left;
    text-wrap: pretty;
    white-space: normal;
  }

  .plastic-question-content :global(.next-button) {
    align-self: flex-start;
    margin-top: 1.5rem;
  }

  @media (max-width: 900px) {
    .plastic-question-content {
      width: min(60%, 36rem);
      padding: 2rem 1.25rem;
    }

    .plastic-question-content h1 {
      font-size: clamp(1.75rem, 7vw, 2.5rem);
    }

    .plastic-question-description {
      margin-bottom: 1.25rem;
      font-size: 1rem;
    }

    .plastic-options :global(.plastic-option) {
      min-height: 3.25rem;
      font-size: 0.9rem;
    }

    .plastic-question-content :global(.next-button) {
      margin-top: 1.25rem;
    }
  }

  @media (max-height: 700px) and (min-width: 901px) {
    .plastic-question-content {
      padding-top: 1.25rem;
      padding-bottom: 1.25rem;
    }

    .plastic-question-content h1 {
      font-size: 1.9rem;
    }

    .plastic-question-description {
      margin: 0.5rem 0 1rem;
    }

    .plastic-options :global(.plastic-option) {
      min-height: 2.75rem;
    }

    .plastic-question-content :global(.next-button) {
      min-height: 3.5rem;
      margin-top: 1rem;
    }
  }
</style>
