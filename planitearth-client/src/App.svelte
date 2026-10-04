<script lang="ts">
  import { onMount, tick } from 'svelte'
  import Planet from './lib/Planet.svelte'
  import { fetchSurvey } from './lib/mock-api'
  import { baseline, metricLabels, metrics, recordAnswer, validateAnswer,
    type Answer, type AnswerRecord, type Question, type Survey } from './lib/survey'
  import type { EarthView } from './lib/earth-view'

  type Phase = 'loading' | 'question' | 'focus' | 'effect' | 'return' | 'finale' | 'complete' | 'error'
  let phase = $state<Phase>('loading')
  let survey = $state<Survey | null>(null)
  let history = $state<AnswerRecord[]>([])
  let index = $state(0)
  let revision = $state(0)
  let selected = $state('')
  let checked = $state<string[]>([])
  let slider = $state(0)
  let skip = $state(false)
  let validation = $state('')
  let errorMessage = $state('')
  let captionTitle = $state('')
  let caption = $state('')
  let prefersReducedMotion = $state(false)
  let shortAnimations = $state(false)
  let reducedMotion = $derived(prefersReducedMotion || shortAnimations)
  let question = $derived(survey?.questions[index])
  let finalState = $derived(history.at(-1)?.after ?? baseline)
  let view: EarthView | null = null
  let request: AbortController | null = null
  let disposed = false
  let heading = $state<HTMLHeadingElement>()
  let stage = $state<HTMLElement>()

  function fail(error: unknown) {
    if (disposed) return
    console.error('Survey experience failed:', error)
    errorMessage = error instanceof Error ? error.message : 'An unexpected error interrupted the survey.'
    phase = 'error'
  }

  function prepareQuestion(q: Question) {
    selected = ''
    checked = []
    slider = q.type === 'slider' ? q.min : 0
    skip = false
    validation = ''
  }

  async function focusHeading() {
    await tick()
    if (!disposed) heading?.focus()
  }

  function beginWhenReady() {
    if (phase !== 'loading' || !survey || !view) return
    prepareQuestion(survey.questions[0]!)
    phase = 'question'
    void focusHeading()
  }

  async function load() {
    const controller = new AbortController()
    request?.abort()
    request = controller
    try {
      const response = await fetchSurvey(controller.signal)
      if (controller.signal.aborted || disposed) return
      survey = response
      beginWhenReady()
    } catch (error) {
      if (!controller.signal.aborted && !disposed) fail(error)
    }
  }

  onMount(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => { prefersReducedMotion = media.matches }
    updatePreference()
    media.addEventListener('change', updatePreference)
    void load()
    return () => {
      disposed = true
      revision += 1
      request?.abort()
      view?.destroy()
      media.removeEventListener('change', updatePreference)
    }
  })

  function currentAnswer(q: Question): Answer {
    if (q.type === 'single') return selected
    if (q.type === 'multi') return checked
    return skip ? null : Number(slider)
  }

  async function finale(earth: EarthView, run: number) {
    phase = 'finale'
    captionTitle = 'One planet. Many connected choices.'
    caption = 'First, the reference planet. Then, a replay of your six contributions.'
    await earth.animateTo({ ...baseline })
    await earth.pause(1200)
    for (const record of history) {
      if (run !== revision || disposed) return
      captionTitle = record.category
      caption = record.explanation
      await earth.animateTo(record.after)
      await earth.pause(1300)
    }
    if (run !== revision || disposed) return
    await earth.returnToSurvey()
    if (run !== revision || disposed) return
    phase = 'complete'
    await focusHeading()
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault()
    if (phase !== 'question' || !question || !view || !survey) return
    const answer = currentAnswer(question)
    validation = validateAnswer(question, answer) ?? ''
    if (validation) return
    const earth = view
    const run = revision
    phase = 'focus'
    try {
      const record = recordAnswer(question, answer, history)
      history = [...history, record]
      captionTitle = record.category
      caption = record.explanation
      await tick()
      stage?.scrollIntoView({ block: 'start', behavior: 'instant' })
      await earth.focusEarth()
      if (run !== revision || disposed) return
      phase = 'effect'
      await earth.animateTo(record.after)
      await earth.pause(1800)
      if (run !== revision || disposed) return
      if (index === survey.questions.length - 1) {
        await finale(earth, run)
      } else {
        phase = 'return'
        await earth.returnToSurvey()
        if (run !== revision || disposed) return
        index += 1
        prepareQuestion(survey.questions[index]!)
        phase = 'question'
        await focusHeading()
      }
    } catch (error) {
      if (run === revision && !disposed) fail(error)
    }
  }

  function restart() {
    revision += 1
    request?.abort()
    view = null
    survey = null
    history = []
    index = 0
    caption = ''
    validation = ''
    phase = 'loading'
    void load()
  }
</script>

<svelte:head>
  <title>Planit Earth — Small choices, shared planet</title>
  <meta name="description" content="Explore how everyday choices connect to our planet in an interactive, illustrative survey." />
</svelte:head>

