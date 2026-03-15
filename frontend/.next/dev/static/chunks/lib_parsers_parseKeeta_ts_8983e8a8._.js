(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/parsers/parseKeeta.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseKeetaSheet",
    ()=>parseKeetaSheet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-client] (ecmascript)");
;
async function parseKeetaSheet(files, dateFrom, dateTo) {
    // 1. Read and merge all files
    let allRows = [];
    for (const file of files){
        const buffer = await file.arrayBuffer();
        const workbook = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["read"](buffer, {
            type: 'array',
            cellDates: false
        });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const fileRows = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].sheet_to_json(worksheet, {
            header: 1,
            defval: null,
            raw: false
        });
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
    // 2. Column indices (0-based)
    const COL_STATUS = 3 // D
    ;
    const COL_DATE = 5 // F
    ;
    const COL_EARNINGS = 9 // J — sheet "Earnings" = Net_Revenue
    ;
    const COL_ORIG_PRC = 16 // Q — Original price = Total_Sales
    ;
    const COL_PROMO = 23 // X — Promotion funded by merchant = Discount
    ;
    // 3. Date boundaries
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    let numOrders = 0;
    let totalSales = 0;
    let discountRawSum = 0;
    let netRevenue = 0;
    // 4. Process data rows (skip header at index 0)
    for(let i = 1; i < allRows.length; i++){
        const row = allRows[i];
        const status = row[COL_STATUS];
        if (!status) continue;
        const rawDate = row[COL_DATE];
        if (!rawDate) continue;
        const parsedDate = parseKeetaDate(String(rawDate));
        if (!parsedDate) continue;
        const orderDate = new Date(parsedDate);
        orderDate.setHours(12, 0, 0, 0);
        if (orderDate < from || orderDate > to) continue;
        numOrders++;
        totalSales += parseAED(row[COL_ORIG_PRC]);
        discountRawSum += parseAED(row[COL_PROMO]);
        netRevenue += parseAED(row[COL_EARNINGS]);
    }
    return {
        numOrders,
        totalSales: round2(totalSales),
        discount: round2(discountRawSum * -1),
        netRevenue: round2(netRevenue)
    };
}
// ─── AED Currency Strip ───────────────────────────────────────────────────────
function parseAED(val) {
    if (val === null || val === undefined) return 0;
    let str = String(val).trim();
    if (!str) return 0;
    let negative = false;
    if (str.startsWith('-AED')) {
        negative = true;
        str = str.slice(4).trim();
    } else if (str.startsWith('AED')) {
        str = str.slice(3).trim();
    }
    str = str.replace(/\u00A0/g, '').trim();
    const n = parseFloat(str);
    if (isNaN(n)) return 0;
    return negative ? -n : n;
}
// ─── Date Parser ─────────────────────────────────────────────────────────────
function parseKeetaDate(raw) {
    const parts = raw.split(' at ');
    if (parts.length < 1) return null;
    const tokens = parts[0].trim().split(/\s+/);
    if (tokens.length < 3) return null;
    const day = tokens[0].padStart(2, '0');
    const month = MONTH_MAP[tokens[1]];
    const year = tokens[2];
    if (!month) return null;
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
function round2(n) {
    return Math.round(n * 100) / 100;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=lib_parsers_parseKeeta_ts_8983e8a8._.js.map