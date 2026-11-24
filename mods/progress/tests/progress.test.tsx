import { expect, test } from 'claude-code/testing'

const ROWS = [
  { label: 'Шаг 1/7 Тесты', percent: 35, leftMin: 7, totalMin: 40 },
  { label: 'Всего', percent: 45, leftMin: 240, totalMin: 510 },
]
const PANE = {
  plugin: 'progress',
  component: 'Pane',
  requestId: 'progress',
  props: { title: 'Progress', isFocused: false, bodyColumns: 80, placement: 'dock', scroll: { offset: 0, bodyRows: 20 }, view: {} },
} as const

test('report draws the bars and the pane shows them', async ($, on) => {
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('clock.now', () => ({ value: 1_000_000 }))
  const ran = await $.tool.call({ tool: 'mcp__progress__report', rows: ROWS } as never)
  const text = JSON.stringify(ran)
  expect(text).toContain('███████░░░░░░░░░░░░░  35%  осталось 7 мин из 40 мин')
  expect(text).toContain('осталось 4 ч из 8 ч 30 мин')

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    const row = await ui.find({ type: 'Text', text: /Всего/ })
    expect(row?.text).toContain('45%')
    await ui.unmount()
  }
})

test('a quiet minute adds a nudge to the tool result', async ($, on) => {
  let t = 1_000_000
  on('clock.now', () => ({ value: t }))
  on('clock.every', () => ({ value: undefined }))
  on('tool.call', () => ({ result: 'ok' }))
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  await $.turn.start({ text: 'go', turnId: 't1' } as never)
  t += 61_000
  const ran = await $.tool.call({ tool: 'Bash', command: 'ls' })
  expect(JSON.stringify(ran)).toContain('since the last progress report')
  t += 5_000
  const again = await $.tool.call({ tool: 'Bash', command: 'ls' })
  expect(JSON.stringify(again)).not.toContain('since the last progress report')
})
