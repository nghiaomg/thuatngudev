import type { GlossaryTerm } from '../../types'
import { apiTerms } from './api'
import { authTerms } from './auth'
import { cachingTerms } from './caching'
import { databaseTerms } from './database'
import { architectureTerms } from './architecture'
import { performanceTerms } from './performance'

// Export all terms combined
export const backendTerms: GlossaryTerm[] = [
  ...apiTerms,
  ...authTerms,
  ...cachingTerms,
  ...databaseTerms,
  ...architectureTerms,
  ...performanceTerms,
]

// Export individual modules for direct access
export { apiTerms, authTerms, cachingTerms, databaseTerms, architectureTerms, performanceTerms }
