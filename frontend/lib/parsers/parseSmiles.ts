import * as XLSX from 'xlsx'
import type { SheetData } from '../kpiCalculations'

/**
 * Parse one or more Smiles .xls files and return aggregated pre-aggregated data.
 *
 * Smiles is the SIMPLEST platform — pre-aggregated summary report.
 * NO date filtering. The period is selected on the Smiles portal before download.
 *
 * Multi-file: If multiple files uploaded (e.g. different months),
 * values from all data rows (excluding Total rows) are summed together.
 *
 * Sheet structure (Sheet 1):
 *   Row 1 → headers                    → SKIP
 *   Row 2 → restaurant data row        → READ
 *   Row 3 → "Total" row (C3 = 'Total') → SKIP
 *
 * Key cells (0-based):
 *   Col 3 (D) → Total Orders    → Num_Orders
 *   Col 4 (E) → Total Sales     → Total_Sales
 *   Col 5 (F) → Online paid Sales → used for Discount = E - F
 *   Col 8 (I) → Net payable     → Net_Revenue
 *
 * dateFrom / dateTo accepted for API consistency but NOT used.
 */
export async function parseSmilesSheet(
  files: File[],
  _dateFrom: string,
  _dateTo: string
): Promise<SheetData> {
  // 1. Read and merge all files
  let allRows: unknown[][] = []

  for (const file of files) {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: false })
    const sheetName = workbook.SheetNames[0]   // Sheet 1 only
    const worksheet = workbook.Sheets[sheetName]
    const fileRows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
    })

    if (fileRows.length < 2) continue

    if (allRows.length === 0) {
      allRows = fileRows                    // first file: header + data
    } else {
      allRows.push(...fileRows.slice(1))    // other files: data only
    }
  }

  if (allRows.length < 2) {
    return { numOrders: 0, totalSales: 0, discount: 0, netRevenue: 0 }
  }

  // 2. Column indices (0-based)
  const COL_POS_ID       = 2   // C — 'Total' label in summary row
  const COL_TOTAL_ORDERS = 3   // D
  const COL_TOTAL_SALES  = 4   // E
  const COL_ONLINE_SALES = 5   // F
  const COL_NET_PAYABLE  = 8   // I

  let numOrders   = 0
  let totalSales  = 0
  let onlineSales = 0
  let netRevenue  = 0

  // 3. Process data rows — skip header (index 0) and Total rows
  for (let i = 1; i < allRows.length; i++) {
    const row = allRows[i]

    // Skip the "Total" summary row
    const posId = row[COL_POS_ID]
    if (posId !== null && String(posId).trim().toLowerCase() === 'total') continue

    // Skip empty rows
    if (row[COL_TOTAL_ORDERS] === null && row[COL_TOTAL_SALES] === null) continue

    numOrders   += toNumber(row[COL_TOTAL_ORDERS])
    totalSales  += toNumber(row[COL_TOTAL_SALES])
    onlineSales += toNumber(row[COL_ONLINE_SALES])
    netRevenue  += toNumber(row[COL_NET_PAYABLE])
  }

  // Discount = Total Sales − Online paid Sales (always positive or 0)
  const discount = round2(totalSales - onlineSales)

  return {
    numOrders,
    totalSales: round2(totalSales),
    discount:   Math.max(0, discount),
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