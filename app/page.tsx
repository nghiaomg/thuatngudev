'use client'

import { useState, useMemo, useRef } from 'react'
import { Card } from '@heroui/react'
import { BookMarked, Sparkles } from 'lucide-react'
import { SearchFilter } from './components/SearchFilter'
import { TermCard } from './components/TermCard'
import { SelectionMenu } from './components/SelectionMenu'
import { allTerms } from '@/glossary/terms'

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('General')
  const [highlightedTermId, setHighlightedTermId] = useState<string | null>(null)
  const termCardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const handleSelectTermFromMenu = (termId: string) => {
    const term = allTerms.find((t) => t.id === termId)
    if (term) {
      // Set search to find the term
      setSearchQuery(term.term)
      setSelectedCategory(term.category)

      // Scroll to and highlight the term card
      setTimeout(() => {
        const cardEl = termCardRefs.current[termId]
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
          setHighlightedTermId(termId)

          // Remove highlight after 3 seconds
          setTimeout(() => {
            setHighlightedTermId(null)
          }, 3000)
        }
      }, 100)
    }
  }

  const filteredGlossary = useMemo(() => {
    return allTerms.filter((term) => {
      const matchesCategory = selectedCategory === 'General' || term.category === selectedCategory

      const searchLower = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !searchLower ||
        term.term.toLowerCase().includes(searchLower) ||
        term.definition.toLowerCase().includes(searchLower) ||
        term.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)) ||
        term.relatedTerms.some((related: string) => related.toLowerCase().includes(searchLower))

      return matchesCategory && matchesSearch
    })
  }, [searchQuery, selectedCategory])

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-background/80 border-default-200 dark:border-default-800 sticky top-0 z-50 border-b backdrop-blur-lg">
        <div className="mx-auto w-full max-w-7xl px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-xl p-3">
              <BookMarked className="text-primary" size={28} />
            </div>
            <div>
              <h1 className="text-foreground text-2xl font-bold">Thuật Ngữ Dev</h1>
              <p className="text-default-500 text-sm">
                Tra cứu thuật ngữ lập trình với giải thích và ví dụ
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8">
        {/* Search and Filter */}
        <section>
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </section>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-default-500 text-sm">
            Tìm thấy{' '}
            <span className="text-foreground font-semibold">{filteredGlossary.length}</span> thuật
            ngữ
          </p>
        </div>

        {/* Terms Grid */}
        {filteredGlossary.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredGlossary.map((term) => (
              <div
                key={term.id}
                ref={(el) => {
                  termCardRefs.current[term.id] = el
                }}
                className={highlightedTermId === term.id ? 'ring-2 ring-primary rounded-xl' : ''}
              >
                <TermCard term={term} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="mx-auto w-full max-w-2xl">
            <Card.Content className="py-12">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="bg-default-100 rounded-full p-4 dark:bg-zinc-800">
                  <Sparkles className="text-default-400" size={32} />
                </div>
                <div>
                  <h3 className="text-foreground text-lg font-semibold">
                    Không tìm thấy thuật ngữ
                  </h3>
                  <p className="text-default-500 mt-1 text-sm">
                    Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('General')
                  }}
                  className="text-primary hover:bg-primary/10 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </Card.Content>
          </Card>
        )}
      </main>

      {/* Selection Menu - Right-click to search */}
      <SelectionMenu onSelectTerm={handleSelectTermFromMenu} />

      {/* Footer */}
      <footer className="border-default-200 dark:border-default-800 mt-auto border-t py-8">
        <div className="mx-auto w-full max-w-7xl px-4 text-center">
          <p className="text-default-500 text-sm">
            Thuật Ngữ Dev - Nguồn tài liệu cho lập trình viên
          </p>
          <p className="text-default-400 mt-2 text-xs">
            Tác giả:{' '}
            <a
              href="https://github.com/nghiaomg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              nghiaomg
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
