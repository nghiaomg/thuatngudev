'use client'

import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import type { GlossaryTerm } from '@/glossary/types'

interface TermCardProps {
  term: GlossaryTerm
}

export function TermCard({ term }: TermCardProps) {
  const router = useRouter()

  return (
    <div className="border-default-200 dark:border-default-800 hover:shadow-primary/5 hover:border-primary/30 dark:hover:border-primary/30 w-full rounded-xl border bg-white transition-all duration-300 hover:shadow-lg dark:bg-zinc-900">
      <div className="p-6">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-foreground group mb-1 text-xl font-bold">{term.term}</h3>
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
              {term.category}
            </span>
          </div>
        </div>
        <p className="text-default-600 dark:text-default-400 mb-4 leading-relaxed">
          {term.definition}
        </p>

        {/* Preview - Details (collapsed) */}
        <div className="text-default-500 mb-3 line-clamp-2 text-sm leading-relaxed">
          {term.details.replace(/\*\*(.*?)\*\*/g, '$1').split('\n')[0]}
        </div>

        {/* Examples Preview */}
        <div className="text-default-400 mb-4 text-xs">{term.examples.length} ví dụ minh họa</div>

        {/* Footer */}
        <div className="border-default-200 dark:border-default-800 flex items-center justify-between border-t pt-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {term.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="bg-default-100 text-default-500 hover:bg-primary/10 hover:text-primary cursor-default rounded-full px-2 py-0.5 text-xs transition-colors dark:bg-zinc-800"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* View Details Button */}
          <button
            onClick={() => router.push(`/terms/${term.slug}`)}
            className="bg-primary hover:bg-primary/90 group/btn flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:gap-3 active:scale-95"
          >
            <span>Xem chi tiết</span>
            <ChevronRight
              size={16}
              className="transition-transform group-hover/btn:translate-x-0.5"
            />
          </button>
        </div>
      </div>
    </div>
  )
}
