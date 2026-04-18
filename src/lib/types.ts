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
}
