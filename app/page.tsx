'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Card, Spinner } from '@heroui/react'
import { BookMarked, Sparkles, ChevronUp } from 'lucide-react'
import { SearchFilter } from './components/SearchFilter'
import { TermCard } from './components/TermCard'
import { SelectionMenu } from './components/SelectionMenu'
import { allTerms } from '@/glossary/terms'
import { getCategoryGroup } from '@/app/lib/categories'

const ITEMS_PER_PAGE = 20

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('General')
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE)
  const [isScrolling, setIsScrolling] = useState(false)
  const mainRef = useRef<HTMLElement>(null)

  // Optimized filtering with debounce
  const filteredGlossary = useMemo(() => {
    const searchLower = searchQuery.toLowerCase().trim()
    const isGeneral = selectedCategory === 'General'

    // Pre-compute search function
    const matchesSearch = (term: typeof allTerms[0]) => {
      if (!searchLower) return true
      
      return (
        term.term.toLowerCase().includes(searchLower) ||
        term.definition.toLowerCase().includes(searchLower) ||
        term.tags.some((tag) => tag.includes(searchLower)) ||
        term.relatedTerms.some((related) => related.includes(searchLower))
      )
    }

    let filtered: typeof allTerms

    if (isGeneral && !searchLower) {
      // No filtering needed - just sort
      filtered = [...allTerms].sort((a, b) => a.term.localeCompare(b.term, 'vi'))
    } else {
      filtered = allTerms.filter((term) => {
        const termGroup = getCategoryGroup(term.category)
        const matchesCategory = isGeneral || termGroup === selectedCategory
        return matchesCategory && matchesSearch(term)
      })

      // Sort only when in General category
      if (isGeneral) {
        filtered.sort((a, b) => a.term.localeCompare(b.term, 'vi'))
      }
    }

    return filtered
  }, [searchQuery, selectedCategory])

  // Paginated terms
  const visibleTerms = useMemo(() => {
    return filteredGlossary.slice(0, displayedCount)
  }, [filteredGlossary, displayedCount])

  // Check if there are more terms to load
  const hasMore = displayedCount < filteredGlossary.length

  // Scroll to top button visibility
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
      
      // Detect if user is scrolling (for lazy loading)
      if (!isScrolling) {
        setIsScrolling(true)
        setTimeout(() => setIsScrolling(false), 150)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isScrolling])

  // Reset pagination when filters change
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE)
  }, [searchQuery, selectedCategory])

  // Load more terms
  const loadMore = () => {
    setDisplayedCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredGlossary.length))
  }

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isScrolling) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, isScrolling, displayedCount])

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
      <main ref={mainRef} className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8">
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
            Có{' '}
            <span className="text-foreground font-semibold">{filteredGlossary.length}</span> thuật
            ngữ
          </p>
        </div>

        {/* Terms Grid */}
        {filteredGlossary.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {visibleTerms.map((term) => (
                <TermCard key={term.id} term={term} />
              ))}
            </div>

            {/* Load More Trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            )}

            {/* Manual Load More Button */}
            {hasMore && !isScrolling && (
              <div className="flex justify-center">
                <button
                  onClick={loadMore}
                  className="bg-primary hover:bg-primary/90 rounded-lg px-6 py-3 text-sm font-medium text-white transition-all active:scale-95"
                >
                  Tải thêm {Math.min(ITEMS_PER_PAGE, filteredGlossary.length - displayedCount)}{' '}
                  thuật ngữ
                </button>
              </div>
            )}
          </>
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

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="border-default-200 dark:border-default-800 bg-background/90 hover:bg-primary hover:text-white fixed bottom-8 right-8 rounded-full border p-3 shadow-lg backdrop-blur-sm transition-all duration-300"
          aria-label="Scroll to top"
        >
          <ChevronUp size={24} />
        </button>
      )}

      {/* Selection Menu - Right-click to search */}
      <SelectionMenu />

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
