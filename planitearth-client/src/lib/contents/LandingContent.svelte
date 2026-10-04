<script lang="ts">
  let { onBegin }: { onBegin: () => void } = $props();
</script>

<section class="landing-content">
  <div class="copy-content">
    <h1 class="text-title">PlanItEarth</h1>
    <p class="text-subtitle subtitle">Helping the planet? Plan it!</p>
    <p class="text-body intro">Let's find out what your climate action looks like.</p>
    <button class="button" type="button" onclick={onBegin}>Begin</button>
  </div>
</section>

<style>
  .landing-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-height: 100vh;
    min-height: 100svh;
    padding: clamp(2rem, 5vw, 5rem);
    box-sizing: border-box;
  }

  .copy-content {
    width: min(48%, 42rem);
  }

  p {
    margin: 0;
  }

  .subtitle {
    margin-top: 0.75rem;
    margin-bottom: 2rem;
  }

  .intro {
    margin-bottom: 2rem;
  }

  @media (max-width: 900px) {
    .landing-content {
      align-items: flex-end;
      justify-content: center;
      padding: 1rem 1.5rem 3rem;
      text-align: center;
    }

    .copy-content {
      width: min(100%, 42rem);
    }

    .subtitle {
      margin-top: 0;
      margin-bottom: 1.25rem;
    }

    .intro {
      margin-bottom: 1.5rem;
    }
  }
</style>
