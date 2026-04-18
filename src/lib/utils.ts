import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Note, NoteItem } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function filterNotesByPeriod(
  notes: Note[],
  startDate: string | null,
  endDate: string | null
): Note[] {
  if (!startDate && !endDate) {
    return notes
  }

  return notes.filter((note) => {
    const noteDate = note.issued_date
    
    if (startDate && noteDate < startDate) {
      return false
    }
    
    if (endDate && noteDate > endDate) {
      return false
    }
    
    return true
  })
}

export function matchesCategoryFilter(
  item: NoteItem,
  category: string,
  subcategory: string
): boolean {
  if (category !== 'Todas') {
    if (item.category !== category) {
      return false
    }
  }
  
  if (subcategory !== 'Todas') {
    if (item.subcategory !== subcategory) {
      return false
    }
  }
  
  return true
}

export function filterNotesByCategory(
  notes: Note[],
  category: string,
  subcategory: string
): Note[] {
  if (category === 'Todas' && subcategory === 'Todas') {
    return notes
  }

  return notes.filter(note => 
    note.items.some(item => matchesCategoryFilter(item, category, subcategory))
  )
}

export function getFilteredItemsTotal(
  note: Note,
  category: string,
  subcategory: string
): number {
  if (category === 'Todas' && subcategory === 'Todas') {
    return note.total_amount
  }

  return note.items
    .filter(item => matchesCategoryFilter(item, category, subcategory))
    .reduce((sum, item) => sum + item.line_total, 0)
}
