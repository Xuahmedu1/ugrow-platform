module.exports = [
"[project]/lib/parsers/parseCareem.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseCareemSheet",
    ()=>parseCareemSheet
]);
async function parseCareemSheet(files, dateFrom, dateTo) {
    // 1. Read and merge all files (each may have BOM)
    let allRows = [];
    for (const file of files){
        let text = await file.text();
        if (text.startsWith('\uFEFF')) text = text.slice(1); // strip BOM
        const fileRows = parseCSV(text);
        if (fileRows.length < 2) continue;
        if (allRows.length === 0) {
            allRows = fileRows; // first file: header + data
        } else {
            allRows.push(...fileRows.slice(1)); // other files: data only
        }
    }
    if (allRows.length < 2) {
        return {
            numOrders: 0,
            totalSales: 0,
            discount: 0,
            netRevenue: 0
        };
    }
    // 2. Column index map (uppercase for Careem headers)
    const headers = allRows[0].map((h)=>h.trim().toUpperCase());
    const col = (name)=>headers.indexOf(name.toUpperCase());
    const COL_STATUS = col('STATUS');
    const COL_DELIVERY = col('DELIVERY_TIME');
    const COL_AMOUNT = col('TOTAL_AMOUNT');
    const COL_DISCOUNT = col('PARTNER_FUNDED_PROMO_DISCOUNT');
    const COL_PAYOUT = col('TOTAL_PAYOUT_AMOUNT');
    // 3. Date boundaries
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    let numOrders = 0;
    let totalSales = 0;
    let discountRawSum = 0;
    let netRevenue = 0;
    // 4. Process data rows
    for(let i = 1; i < allRows.length; i++){
        const row = allRows[i];
        // Only Delivered rows
        if (row[COL_STATUS]?.trim() !== 'Delivered') continue;
        // Parse DELIVERY_TIME
        const deliveryRaw = row[COL_DELIVERY]?.trim();
        if (!deliveryRaw) continue;
        const parsedDate = parseCareemDate(deliveryRaw);
        if (!parsedDate) continue;
        const orderDate = new Date(parsedDate);
        orderDate.setHours(12, 0, 0, 0);
        if (orderDate < from || orderDate > to) continue;
        numOrders++;
        totalSales += toFloat(row[COL_AMOUNT]);
        discountRawSum += toFloat(row[COL_DISCOUNT]);
        netRevenue += toFloat(row[COL_PAYOUT]);
    }
    return {
        numOrders,
        totalSales: round2(totalSales),
        discount: round2(discountRawSum * -1),
        netRevenue: round2(netRevenue)
    };
}
// ─── DELIVERY_TIME Parser ────────────────────────────────────────────────────
function parseCareemDate(raw) {
    const parts = raw.trim().split(/\s+/);
    if (parts.length < 6) return null;
    const month = MONTH_MAP[parts[1]];
    if (!month) return null;
    const day = parts[2].padStart(2, '0');
    const year = parts[5];
    return `${year}-${month}-${day}`;
}
const MONTH_MAP = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12'
};
// ─── CSV Parser ───────────────────────────────────────────────────────────────
function parseCSV(text) {
    const rows = [];
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    let row = [];
    let field = '';
    let inQuotes = false;
    let i = 0;
    while(i < normalized.length){
        const ch = normalized[i];
        if (inQuotes) {
            if (ch === '"') {
                if (normalized[i + 1] === '"') {
                    field += '"';
                    i += 2;
                    continue;
                } else inQuotes = false;
            } else {
                field += ch;
            }
        } else {
            if (ch === '"') {
                inQuotes = true;
            } else if (ch === ',') {
                row.push(field);
                field = '';
            } else if (ch === '\n') {
                row.push(field);
                field = '';
                if (row.some((v)=>v.trim() !== '')) rows.push(row);
                row = [];
                i++;
                continue;
            } else {
                field += ch;
            }
        }
        i++;
    }
    if (field || row.length > 0) {
        row.push(field);
        if (row.some((v)=>v.trim() !== '')) rows.push(row);
    }
    return rows;
}
function toFloat(val) {
    if (!val || val.trim() === '') return 0;
    const n = parseFloat(val.trim());
    return isNaN(n) ? 0 : n;
}
function round2(n) {
    return Math.round(n * 100) / 100;
}
}),
];

//# sourceMappingURL=lib_parsers_parseCareem_ts_3503f2ac._.js.map