<main id="content">
  <header class="app-header">
    <a class="brand" href="#content" aria-label="Planit Earth home">
      <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M9 21C9 10 17 7 24 8c0 9-5 16-13 15m1-3 8-9" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
      PLANIT <span>EARTH</span>
    </a>
    <div class="header-tools">
      <span class="mock-badge">Mock API · six questions</span>
      <label class="motion-control"><input type="checkbox" bind:checked={shortAnimations} /> Short animations</label>
    </div>
  </header>

  <section bind:this={stage} class:results-stage={phase === 'complete'}
    class:animating-stage={phase === 'focus' || phase === 'effect' || phase === 'return' || phase === 'finale'}
    class="experience" aria-label="Interactive Earth survey">
    {#key revision}
      <Planet {reducedMotion} onready={(earth) => { view = earth; beginWhenReady() }} onerror={fail} />
    {/key}

    {#if phase === 'loading'}
      <div class="center-panel" role="status">
        <div class="loading-orbit" aria-hidden="true"></div>
        <p class="eyebrow">A LITTLE PERSPECTIVE</p>
        <h1>Preparing your planet</h1>
        <p>Loading the mock survey and planet artwork…</p>
      </div>
    {:else if phase === 'error'}
      <div class="center-panel">
        <p class="eyebrow">LET’S TRY THAT AGAIN</p>
        <h1>We hit a little turbulence.</h1>
        <p role="alert">{errorMessage}</p>
        <button class="primary" onclick={restart}>Start again <span aria-hidden="true">↗</span></button>
      </div>
    {:else if phase === 'question' && question}
      <div class="question-panel">
        <div class="progress-meta"><span>YOUR EVERYDAY FOOTPRINT</span><span>{index + 1} / {survey?.questions.length}</span></div>
        <progress value={index} max={survey?.questions.length ?? 6} aria-label="Questions completed"></progress>
        <p class="eyebrow">{question.category}</p>
        <h1 bind:this={heading} tabindex="-1">{question.title}</h1>
        <p class="question-description" id="question-description">{question.description}</p>
        <form onsubmit={submit}>
          <fieldset aria-describedby="question-description">
            <legend class="sr-only">{question.title}</legend>
            {#if question.type === 'single'}
              <div class="options">
                {#each question.options as option}
                  <label class="option" class:selected={selected === option.id}>
                    <input type="radio" name={question.id} value={option.id} bind:group={selected} />
                    <span>{option.label}</span>
                  </label>
                {/each}
              </div>
            {:else if question.type === 'multi'}
              <div class="options">
                {#each question.options as option}
                  <label class="option" class:selected={checked.includes(option.id)}>
                    <input type="checkbox" name={question.id} value={option.id} bind:group={checked} />
                    <span>{option.label}</span>
                  </label>
                {/each}
              </div>
              <p class="input-note">{checked.length} selected · selecting none is okay</p>
            {:else}
              <div class="slider-card">
                <label for={question.id}>Your typical amount</label>
                <div class="slider-value"><output for={question.id}>{skip ? '—' : slider}</output><span>{question.unit}</span></div>
                <input id={question.id} type="range" min={question.min} max={question.max} step={question.step} bind:value={slider} disabled={skip} />
                <div class="range-labels"><span>{question.min} {question.unit}</span><span>{question.max} {question.unit}</span></div>
              </div>
              {#if question.allowSkip}
                <label class="skip-option"><input type="checkbox" bind:checked={skip} /> Not applicable to me</label>
              {/if}
            {/if}
          </fieldset>
          {#if validation}<p class="validation" role="alert">{validation}</p>{/if}
          <button class="primary" type="submit">See the effect <span aria-hidden="true">↗</span></button>
        </form>
        <p class="panel-footnote">No perfect answers. Just a chance to see the connections.</p>
      </div>
      <div class="planet-label" aria-hidden="true"><span class="label-line"></span>OUR SHARED HOME<span class="label-detail">An illustrative planet, shaped by everyday choices.</span></div>
    {:else if phase === 'complete'}
      <div class="results-panel">
        <p class="eyebrow">THE BIGGER PICTURE</p>
        <h1 bind:this={heading} tabindex="-1">Small choices.<br />Shared planet.</h1>
        <p>Here’s how your answers shaped this illustration. These are qualitative visual signals, not measured environmental impacts.</p>
        <p>Bars show the amount of each property, not a good/bad score. Unassessed values retain the reference illustration.</p>
        <div class="result-metrics">
          {#each metrics as metric}
            {@const assessed = history.some(record => record.effects[metric] !== undefined)}
            <div class="result-metric">
              <div><span>{metricLabels[metric]}</span><span>{assessed ? 'Illustrative' : 'Unassessed'}</span></div>
              <div class="metric-track" aria-hidden="true"><span style:width={`${finalState[metric] * 100}%`}></span></div>
            </div>
          {/each}
        </div>
        <details>
          <summary>Your answers & what they mean</summary>
          <ol class="answer-summary">
            {#each history as record}
              <li><h2>{record.category}</h2><strong>{record.label}</strong><p>{record.explanation}</p></li>
            {/each}
          </ol>
        </details>
        <button class="primary" onclick={restart}>Explore again <span aria-hidden="true">↗</span></button>
      </div>
    {:else}
      <div class="animation-caption" role="status" aria-live="polite">
        <p class="eyebrow">{phase === 'finale' ? 'YOUR PLANET · THE FULL PICTURE' : `CHOICE ${index + 1} · THE CONNECTION`}</p>
        <h2>{captionTitle}</h2>
        <p>{caption}</p>
        <span class="animation-status">{phase === 'finale' ? 'Replaying your accumulated choices' : phase === 'return' ? 'Moving to your next question' : 'Bringing your choice into view'}</span>
      </div>
    {/if}
  </section>
  <footer>
    <span>ONE PLANET. MANY POSSIBILITIES.</span>
    <p>Illustrative, not a scientific prediction. Visuals represent patterns at a shared scale—not one person changing the entire Earth.</p>
  </footer>
</main>