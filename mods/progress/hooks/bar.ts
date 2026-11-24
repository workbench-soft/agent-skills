import type { Lang, Row } from '../types'

const WIDTH = 20
const WORDS = {
  ru: { h: 'ч', m: 'мин', left: 'осталось', of: 'из', ago: 'обновлено', s: 'с назад' },
  en: { h: 'h', m: 'min', left: 'left', of: 'of', ago: 'updated', s: 's ago' },
}

export const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)))

export function bar(percent: number): string {
  const full = Math.round((clamp(percent) / 100) * WIDTH)
  return '█'.repeat(full) + '░'.repeat(WIDTH - full)
}

export function minutes(total: number, lang: Lang): string {
  const w = WORDS[lang]
  const all = Math.max(0, Math.round(total))
  const h = Math.floor(all / 60)
  const m = all % 60
  if (h === 0) return `${m} ${w.m}`
  return m === 0 ? `${h} ${w.h}` : `${h} ${w.h} ${m} ${w.m}`
}

export function time(row: Row, lang: Lang): string {
  const w = WORDS[lang]
  if (row.leftMin === undefined) return ''
  const left = `${w.left} ${minutes(row.leftMin, lang)}`
  return row.totalMin === undefined ? left : `${left} ${w.of} ${minutes(row.totalMin, lang)}`
}

export function line(row: Row, lang: Lang, pad: number): string {
  const pct = `${clamp(row.percent)}%`.padStart(4)
  return `${row.label.padEnd(pad)}  ${bar(row.percent)} ${pct}  ${time(row, lang)}`.trimEnd()
}

export function block(rows: Row[], lang: Lang): string {
  const pad = Math.max(...rows.map(r => r.label.length))
  return rows.map(r => line(r, lang, pad)).join('\n')
}

export const ago = (sec: number, lang: Lang) => `${WORDS[lang].ago} ${sec} ${WORDS[lang].s}`

export const clockText = (ms: number) => {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
