export interface NoteItem {
  line_n: number
  description: string
  description_norm: string
  ean: string
  ncm: string
  qty: number
  unit: string
  unit_price: number
  line_total: number
  category?: string | null
  subcategory?: string | null
  necessity?: string
  price_rank?: number
  min_price_seen?: number
  price_percentile?: number
  is_expensive?: boolean
}

export interface NecessityBreakdown {
  Essencial?: number
  Conveniência?: number
  Supérfluo?: number
}

export interface CategoryBreakdown {
  category: string
  total: number
}

export interface Note {
  note_id: number
  source_url: string
  access_key: string
  issued_at: string
  issued_date: string
  merchant_cnpj: string
  merchant_name: string
  merchant_uf: string
  serie: string
  number: string
  total_amount: number
  total_products: number
  items: NoteItem[]
  item_count?: number
  avg_item_price?: number
  necessity_breakdown?: NecessityBreakdown
  category_breakdown?: CategoryBreakdown[]
  is_outlier?: boolean
  outlier_reason?: string
  savings_opportunity?: number
  day_of_week?: string
  hour_of_day?: number
  spending_vs_avg_pct?: number
}

export interface NecessityTotals {
  Essencial: number
  Conveniência: number
  Supérfluo: number
  "Não classificado": number
}

export interface CategoryTotal {
  category: string
  total: number
  item_count: number
}

export interface MerchantTotal {
  merchant_name: string
  total: number
  note_count: number
}

export interface DateRange {
  first: string
  last: string
}

export interface DayOfWeekTotal {
  day: string
  total: number
  note_count: number
}

export interface HourOfDayTotal {
  hour: number
  total: number
}

export interface Summary {
  total_notes: number
  total_spent: number
  avg_ticket: number
  median_ticket: number
  min_ticket: number
  max_ticket: number
  outlier_count: number
  total_savings_opportunity: number
  date_range: DateRange
  necessity_totals: NecessityTotals
  category_totals: CategoryTotal[]
  merchant_totals: MerchantTotal[]
  day_of_week_totals?: DayOfWeekTotal[]
  hour_of_day_totals?: HourOfDayTotal[]
}

export interface MerchantPrice {
  merchant_name: string
  min_price: number
  avg_price: number
  occurrences: number
}

export interface PriceComparison {
  key: string
  description: string
  ean: string
  category: string
  merchants: MerchantPrice[]
  cheapest_merchant: string
  most_expensive_merchant: string
  price_gap_abs: number
  price_gap_pct: number
  total_occurrences: number
}

export interface MonthlySummary {
  month: string
  total_spend: number
  note_count: number
  top_category: string
  top_merchant: string
  llm_insight?: string
}

export interface TopSavingsItem {
  key: string
  description: string
  ean: string
  category: string
  min_price_ever: number
  max_price_ever: number
  total_overpaid: number
  occurrences: number
}

export interface PersonalInflation {
  category: string
  first_month: string
  last_month: string
  first_avg_price: number
  last_avg_price: number
  variation_pct: number
  months_with_data: number
}

export interface PriceTrend {
  key: string
  description: string
  ean: string
  category: string
  months: string[]
  avg_prices: number[]
  variation_pct: number
  occurrences: number
}

export interface SparkData {
  summary: Summary
  notes: Note[]
  price_comparison: PriceComparison[]
  monthly_summaries: MonthlySummary[]
  top_savings_items?: TopSavingsItem[]
  personal_inflation?: PersonalInflation[]
  price_trends?: PriceTrend[]
}
