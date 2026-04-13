'use client'

import { Card } from '@heroui/react'
import {
  Disclosure,
  DisclosureContent,
  DisclosureIndicator,
  DisclosureTrigger,
} from '@heroui/react'
import { Code, BookOpen, ArrowRight, Check } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import type { GlossaryTerm } from '@/glossary/types'

interface TermCardProps {
  term: GlossaryTerm
}

export function TermCard({ term }: TermCardProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const codeStyle = mounted
    ? resolvedTheme === 'dark'
      ? oneDark
      : oneLight
    : oneLight

  return (
    <Card className="border-default-200 dark:border-default-800 hover:border-primary dark:hover:border-primary w-full border-1 transition-colors duration-300">
      <Card.Header>
        <Card.Title className="text-xl font-bold">{term.term}</Card.Title>
        <Card.Description className="text-default-600 dark:text-default-400 leading-relaxed">
          {term.definition}
        </Card.Description>
      </Card.Header>

      <Card.Content className="gap-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
            {term.category}
          </span>
        </div>

        {/* Details (expandable) */}
        <Disclosure>
          <DisclosureTrigger className="text-foreground hover:bg-default-100 flex w-full items-center gap-2 rounded-lg p-2 text-sm font-semibold transition-colors dark:hover:bg-zinc-800">
            <BookOpen size={16} />
            Bối cảnh sử dụng
            <DisclosureIndicator className="ml-auto" />
          </DisclosureTrigger>
          <DisclosureContent>
            <div className="text-default-600 dark:text-default-400 px-2 py-3 text-sm leading-relaxed">
              <div
                dangerouslySetInnerHTML={{
                  __html: term.details
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />'),
                }}
              />
            </div>
          </DisclosureContent>
        </Disclosure>

        {/* Examples (expandable) */}
        <Disclosure>
          <DisclosureTrigger className="text-foreground hover:bg-default-100 flex w-full items-center gap-2 rounded-lg p-2 text-sm font-semibold transition-colors dark:hover:bg-zinc-800">
            <Code size={16} />
            Ví dụ minh họa ({term.examples.length})
            <DisclosureIndicator className="ml-auto" />
          </DisclosureTrigger>
          <DisclosureContent>
            <div className="space-y-4 px-2 py-3">
              {term.examples.map((example, index) => (
                <div
                  key={index}
                  className="border-default-200 dark:border-default-700 bg-default-50/50 dark:bg-default-900/30 space-y-2 rounded-xl border p-4 backdrop-blur-sm"
                  style={{
                    backgroundColor: 'var(--syntax-bg-inset)',
                    borderColor: 'oklch(50% 0.0015 253.83 / 0.15)',
                  }}
                >
                  <h4 className="text-foreground flex items-center gap-2 text-sm font-semibold">
                    <span className="bg-primary/15 text-primary inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold">
                      {index + 1}
                    </span>
                    {example.title}
                  </h4>
                  <div className="group relative">
                    <div className="rounded-xl overflow-hidden">
                      <SyntaxHighlighter
                        language="javascript"
                        style={codeStyle}
                        customStyle={{
                          margin: 0,
                          padding: '1rem',
                          borderRadius: '0.75rem',
                          fontSize: '0.8125rem',
                          lineHeight: '1.6',
                          backgroundColor: mounted && resolvedTheme === 'dark' ? '#282c34' : '#f5f5f5',
                        }}
                        showLineNumbers
                        lineNumberStyle={{
                          minWidth: '2.5rem',
                          paddingRight: '0.75rem',
                          color: mounted && resolvedTheme === 'dark' ? '#6e7681' : '#999',
                          userSelect: 'none',
                        }}
                      >
                        {example.code}
                      </SyntaxHighlighter>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(example.code)}
                      className="bg-default-200/50 dark:bg-default-800/50 border-default-300 dark:border-default-700 hover:bg-default-300 dark:hover:bg-default-700 absolute top-2 right-2 rounded-md border px-2 py-1 text-xs opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 flex items-center gap-1"
                      title="Copy code"
                    >
                      <Check size={12} />
                      Copy
                    </button>
                  </div>
                  <div className="text-default-600 dark:text-default-400 bg-default-100/50 dark:bg-default-800/30 flex items-start gap-3 rounded-lg p-3 text-sm">
                    <ArrowRight size={16} className="text-primary mt-1 flex-shrink-0" />
                    <span className="leading-relaxed">{example.explanation}</span>
                  </div>
                </div>
              ))}
            </div>
          </DisclosureContent>
        </Disclosure>

        {/* Related Terms */}
        {term.relatedTerms.length > 0 && (
          <div className="border-default-200 dark:border-default-800 border-t pt-2">
            <p className="text-default-500 mb-2 text-xs font-medium tracking-wide uppercase">
              Thuật ngữ liên quan
            </p>
            <div className="flex flex-wrap gap-2">
              {term.relatedTerms.map((related) => (
                <span
                  key={related}
                  className="bg-secondary/10 text-secondary-600 dark:text-secondary-400 border-secondary/20 rounded-full border px-2 py-1 text-xs"
                >
                  {related}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {term.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {term.tags.map((tag) => (
              <span
                key={tag}
                className="bg-default-100 text-default-500 rounded-full px-2 py-0.5 text-xs dark:bg-zinc-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Card.Content>
    </Card>
  )
}
