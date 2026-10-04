<script lang="ts">
  import Phaser from "phaser";
  import { onMount } from "svelte";
  import { MainScene } from "./lib/game/MainScene";

  let game: Phaser.Game;
  let gameRoot: HTMLDivElement;

  function begin() {
    game.events.emit("begin");
  }

  onMount(() => {
    game = new Phaser.Game({
      parent: gameRoot,
      type: Phaser.AUTO,
      transparent: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: gameRoot.clientWidth,
        height: gameRoot.clientHeight,
      },
      scene: MainScene,
    });

    const resizeObserver = new ResizeObserver(([entry]) => {
      game.scale.resize(entry.contentRect.width, entry.contentRect.height);
    });
    resizeObserver.observe(gameRoot);

    return () => {
      resizeObserver.disconnect();
      game.destroy(true);
    };
  });
</script>

<main>
  <section class="earth-panel" aria-label="Illustration of Earth">
    <div id="game-root" bind:this={gameRoot}></div>
  </section>
  <section class="landing-copy">
    <div class="copy-content">
      <h1 class="text-title">PlanItEarth</h1>
      <p class="text-subtitle subtitle">Helping the planet? Plan it!</p>
      <p class="text-body intro">Let's find out what your climate action looks like.</p>
      <button class="button" type="button" onclick={begin}>Begin</button>
    </div>
  </section>
</main>

<style>
  main {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    min-height: 100vh;
    min-height: 100svh;
  }

  .earth-panel,
  .landing-copy {
    min-width: 0;
    min-height: 100vh;
    min-height: 100svh;
  }

  .earth-panel {
    display: grid;
    place-items: center;
  }

  #game-root {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  #game-root :global(canvas) {
    display: block;
  }

  .landing-copy {
    display: flex;
    align-items: center;
    padding: clamp(2rem, 5vw, 5rem);
    box-sizing: border-box;
  }

  .copy-content {
    width: min(100%, 42rem);
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
    main {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: minmax(18rem, 42svh) auto;
    }

    .earth-panel {
      min-height: 0;
    }

    .landing-copy {
      min-height: 0;
      align-items: flex-start;
      justify-content: center;
      padding: 1rem 1.5rem 3rem;
      text-align: center;
    }

    .subtitle {
      margin-bottom: 1.25rem;
      margin-top: 0;
    }

    .intro {
      margin-bottom: 1.5rem;
    }
  }

</style>