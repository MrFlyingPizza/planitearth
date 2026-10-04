<script lang="ts">
  import { cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";
  import { Button } from "$lib/components/ui/button/index.js";

  let { onYes }: { onYes: () => void } = $props();
</script>

<section
  class="ready-impact-content"
  aria-labelledby="ready-impact-heading"
  in:fly={{ y: 40, duration: 700, easing: cubicOut }}
>
  <h1 id="ready-impact-heading" class="text-display">Ready to see your impact?</h1>
  <Button
    class="mt-8 min-h-[4.5rem] min-w-[13rem] rounded-[0.25rem] px-6 text-2xl font-bold"
    onclick={onYes}
  >
    Yes
  </Button>
</section>

<style>
  .ready-impact-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    min-height: 100vh;
    min-height: 100svh;
    padding: 0 1.5rem clamp(3rem, 10vh, 6rem);
    box-sizing: border-box;
    text-align: center;
  }
</style>
