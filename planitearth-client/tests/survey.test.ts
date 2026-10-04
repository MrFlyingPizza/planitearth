import { test } from 'node:test'
import assert from 'node:assert/strict'
import { baseline, metrics, recordAnswer, stateFromHistory, validateAnswer,
  type Answer, type AnswerRecord } from '../src/lib/survey.ts'
import { surveySequence as survey } from '../src/lib/survey-data.ts'

test('programmed survey sequence contains all supported question types', () => {
  assert.equal(survey.questions.length, 6)
  assert.deepEqual(new Set(survey.questions.map(q => q.type)), new Set(['single', 'multi', 'slider']))
  assert.equal(new Set(survey.questions.map(q => q.id)).size, survey.questions.length)
  assert.ok(survey.questions.every(q => q.title && q.description && q.category))
})

test('all options and slider endpoints produce bounded, independent snapshots', () => {
  for (const question of survey.questions) {
    const answers = question.type === 'slider'
      ? [question.min, question.max, ...(question.allowSkip ? [null] : [])]
      : question.type === 'single' ? question.options.map(option => option.id)
      : [[], ...question.options.map(option => [option.id]), question.options.map(option => option.id)]
    for (const answer of answers) {
      const record = recordAnswer(question, answer, [])
      assert.ok(Number.isFinite(record.scene.camera.x) && Number.isFinite(record.scene.camera.y))
      assert.ok(record.scene.camera.zoom > 0)
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
  assert.deepEqual(record.scene.objects?.map(animation => animation.object), ['waste-0', 'waste-1', 'waste-2', 'waste-3'])
  assert.deepEqual(
    recordAnswer(question, ['repair', 'compost'], []).scene,
    recordAnswer(question, ['compost', 'repair'], []).scene,
  )
  assert.ok(validateAnswer(question, ['repair', 'repair']))
  assert.ok(validateAnswer(question, ['missing']))
})

test('each answer resolves to a camera scene and object animations', () => {
  const transport = survey.questions[0]!
  assert.equal(transport.type, 'single')
  if (transport.type !== 'single') throw new Error('Expected single selection.')
  const active = recordAnswer(transport, 'active', [])
  const car = recordAnswer(transport, 'car', [])
  assert.notDeepEqual(active.scene.camera, car.scene.camera)
  assert.equal(car.scene.objects?.[0]?.object, 'car')

  const food = survey.questions[1]!
  assert.equal(food.type, 'slider')
  if (food.type !== 'slider') throw new Error('Expected slider.')
  const low = recordAnswer(food, food.min, []).scene.camera
  const next = recordAnswer(food, food.min + food.step, []).scene.camera
  const high = recordAnswer(food, food.max, []).scene.camera
  assert.deepEqual(low, food.scene.camera.from)
  assert.deepEqual(high, food.scene.camera.to)
  assert.notDeepEqual(low, next)
  assert.ok(low.zoom < high.zoom)

  const water = survey.questions[4]!
  assert.equal(water.type, 'slider')
  if (water.type !== 'slider') throw new Error('Expected optional slider.')
  assert.deepEqual(recordAnswer(water, null, []).scene.camera, water.scene.skippedCamera)
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
