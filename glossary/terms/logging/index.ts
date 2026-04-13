import type { GlossaryTerm } from '../../types'
import { loggingBasicsTerms } from './basics'
import { tracingTerms } from './tracing'
import { elkTerms } from './elk'
import { observabilityTerms } from './observability'

// Export all terms combined
export const loggingTerms: GlossaryTerm[] = [
  ...loggingBasicsTerms,
  ...tracingTerms,
  ...elkTerms,
  ...observabilityTerms,
]

// Export individual modules for direct access
export { loggingBasicsTerms, tracingTerms, elkTerms, observabilityTerms }
