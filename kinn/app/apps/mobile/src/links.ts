import { TEAM_EMAIL } from '@/export'

export const PRIVACY_URL = 'https://matthewfcarlin-cloud.github.io/reco-privacy/privacy/'
export const FIND_PT_URL = 'https://www.choosept.com/find-a-pt'
export const waitlistMailto = (subject: string): string => `mailto:${TEAM_EMAIL}?subject=${encodeURIComponent(subject)}`
