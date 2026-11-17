/**
 * The opening: the RECO Coin, then through its dial into the page. The markup and timing live in
 * index.html; this decides whether it plays, starts it once the two pictures are ready, lets the
 * page's own arrival wait for the reveal, and clears up afterwards.
 */
const SEEN_KEY = 'reco.clinic.intro'
/** Longer than this for the pictures and the page opens without the coin. */
const PICTURE_WAIT_MS = 1500
/** Keyframes in index.html: the marker for when the page shows through the dial, and the zoom that ends the opening. */
const REVEAL_ANIMATION = 'intro-mark'
const LAST_ANIMATION = 'intro-zoom'

export interface IntroInputs {
  /** The coin has already played in this browser session. */
  readonly seen: boolean
  /** The reader asked their device for less motion. */
  readonly reducedMotion: boolean
  /** ?intro=1 in the address, for demos. */
  readonly forced: boolean
}

/** Once per session, never with reduced motion, unless asked for by name. */
export function shouldPlayIntro({ seen, reducedMotion, forced }: IntroInputs): boolean {
  return forced || (!seen && !reducedMotion)
}

function withTimeout(work: Promise<unknown>, ms: number): Promise<boolean> {
  return new Promise((done) => {
    const timer = window.setTimeout(() => done(false), ms)
    work.then(() => { window.clearTimeout(timer); done(true) }, () => { window.clearTimeout(timer); done(false) })
  })
}

function finish(root: HTMLElement, intro: HTMLElement | null): void {
  root.classList.remove('intro', 'intro-play', 'intro-reveal')
  intro?.remove()
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Private windows may refuse storage; the coin then plays on each load, which is harmless.
  }
}

function readInputs(): IntroInputs {
  let seen = false
  try {
    seen = sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    // No storage in this window: treat every load as the first.
  }
  return {
    seen,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    forced: new URLSearchParams(window.location.search).get('intro') === '1',
  }
}

/** Shows the opening when it should play. Call before the first render, so the page arrives underneath it. */
export async function runIntro(doc: Document = document): Promise<void> {
  const root = doc.documentElement
  const intro = doc.getElementById('intro')
  if (!shouldPlayIntro(readInputs())) return void intro?.remove()
  root.classList.add('intro')
  const sheet = intro?.querySelector<HTMLElement>('.intro-sheet')
  const pictures = Array.from(intro?.querySelectorAll('img') ?? [])
  if (!intro || !sheet) return finish(root, intro)
  const ready = await withTimeout(Promise.all(pictures.map((img) => img.decode())), PICTURE_WAIT_MS)
  if (!ready) return finish(root, intro)
  intro.addEventListener('animationstart', (e) => { if (e.animationName === REVEAL_ANIMATION) root.classList.add('intro-reveal') })
  sheet.addEventListener('animationend', (e) => { if (e.animationName === LAST_ANIMATION) finish(root, intro) })
  root.classList.add('intro-play')
}
