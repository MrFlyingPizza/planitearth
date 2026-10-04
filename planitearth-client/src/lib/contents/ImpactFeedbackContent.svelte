<script lang="ts">
  import fallenUrl from "assets/fallen.svg";
  import healingUrl from "assets/healing.svg";
  import sickUrl from "assets/sick.svg";
  import usualUrl from "assets/usual.svg";
  import type { ImpactFeedback } from "$lib/state/impact-feedback";

  let { result }: { result: ImpactFeedback } = $props();

  const images = {
    fallen: fallenUrl,
    sick: sickUrl,
    usual: usualUrl,
    healing: healingUrl,
  };
</script>

<section class="impact-feedback" aria-labelledby="impact-feedback-title">
  <div class="impact-feedback-image">
    <img src={images[result.image]} alt={`Earth: ${result.image}`} />
  </div>
  <div class="impact-feedback-copy">
    <h1 id="impact-feedback-title">{result.title}</h1>
    <p>{result.feedback}</p>
  </div>
</section>

<style>
  .impact-feedback {
    position: fixed;
    z-index: 1;
    inset: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: center;
    gap: clamp(2rem, 7vw, 7rem);
    padding: clamp(2rem, 8vw, 8rem);
    box-sizing: border-box;
    background: #fff;
    color: #282b41;
  }

  .impact-feedback-image {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
  }

  .impact-feedback-image img {
    display: block;
    width: min(100%, 36rem);
    max-height: 76svh;
    object-fit: contain;
  }

  .impact-feedback-copy {
    max-width: 42rem;
  }

  .impact-feedback-copy h1 {
    margin: 0;
    font-size: clamp(2.5rem, 5vw, 5rem);
    line-height: 1.05;
    letter-spacing: -0.055em;
  }

  .impact-feedback-copy p {
    margin: 1.5rem 0 0;
    font-size: clamp(1.15rem, 2vw, 1.75rem);
    line-height: 1.5;
  }

  @media (max-width: 700px) {
    .impact-feedback {
      grid-template-columns: 1fr;
      grid-template-rows: minmax(0, 1fr) auto;
      gap: 1rem;
      padding: 1.5rem;
    }

    .impact-feedback-image img {
      max-height: 48svh;
    }

    .impact-feedback-copy {
      justify-self: center;
      text-align: center;
    }
  }
</style>
