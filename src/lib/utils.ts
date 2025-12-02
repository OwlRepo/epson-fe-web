import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { unparse } from "papaparse"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadCSV(data: any[], filename: string = "export.csv") {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return
  }

  const csv = unparse(data, { header: true })
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 100)
}
