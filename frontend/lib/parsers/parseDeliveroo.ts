import type { SheetData } from '../kpiCalculations'

interface DeliverooRow {
  restaurantName: string
  orderNumber:    string
  deliveryDate:   string
  activity:       string
  orderValue:     number
  adjustmentNet:  number
  totalPayable:   number
  orderId:        string
}

export async function parseDeliverooSheets(
  files: File[],
  dateFrom: string,
  dateTo: string
): Promise<SheetData> {
  // ── DEBUG ──────────────────────────────────────────────────────────────────
  console.log('[Deliveroo] dateFrom:', JSON.stringify(dateFrom))
  console.log('[Deliveroo] dateTo:',   JSON.stringify(dateTo))
  console.log('[Deliveroo] files:', files.map(f => f.name))
  // ──────────────────────────────────────────────────────────────────────────

  // 1. Parse all files
  const allOrderRows: DeliverooRow[] = []

  for (const file of files) {
    const text = await file.text()
    const rows = parseDeliverooFile(text)
    console.log(`[Deliveroo] ${file.name} → ${rows.length} rows`)
    allOrderRows.push(...rows)
  }

  console.log('[Deliveroo] Total order rows:', allOrderRows.length)

  if (allOrderRows.length === 0) {
    return { numOrders: 0, totalSales: 0, discount: 0, netRevenue: 0 }
  }

  // 2. Date boundaries
  const from = new Date(dateFrom)
  const to   = new Date(dateTo)
  from.setHours(0, 0, 0, 0)
  to.setHours(23, 59, 59, 999)

  console.log('[Deliveroo] from:', from.toISOString())
  console.log('[Deliveroo] to:',   to.toISOString())

  // 3. Group rows by Order ID
  const orderMap = new Map<string, DeliverooRow[]>()
  for (const row of allOrderRows) {
    const key = row.orderId || row.orderNumber
    if (!key) continue
    if (!orderMap.has(key)) orderMap.set(key, [])
    orderMap.get(key)!.push(row)
  }

  console.log('[Deliveroo] Order groups:', orderMap.size)

  // 4. Filter by date and compute KPIs
  let numOrders      = 0
  let totalSales     = 0
  let discountRawSum = 0
  let netRevenue     = 0

  for (const [key, rows] of orderMap) {
    const deliveryRow = rows.find(r => r.activity === 'Delivery')
    if (!deliveryRow || !deliveryRow.deliveryDate) {
      console.log(`[Deliveroo] Group ${key}: no delivery row or no date`)
      continue
    }

    const orderDate = new Date(deliveryRow.deliveryDate)
    orderDate.setHours(12, 0, 0, 0)

    const inRange = orderDate >= from && orderDate <= to
    console.log(`[Deliveroo] Group ${key}: date=${deliveryRow.deliveryDate} inRange=${inRange}`)

    if (!inRange) continue

    numOrders++
    totalSales += deliveryRow.orderValue

    for (const row of rows) {
      if (row.activity !== 'Delivery') discountRawSum += row.adjustmentNet
    }
    for (const row of rows) {
      netRevenue += row.totalPayable
    }
  }

  console.log('[Deliveroo] Result:', { numOrders, totalSales, discount: round2(discountRawSum * -1), netRevenue: round2(netRevenue) })

  return {
    numOrders,
    totalSales: round2(totalSales),
    discount:   round2(discountRawSum * -1),
    netRevenue: round2(netRevenue),
  }
}

// ─── File Parser ─────────────────────────────────────────────────────────────

function parseDeliverooFile(text: string): DeliverooRow[] {
  const rows: DeliverooRow[] = []
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')

  let inOrdersSection = false
  let hasHeaders = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed === 'Orders and related adjustments') {
      inOrdersSection = true
      hasHeaders = false
      continue
    }
    if (trimmed.startsWith('Payments for contested') || trimmed === 'Other payments and fees') {
      inOrdersSection = false
      hasHeaders = false
      continue
    }

    if (!inOrdersSection) continue

    if (trimmed.startsWith('Restaurant Name,')) {
      hasHeaders = true
      continue
    }

    if (!hasHeaders) continue

    const cols = parseCSVLine(trimmed)
    if (cols.length < 11) continue

    const restaurantName = cleanArabic(cols[0] ?? '')
    if (!restaurantName) continue

    const activity      = cols[3] ?? ''
    const deliveryDT    = cols[2] ?? ''
    const orderValueStr = cols[4] ?? ''
    const adjNetStr     = cols[5] ?? ''
    const totalPayStr   = cols[10] ?? ''
    const orderId       = cols[12] ?? ''
    const orderNumber   = cols[1] ?? ''

    const deliveryDate = activity === 'Delivery' && deliveryDT
      ? deliveryDT.substring(0, 10)
      : ''

    rows.push({
      restaurantName,
      orderNumber,
      deliveryDate,
      activity,
      orderValue:    toFloat(orderValueStr),
      adjustmentNet: toFloat(adjNetStr),
      totalPayable:  toFloat(totalPayStr),
      orderId,
    })
  }

  return rows
}

// ─── Arabic Cleanup ───────────────────────────────────────────────────────────

function cleanArabic(text: string): string {
  return text
    .replace(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── CSV Line Parser ──────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { field += '"'; i += 2; continue }
        else inQuotes = false
      } else { field += ch }
    } else {
      if (ch === '"') { inQuotes = true }
      else if (ch === ',') { fields.push(field); field = '' }
      else { field += ch }
    }
    i++
  }
  fields.push(field)
  return fields
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toFloat(val: string): number {
  if (!val || val.trim() === '') return 0
  const n = parseFloat(val.trim())
  return isNaN(n) ? 0 : n
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}