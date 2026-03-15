import * as XLSX from 'xlsx'
import type { SheetData } from '../kpiCalculations'

/**
 * Parse one or more Talabat .xlsx files and return aggregated sheet data.
 *
 * Multi-file: All files merged before filtering.
 * Each file has 2 header rows (Row 1 = merged categories, Row 2 = column names).
 * Data starts at Row 3 — so we skip the first 2 rows of each file.
 *
 * Key columns (1-based, 0-based index in brackets):
 *   Col  2 [1]  (B)  → Order ID           → Num_Orders (count)
 *   Col 10 [9]  (J)  → Order received at  → Date filter "YYYY-MM-DD HH:MM"
 *   Col 23 [22] (W)  → Subtotal           → Total_Sales
 *   Col 30 [29] (AD) → Voucher Funded by Vendor → Discount (positive)
 *   Col 40 [39] (AN) → Payout Amount      → Net_Revenue
 *
 * NOTE: Talabat files use inline strings (no sharedStrings table).
 * The xlsx library handles this automatically.
 */
export async function parseTalabatSheet(
  files: File[],
  dateFrom: string,
  dateTo: string
): Promise<SheetData> {
  // 1. Read and merge all files
  // Talabat has 2 header rows — skip both from every file
  let allRows: unknown[][] = []

  for (const file of files) {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: false })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const fileRows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
    })

    // Talabat: skip first 2 rows (merged category headers + column name headers)
    // Data starts at index 2 (Row 3)
    if (fileRows.length < 3) continue

    allRows.push(...fileRows.slice(2))    // data only — no header needed across files
  }

  if (allRows.length === 0) {
    return { numOrders: 0, totalSales: 0, discount: 0, netRevenue: 0 }
  }

  // 2. Column indices (0-based)
  const COL_ORDER_ID = 1   // B
  const COL_DATE     = 9   // J
  const COL_SUBTOTAL = 22  // W
  const COL_VOUCHER  = 29  // AD
  const COL_PAYOUT   = 39  // AN

  // 3. Date boundaries
  const from = new Date(dateFrom)
  const to   = new Date(dateTo)
  from.setHours(0, 0, 0, 0)
  to.setHours(23, 59, 59, 999)

  let numOrders  = 0
  let totalSales = 0
  let discount   = 0
  let netRevenue = 0

  // 4. Process all data rows
  for (const row of allRows) {
    // Skip empty rows
    const orderId = (row as unknown[])[COL_ORDER_ID]
    if (!orderId) continue

    // Date filter — "YYYY-MM-DD HH:MM" → extract date part
    const rawDate = (row as unknown[])[COL_DATE] as string | null
    if (!rawDate) continue

    const datePart = String(rawDate).substring(0, 10)
    const orderDate = new Date(datePart)
    orderDate.setHours(12, 0, 0, 0)
    if (orderDate < from || orderDate > to) continue

    numOrders++
    totalSales += toNumber((row as unknown[])[COL_SUBTOTAL])
    discount   += toNumber((row as unknown[])[COL_VOUCHER])
    netRevenue += toNumber((row as unknown[])[COL_PAYOUT])
  }

  return {
    numOrders,
    totalSales: round2(totalSales),
    discount:   round2(discount),    // already positive in Talabat
    netRevenue: round2(netRevenue),
  }
}

function toNumber(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0
  const n = Number(val)
  return isNaN(n) ? 0 : n
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}