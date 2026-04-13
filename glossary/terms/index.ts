import type { GlossaryTerm } from '../types'
import { typescriptTerms } from './typescript'
import { reactTerms } from './react'
import { nodejsTerms } from './nodejs'
import { backendTerms } from './backend'
import { glossaryTerms } from './glossary'
import { mysqlTerms } from './mysql'
import { postgresqlTerms } from './postgresql'
import { securityTerms } from './security'
import { loggingTerms } from './logging'
import { mongodbTerms } from './mongodb'

export {
  typescriptTerms,
  reactTerms,
  nodejsTerms,
  backendTerms,
  glossaryTerms,
  mysqlTerms,
  postgresqlTerms,
  securityTerms,
  loggingTerms,
  mongodbTerms,
}

// Export all terms combined
export const allTerms: GlossaryTerm[] = [
  ...typescriptTerms,
  ...reactTerms,
  ...nodejsTerms,
  ...backendTerms,
  ...glossaryTerms,
  ...mysqlTerms,
  ...postgresqlTerms,
  ...securityTerms,
  ...loggingTerms,
  ...mongodbTerms,
]
