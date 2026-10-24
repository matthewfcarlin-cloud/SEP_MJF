const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const parse = (dateKey: string): Date => {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12)
}

/** "Oct 4" */
export const shortDate = (dateKey: string): string => {
  const d = parse(dateKey)
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

/** "Sat" */
export const weekday = (dateKey: string): string => DAYS[parse(dateKey).getDay()] ?? ''

/** "S" */
export const weekdayLetter = (dateKey: string): string => weekday(dateKey).charAt(0)
