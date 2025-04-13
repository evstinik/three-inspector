import { Object3D } from 'three'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Define filter types
export type ObjectFilterType = 'name' | 'type' | 'property' | 'custom'

export interface ObjectFilter {
  id: string
  type: ObjectFilterType
  pattern: string
  enabled: boolean
  // For property filters
  property?: string
  // For custom filters
  filterFn?: (obj: Object3D) => boolean
}

interface FilterState {
  // Array of filters
  filters: ObjectFilter[]

  // Filter operations
  addFilter: (filter: Omit<ObjectFilter, 'id'>) => string
  removeFilter: (id: string) => void
  toggleFilter: (id: string) => void
  updateFilter: (id: string, updates: Partial<Omit<ObjectFilter, 'id'>>) => void
  clearFilters: () => void

  // Filter application
  shouldShowObject: (obj: Object3D) => boolean
}

// Create a store for filters with persistence
export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      filters: [],

      addFilter: (filter) => {
        const id = crypto.randomUUID()
        set((state) => ({
          filters: [...state.filters, { ...filter, id }]
        }))
        return id
      },

      removeFilter: (id) => {
        set((state) => ({
          filters: state.filters.filter((filter) => filter.id !== id)
        }))
      },

      toggleFilter: (id) => {
        set((state) => ({
          filters: state.filters.map((filter) =>
            filter.id === id ? { ...filter, enabled: !filter.enabled } : filter
          )
        }))
      },

      updateFilter: (id, updates) => {
        set((state) => ({
          filters: state.filters.map((filter) =>
            filter.id === id ? { ...filter, ...updates } : filter
          )
        }))
      },

      clearFilters: () => {
        set({ filters: [] })
      },

      shouldShowObject: (obj: Object3D) => {
        const { filters } = get()

        // If no active filters, show all objects
        const activeFilters = filters.filter((f) => f.enabled)
        if (activeFilters.length === 0) return true

        // Check against each active filter
        return activeFilters.some((filter) => {
          switch (filter.type) {
            case 'name':
              return new RegExp(filter.pattern, 'i').test(obj.name)

            case 'type':
              return new RegExp(filter.pattern, 'i').test(obj.type)

            case 'property':
              if (!filter.property) return false
              // @ts-ignore - dynamically access properties
              const propValue = obj[filter.property]
              return (
                propValue !== undefined && new RegExp(filter.pattern, 'i').test(String(propValue))
              )

            case 'custom':
              return filter.filterFn ? filter.filterFn(obj) : false

            default:
              return false
          }
        })
      }
    }),
    {
      name: 'three-inspector-filters', // localStorage key
      partialize: (state) => ({
        filters: state.filters.map(({ id, type, pattern, enabled, property }) => ({
          id,
          type,
          pattern,
          enabled,
          property
        }))
      })
    }
  )
)

// Helper functions for common filter operations
export function createNameFilter(pattern: string, enabled = true): Omit<ObjectFilter, 'id'> {
  return {
    type: 'name',
    pattern,
    enabled
  }
}

export function createTypeFilter(pattern: string, enabled = true): Omit<ObjectFilter, 'id'> {
  return {
    type: 'type',
    pattern,
    enabled
  }
}

export function createPropertyFilter(
  property: string,
  pattern: string,
  enabled = true
): Omit<ObjectFilter, 'id'> {
  return {
    type: 'property',
    property,
    pattern,
    enabled
  }
}

export function createCustomFilter(
  filterFn: (obj: Object3D) => boolean,
  pattern: string = 'Custom filter',
  enabled = true
): Omit<ObjectFilter, 'id'> {
  return {
    type: 'custom',
    pattern,
    filterFn,
    enabled
  }
}
