'use client'

import { Search } from 'lucide-react'
import { Button, Chip } from '@heroui/react'
import { allTerms } from '@/glossary/terms'

// Define category tags mapping
const categoryTags: Record<string, string[]> = {
  TypeScript: ['generics', 'type-safety', 'interfaces', 'types', 'decorators'],
  React: ['hooks', 'state', 'components', 'jsx', 'props'],
  'Node.js': ['async', 'npm', 'modules', 'buffers', 'streams'],
  Backend: ['api', 'database', 'authentication', 'caching', 'deployment'],
  General: ['oop', 'patterns', 'algorithms', 'architecture'],
}

// Categories list (General is handled separately as the default "all" category)
const categories = ['TypeScript', 'React', 'Node.js', 'Backend']

// Extract unique tags from terms of a specific category
function getCategoryTags(category: string): string[] {
  const categoryTerms = allTerms.filter((term) => term.category === category)
  const allTags = categoryTerms.flatMap((term) => term.tags)
  // Return unique tags, sorted alphabetically
  return [...new Set(allTags)].sort()
}

interface SearchFilterProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function SearchFilter({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: SearchFilterProps) {
  // Get tags for selected category (excluding "General" which uses predefined tags)
  const displayTags =
    selectedCategory === 'General' ? categoryTags.General : getCategoryTags(selectedCategory)

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Search Input */}
      <div className="relative">
        <div className="text-default-400 pointer-events-none absolute top-1/2 left-4 -translate-y-1/2">
          <Search size={20} />
        </div>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm thuật ngữ (ví dụ: event loop, closure, promise...)"
          className="border-default-200 dark:border-default-800 focus:border-primary focus:ring-primary/20 w-full rounded-xl border-2 bg-white py-3 pr-4 pl-12 text-lg transition-all focus:ring-2 focus:outline-none dark:bg-zinc-900"
        />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          onPress={() => onCategoryChange('General')}
          variant={selectedCategory === 'General' ? 'primary' : 'outline'}
          size="sm"
          className="font-medium"
        >
          General
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            onPress={() => onCategoryChange(category)}
            variant={selectedCategory === category ? 'primary' : 'outline'}
            size="sm"
            className="font-medium"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Category Tags Display */}
      <div className="animate-fadeIn flex flex-wrap justify-center gap-2">
        <div className="flex flex-wrap justify-center gap-2">
          {displayTags.map((tag) => (
            <Chip
              key={tag}
              variant="secondary"
              size="sm"
              className="hover:bg-primary/20 cursor-pointer transition-colors"
              onClick={() => {
                // Set search to tag when clicked
                onSearchChange(tag)
              }}
            >
              #{tag}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  )
}
