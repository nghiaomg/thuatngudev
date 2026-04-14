// Map detailed categories to parent groups
export const categoryGroupMap: Record<string, string[]> = {
  Database: ['MySQL', 'PostgreSQL', 'MongoDB', 'Database'],
  Authentication: ['Authentication'],
  Backend: ['Backend'],
  'Node.js': ['Node.js'],
  React: ['React'],
  TypeScript: ['TypeScript'],
  Test: ['Test'],
  General: ['General'],
  Infrastructure: ['Infrastructure'],
  Security: ['Security'],
  Logging: ['Logging'],
}

export function getCategoryGroup(category: string): string {
  for (const [group, categories] of Object.entries(categoryGroupMap)) {
    if (categories.includes(category)) {
      return group
    }
  }
  return category
}

export const displayCategories = [
  'General',
  'TypeScript',
  'React',
  'Node.js',
  'Backend',
  'Database',
  'Test',
  'Security',
]
