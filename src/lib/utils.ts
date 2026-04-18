import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Note } from "./types"

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
