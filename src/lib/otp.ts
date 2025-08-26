/** Random 4-digit, including leading zeros (e.g. "0047") */
export const gen4 = () =>
  Math.floor(Math.random() * 10000).toString().padStart(4, '0')

/** Resend cooldown: 4 minutes 30 seconds */
export const RESEND_COOLDOWN_SECONDS = 270

/** Format seconds like "4m 30s" */
export const fmt = (s: number) => {
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}m ${r.toString().padStart(2, '0')}s`
}
