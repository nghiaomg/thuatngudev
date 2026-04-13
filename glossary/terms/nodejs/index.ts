import { coreTerms } from './core'
import { concurrencyTerms } from './concurrency'
import { memoryTerms } from './memory'
import { binaryTerms } from './binary'

export const nodejsTerms = [
  ...coreTerms,
  ...concurrencyTerms,
  ...memoryTerms,
  ...binaryTerms,
]

export { coreTerms } from './core'
export { concurrencyTerms } from './concurrency'
export { memoryTerms } from './memory'
export { binaryTerms } from './binary'
