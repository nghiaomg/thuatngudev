'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@heroui/react'
import { ArrowRight, X, Copy, Check } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from 'next-themes'
import { allTerms } from '@/glossary/terms'

export default function TermPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { resolvedTheme } = useTheme()
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const term = allTerms.find((t) => t.slug === slug)

  if (!term) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Không tìm thấy thuật ngữ</h1>
          <button onClick={() => router.push('/')} className="text-primary hover:underline">
            Quay về trang chủ
          </button>
        </Card>
      </div>
    )
  }

  const codeStyle = resolvedTheme === 'dark' ? oneDark : oneLight

  const handleCopy = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-background/80 border-default-200 dark:border-default-800 sticky top-0 z-50 border-b backdrop-blur-lg">
        <div className="mx-auto w-full max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
                {term.category}
              </span>
              <h1 className="text-foreground text-2xl font-bold">{term.term}</h1>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-default-100 hover:bg-default-200 dark:bg-default-800 dark:hover:bg-default-700 rounded-full p-2 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8">
        {/* Definition */}
        <section>
          <h2 className="text-default-500 mb-3 text-sm font-medium tracking-wide uppercase">
            Định nghĩa
          </h2>
          <p className="text-foreground text-lg leading-relaxed">{term.definition}</p>
        </section>

        {/* Details */}
        <section>
          <h2 className="text-default-500 mb-3 text-sm font-medium tracking-wide uppercase">
            Bối cảnh sử dụng
          </h2>
          <Card className="p-6">
            <div
              className="text-default-600 dark:text-default-400 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: term.details
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                  .replace(/\n/g, '<br />'),
              }}
            />
          </Card>
        </section>

        {/* Examples */}
        <section>
          <h2 className="text-default-500 mb-3 text-sm font-medium tracking-wide uppercase">
            Ví dụ minh họa ({term.examples.length})
          </h2>
          <div className="space-y-6">
            {term.examples.map((example, index) => (
              <Card
                key={index}
                className="border-default-200 dark:border-default-800 overflow-hidden"
              >
                <div className="bg-default-50 dark:bg-default-900/30 border-default-200 dark:border-default-800 border-b px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary/15 text-primary inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                      {index + 1}
                    </span>
                    <h3 className="text-foreground font-semibold">{example.title}</h3>
                  </div>
                </div>

                <div className="p-6">
                  <div className="group relative mb-4 overflow-hidden rounded-xl">
                    <SyntaxHighlighter
                      language="javascript"
                      style={codeStyle}
                      customStyle={{
                        margin: 0,
                        padding: '1.25rem',
                        borderRadius: '0.75rem',
                        fontSize: '0.875rem',
                        lineHeight: '1.7',
                        backgroundColor:
                          resolvedTheme === 'dark' ? '#282c34' : '#f5f5f5',
                      }}
                      showLineNumbers
                      lineNumberStyle={{
                        minWidth: '2.5rem',
                        paddingRight: '0.75rem',
                        color: resolvedTheme === 'dark' ? '#6e7681' : '#999',
                        userSelect: 'none',
                      }}
                    >
                      {example.code}
                    </SyntaxHighlighter>
                    <button
                      onClick={() => handleCopy(example.code, index)}
                      className="bg-default-200/80 dark:bg-default-800/80 hover:bg-default-300 dark:hover:bg-default-700 border-default-300 dark:border-default-600 absolute top-3 right-3 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check size={12} className="text-success" />
                          <span className="text-success">Đã copy!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-default-50 dark:bg-default-900/30 flex items-start gap-3 rounded-xl p-4">
                    <ArrowRight size={18} className="text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-default-600 dark:text-default-400 text-sm leading-relaxed">
                      {example.explanation}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Related Terms */}
        {term.relatedTerms.length > 0 && (
          <section>
            <h2 className="text-default-500 mb-3 text-sm font-medium tracking-wide uppercase">
              Thuật ngữ liên quan
            </h2>
            <Card className="p-6">
              <div className="flex flex-wrap gap-2">
                {term.relatedTerms.map((related) => {
                  const relatedTerm = allTerms.find(
                    (t) => t.term.toLowerCase() === related.toLowerCase()
                  )
                  return (
                    <button
                      key={related}
                      onClick={() => relatedTerm && router.push(`/terms/${relatedTerm.slug}`)}
                      className={`bg-secondary/10 text-secondary-600 dark:text-secondary-400 border-secondary/20 hover:bg-secondary/20 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        relatedTerm ? 'cursor-pointer' : 'cursor-default opacity-60'
                      }`}
                    >
                      {related}
                    </button>
                  )
                })}
              </div>
            </Card>
          </section>
        )}

        {/* Tags */}
        {term.tags.length > 0 && (
          <section>
            <div className="flex flex-wrap gap-2">
              {term.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-default-100 text-default-500 rounded-full px-3 py-1 text-sm dark:bg-zinc-800"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Back Button */}
        <div className="pt-8 pb-4">
          <button
            onClick={() => router.back()}
            className="text-default-500 hover:text-foreground flex items-center gap-2 text-sm transition-colors"
          >
            ← Quay lại
          </button>
        </div>
      </main>
    </div>
  )
}
