<script lang="ts">
  import { onMount } from 'svelte'
  import type { EarthView } from './earth-view'

  let { reducedMotion, onready, onerror }: {
    reducedMotion: boolean
    onready: (view: EarthView) => void
    onerror: (error: unknown) => void
  } = $props()
  let host: HTMLDivElement

  onMount(() => {
    const controller = new AbortController()
    let view: EarthView | undefined
    async function initialize() {
      try {
        const { createEarthView } = await import('./earth-view')
        if (controller.signal.aborted) return
        view = await createEarthView(host, () => reducedMotion, controller.signal)
        if (!controller.signal.aborted) onready(view)
      } catch (error) {
        if (!controller.signal.aborted) onerror(error)
      }
    }
    void initialize()
    return () => { controller.abort(); view?.destroy() }
  })
</script>

<div class="planet-canvas" bind:this={host} aria-hidden="true"></div>
