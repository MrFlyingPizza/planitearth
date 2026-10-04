import { test } from 'node:test'
import assert from 'node:assert/strict'
import { baseline, metrics, parseSurvey, recordAnswer, stateFromHistory, validateAnswer,
  type Answer, type AnswerRecord } from '../src/lib/survey.ts'
import { fetchSurvey } from '../src/lib/mock-api.ts'

const survey = await fetchSurvey(new AbortController().signal)

test('mock API returns six validated questions and all three input types', async () => {
  assert.equal(survey.questions.length, 6)
  assert.deepEqual(new Set(survey.questions.map(q => q.type)), new Set(['single', 'multi', 'slider']))
  assert.notEqual(await fetchSurvey(new AbortController().signal), survey)
})

test('all options and slider endpoints produce bounded, independent snapshots', () => {
  for (const question of survey.questions) {
    const answers = question.type === 'slider'
      ? [question.min, question.max, ...(question.allowSkip ? [null] : [])]
      : question.type === 'single' ? question.options.map(option => option.id)
      : [[], ...question.options.map(option => [option.id]), question.options.map(option => option.id)]
    for (const answer of answers) {
      const record = recordAnswer(question, answer, [])
      for (const metric of metrics) assert.ok(record.after[metric] >= 0 && record.after[metric] <= 1)
      assert.deepEqual(record.before, baseline)
      assert.notEqual(record.before, record.after)
      assert.notEqual(record.before, baseline)
    }
  }
})

test('slider endpoints map exactly and reject off-step and invalid values', () => {
  const question = survey.questions[1]!
  assert.equal(question.type, 'slider')
  if (question.type !== 'slider') throw new Error('Expected slider.')
  assert.equal(recordAnswer(question, 0, []).after.agriculture, 0.12)
  assert.equal(recordAnswer(question, 7, []).after.agriculture, 0.9)
  assert.ok(validateAnswer(question, 0.5))
  assert.ok(validateAnswer(question, 8))
  assert.ok(validateAnswer(question, NaN))
  assert.ok(validateAnswer(question, null))
})

test('multi-select combines contributions and supports no selections', () => {
  const question = survey.questions[3]!
  assert.equal(recordAnswer(question, [], []).after.waste, 0.85)
  const record = recordAnswer(question, ['repair', 'reuse', 'recycle', 'compost'], [])
  assert.ok(Math.abs(record.after.waste - 0.15) < 1e-9)
  assert.ok(validateAnswer(question, ['repair', 'repair']))
  assert.ok(validateAnswer(question, ['missing']))
})

test('unknown and not-applicable responses preserve state and remain unassessed', () => {
  const energy = recordAnswer(survey.questions[2]!, 'unknown', [])
  const water = recordAnswer(survey.questions[4]!, null, [energy])
  assert.deepEqual(energy.effects, {})
  assert.deepEqual(water.after, baseline)
  assert.match(water.explanation, /unassessed/)
})

test('six-answer history accumulates and replay does not change recorded state', () => {
  const answers: Answer[] = ['car', 7, 'renewable', ['repair', 'reuse'], 20, 'native']
  const history: AnswerRecord[] = []
  for (const [index, question] of survey.questions.entries()) {
    const answer = answers[index]!
    history.push(recordAnswer(question, answer, history))
  }
  const beforeReplay = JSON.stringify(history)
  const expected = { transport: 0.9, agriculture: 0.9, energy: 0.1, waste: 0.45, water: 0.95, habitat: 0.9 }
  for (const metric of metrics) assert.ok(Math.abs(stateFromHistory(history)[metric] - expected[metric]) < 1e-9)
  const state = { ...baseline }
  for (const record of history) Object.assign(state, record.after)
  assert.deepEqual(state, stateFromHistory(history))
  assert.equal(JSON.stringify(history), beforeReplay)
  assert.throws(() => recordAnswer(survey.questions[0]!, 'active', history), /already/)
  assert.throws(() => recordAnswer(survey.questions[0]!, '', []), /Choose/)
})

test('API validation rejects malformed data instead of returning sample success', () => {
  assert.throws(() => parseSurvey({ id: 'empty', questions: [] }), /no questions/)
  const clone = () => JSON.parse(JSON.stringify(survey))
  const unsupported = clone()
  unsupported.questions[0].options[0].effects = { temperature: 0.2 }
  assert.throws(() => parseSurvey(unsupported), /Unsupported effect/)
  const outOfRange = clone()
  outOfRange.questions[0].options[0].effects.transport = 2
  assert.throws(() => parseSurvey(outOfRange), /range/)
  const duplicate = clone()
  duplicate.questions[1].id = duplicate.questions[0].id
  assert.throws(() => parseSurvey(duplicate), /Duplicate question/)
  const slider = clone()
  slider.questions[1].step = 0
  assert.throws(() => parseSurvey(slider), /slider/)
  const missingReference = clone()
  missingReference.questions[3].baseEffects = {}
  assert.throws(() => parseSurvey(missingReference), /reference/)
})

test('mock requests can be cancelled before and during loading', async () => {
  const controller = new AbortController()
  const request = fetchSurvey(controller.signal)
  controller.abort()
  await assert.rejects(request, { name: 'AbortError' })
  await assert.rejects(fetchSurvey(controller.signal), { name: 'AbortError' })
})
