<script lang="ts">
  import { cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";

  let { onContinue }: { onContinue: () => void } = $props();
</script>

<section
  class="fact-content"
  aria-labelledby="flight-fact-heading"
  in:fly={{ y: -120, duration: 2000, easing: cubicOut }}
  out:fly={{ y: 120, duration: 2000, easing: cubicOut }}
>
  <h1 id="flight-fact-heading" class="text-header">Did you know that</h1>
  <p class="text-body">For every flight you take, the greenhouse emissions get cooked</p>
  <button class="button" type="button" onclick={onContinue}>Continue</button>
</section>

<style>
  .fact-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.5rem;
    width: min(100%, 56rem);
    margin: 0 auto;
    padding: clamp(2rem, 7vh, 5rem) 1.5rem 2rem;
    box-sizing: border-box;
    text-align: center;
  }

  @media (max-width: 900px) {
    .fact-content {
      gap: 2rem;
      padding: 2rem 1rem 1.5rem;
    }
  }
</style>
