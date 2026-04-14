'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Card } from '@heroui/react'
import { allTerms } from '@/glossary/terms'
import { getCategoryGroup } from '@/app/lib/categories'

interface MenuPosition {
  x: number
  y: number
}

export function SelectionMenu() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 })
  const [selectedText, setSelectedText] = useState('')
  const [searchResults, setSearchResults] = useState<typeof allTerms>([])
  const menuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const searchTerms = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    const lowerQuery = query.toLowerCase()
    const results = allTerms
      .filter((term) => {
        return (
          term.term.toLowerCase().includes(lowerQuery) ||
          term.definition.toLowerCase().includes(lowerQuery) ||
          term.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
        )
      })
      .slice(0, 5) // Limit to 5 results

    setSearchResults(results)
  }, [])

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Check if there's selected text
      const selection = window.getSelection()
      const text = selection?.toString().trim()

      if (text && text.length > 0) {
        e.preventDefault()

        // Calculate position (ensure menu stays within viewport)
        const menuWidth = 320
        const menuHeight = 300
        let x = e.clientX
        let y = e.clientY

        // Adjust if menu would go off screen
        if (x + menuWidth > window.innerWidth) {
          x = window.innerWidth - menuWidth - 10
        }
        if (y + menuHeight > window.innerHeight) {
          y = window.innerHeight - menuHeight - 10
        }

        setPosition({ x, y })
        setSelectedText(text)
        setIsVisible(true)
        searchTerms(text)
      }
    }

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsVisible(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVisible(false)
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [searchTerms])

  // Focus search input when menu appears
  useEffect(() => {
    if (isVisible && searchInputRef.current) {
      searchInputRef.current.focus()
      // Move cursor to end
      const len = searchInputRef.current.value.length
      searchInputRef.current.setSelectionRange(len, len)
    }
  }, [isVisible])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSelectedText(value)
    searchTerms(value)
  }

  const handleSelectResult = (term: typeof searchResults[0]) => {
    setIsVisible(false)
    window.getSelection()?.removeAllRanges()
    router.push(`/terms/${term.slug}`)
  }

  const handleClose = () => {
    setIsVisible(false)
    window.getSelection()?.removeAllRanges()
  }

  if (!isVisible) return null

  return (
    <div
      ref={menuRef}
      className="animate-in fade-in zoom-in-95 fixed z-[9999] duration-150"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <Card className="w-80 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-primary/5 border-default-200 dark:border-default-800 flex items-center gap-2 border-b px-3 py-2">
          <Search size={16} className="text-primary" />
          <input
            ref={searchInputRef}
            type="text"
            value={selectedText}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm thuật ngữ..."
            className="text-foreground placeholder:text-default-400 flex-1 border-none bg-transparent text-sm outline-none"
          />
          <button
            onClick={handleClose}
            className="text-default-400 hover:text-foreground cursor-pointer rounded p-1 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="py-1">
              {searchResults.map((term) => (
                <button
                  key={term.id}
                  onClick={() => handleSelectResult(term)}
                  className="text-foreground hover:bg-primary/10 w-full cursor-pointer px-3 py-2 text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
                      {getCategoryGroup(term.category)}
                    </span>
                    <span className="text-sm font-medium">{term.term}</span>
                  </div>
                  <p className="text-default-500 mt-0.5 line-clamp-1 text-xs">{term.definition}</p>
                </button>
              ))}
            </div>
          ) : selectedText.trim() ? (
            <div className="text-default-400 py-6 text-center text-sm">Không tìm thấy kết quả</div>
          ) : (
            <div className="text-default-400 py-6 text-center text-sm">
              Chọn text và click chuột phải để tìm kiếm
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
