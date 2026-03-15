import type { SheetData } from '../kpiCalculations'

/**
 * Parse one or more Noon .csv files and return aggregated sheet data filtered by date range.
 *
 * Multi-file: All files are merged into one dataset before filtering.
 * Header row is taken from the first file only — subsequent files skip their header.
 *
 * Key columns (by name):
 *   order_ref        → Num_Orders (STRING — preserve leading zeros!)
 *   order_date       → Date filter  "YYYY-MM-DD"
 *   item_value       → Total_Sales  (positive float)
 *   outlet_discount  → Discount     (NEGATIVE → × -1)
 *   net_payable      → Net_Revenue  (can be + or -)
 */
export async function parseNoonSheet(
  files: File[],
  dateFrom: string,
  dateTo: string
): Promise<SheetData> {
  // 1. Read and merge all files
  let allRows: string[][] = []

  for (const file of files) {
    const text = await file.text()
    const fileRows = parseCSV(text)
    if (fileRows.length < 2) continue

    if (allRows.length === 0) {
      allRows = fileRows                    // first file: header + data
    } else {
      allRows.push(...fileRows.slice(1))    // other files: data only (skip header)
    }
  }

  if (allRows.length < 2) {
    return { numOrders: 0, totalSales: 0, discount: 0, netRevenue: 0 }
  }

  // 2. Column index map from header row
  const headers = allRows[0].map(h => h.trim().toLowerCase())
  const col = (name: string) => headers.indexOf(name)

  const COL_ORDER_REF   = col('order_ref')
  const COL_ORDER_DATE  = col('order_date')
  const COL_ITEM_VALUE  = col('item_value')
  const COL_OUTLET_DISC = col('outlet_discount')
  const COL_NET_PAYABLE = col('net_payable')

  // 3. Date boundaries
  const from = new Date(dateFrom)
  const to   = new Date(dateTo)
  from.setHours(0, 0, 0, 0)
  to.setHours(23, 59, 59, 999)

  let numOrders      = 0
  let totalSales     = 0
  let discountRawSum = 0
  let netRevenue     = 0

  // 4. Process data rows
  for (let i = 1; i < allRows.length; i++) {
    const row = allRows[i]

    const orderRef = row[COL_ORDER_REF]
    if (!orderRef || orderRef.trim() === '') continue

    const rawDate = row[COL_ORDER_DATE]?.trim()
    if (!rawDate) continue

    const orderDate = new Date(rawDate)
    orderDate.setHours(12, 0, 0, 0)
    if (orderDate < from || orderDate > to) continue

    numOrders++
    totalSales     += toFloat(row[COL_ITEM_VALUE])
    discountRawSum += toFloat(row[COL_OUTLET_DISC])
    netRevenue     += toFloat(row[COL_NET_PAYABLE])
  }

  return {
    numOrders,
    totalSales: round2(totalSales),
    discount:   round2(discountRawSum * -1),
    netRevenue: round2(netRevenue),
  }
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────

function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0

  while (i < lines.length) {
    const ch = lines[i]
    if (inQuotes) {
      if (ch === '"') {
        if (lines[i + 1] === '"') { field += '"'; i += 2; continue }
        else inQuotes = false
      } else { field += ch }
    } else {
      if (ch === '"') { inQuotes = true }
      else if (ch === ',') { row.push(field); field = '' }
      else if (ch === '\n') {
        row.push(field); field = ''
        if (row.some(v => v.trim() !== '')) rows.push(row)
        row = []; i++; continue
      } else { field += ch }
    }
    i++
  }
  if (field || row.length > 0) {
    row.push(field)
    if (row.some(v => v.trim() !== '')) rows.push(row)
  }
  return rows
}

function toFloat(val: string | undefined): number {
  if (!val || val.trim() === '') return 0
  const n = parseFloat(val.trim())
  return isNaN(n) ? 0 : n
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}