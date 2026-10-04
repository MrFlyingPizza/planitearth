export const metrics = ['transport', 'agriculture', 'energy', 'waste', 'water', 'habitat'] as const
export type Metric = typeof metrics[number]
export type EarthState = Record<Metric, number>
export type Effects = Partial<EarthState>
export type Answer = string | string[] | number | null

export interface Option {
  id: string
  label: string
  explanation: string
  effects: Effects
}

interface BaseQuestion {
  id: string
  title: string
  description: string
  category: string
}

export type Question = BaseQuestion & (
  | { type: 'single'; options: Option[] }
  | { type: 'multi'; options: Option[]; baseEffects: Effects }
  | {
      type: 'slider'
      min: number
      max: number
      step: number
      unit: string
      metric: Metric
      from: number
      to: number
      explanation: string
      allowSkip: boolean
    }
)

export interface Survey {
  id: string
  questions: Question[]
}

export interface AnswerRecord {
  questionId: string
  category: string
  label: string
  explanation: string
  effects: Effects
  before: EarthState
  after: EarthState
}

export const baseline: Readonly<EarthState> = {
  transport: 0.45,
  agriculture: 0.45,
  energy: 0.5,
  waste: 0.7,
  water: 0.5,
  habitat: 0.4,
}

export const metricLabels: Record<Metric, string> = {
  transport: 'Transport emissions',
  agriculture: 'Agricultural footprint',
  energy: 'Electricity emissions',
  waste: 'New waste',
  water: 'Water demand',
  habitat: 'Habitat diversity',
}

export function initialAnswer(question: Question): Answer {
  if (question.type === 'multi') return []
  if (question.type === 'slider') return question.min
  return ''
}

export function validateAnswer(question: Question, answer: Answer): string | null {
  if (question.type === 'single') {
    return typeof answer === 'string' && question.options.some(option => option.id === answer)
      ? null : 'Choose an answer to continue.'
  }
  if (question.type === 'multi') {
    return Array.isArray(answer) && new Set(answer).size === answer.length &&
      answer.every(id => question.options.some(option => option.id === id))
      ? null : 'Choose only the available options.'
  }
  if (answer === null && question.allowSkip) return null
  return typeof answer === 'number' && Number.isFinite(answer) &&
    answer >= question.min && answer <= question.max &&
    Math.abs((answer - question.min) / question.step - Math.round((answer - question.min) / question.step)) < 1e-8
    ? null : `Choose a value between ${question.min} and ${question.max}.`
}

export function stateFromHistory(history: AnswerRecord[]): EarthState {
  const state = { ...baseline }
  for (const record of history) {
    for (const metric of metrics) {
      const value = record.effects[metric]
      if (value !== undefined) state[metric] = Math.max(0, Math.min(1, value))
    }
  }
  return state
}

export function recordAnswer(question: Question, answer: Answer, history: AnswerRecord[]): AnswerRecord {
  const error = validateAnswer(question, answer)
  if (error) throw new Error(error)
  if (history.some(record => record.questionId === question.id)) throw new Error('This question has already been answered.')
  let effects: Effects = {}
  let label = ''
  let explanation = ''
  if (question.type === 'slider' && typeof answer === 'number') {
    effects = { [question.metric]: question.from + (question.to - question.from) * (answer - question.min) / (question.max - question.min) }
    label = `${answer} ${question.unit}`
    explanation = question.explanation
  } else if (question.type === 'slider') {
    label = 'Not applicable'
    explanation = 'This contribution is unassessed; the illustration stays unchanged.'
  } else if (question.type === 'single') {
    const option = question.options.find(option => option.id === answer)
    if (!option) throw new Error('The selected option is unavailable.')
    effects = { ...option.effects }
    label = option.label
    explanation = option.explanation
  } else {
    const selected = question.options.filter(option => Array.isArray(answer) && answer.includes(option.id))
    effects = { ...question.baseEffects }
    for (const option of selected) {
      for (const metric of metrics) {
        const delta = option.effects[metric]
        if (delta !== undefined) effects[metric] = (effects[metric] ?? baseline[metric]) + delta
      }
    }
    for (const metric of metrics) {
      const value = effects[metric]
      if (value !== undefined) effects[metric] = Math.max(0, Math.min(1, value))
    }
    label = selected.map(option => option.label).join(', ') || 'None of these habits'
    explanation = selected.map(option => option.explanation).join(' ') ||
      'No diversion habits were selected. The illustration shows the reference rate of new waste, not a judgment of your circumstances.'
  }
  const before = stateFromHistory(history)
  const after = { ...before, ...effects }
  return { questionId: question.id, category: question.category, label, explanation, effects, before, after }
}
