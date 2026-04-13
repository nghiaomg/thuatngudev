export interface Example {
  title: string
  code: string
  explanation: string
}

export interface GlossaryTerm {
  id: string
  term: string
  slug: string
  category: string
  definition: string
  details: string
  examples: Example[]
  relatedTerms: string[]
  tags: string[]
}
