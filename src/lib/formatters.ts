export function formatCurrency(value: number): string {
  const formatted = value.toFixed(2).replace('.', ',')
  const parts = formatted.split(',')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `R$ ${parts.join(',')}`
}

export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-')
  return `${day}/${month}/${year}`
}

export function parseMonthFromDate(dateString: string): string {
  return dateString.substring(0, 7)
}
