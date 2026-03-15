module.exports = [
"[project]/lib/parsers/parseTalabat.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseTalabatSheet",
    ()=>parseTalabatSheet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-ssr] (ecmascript)");
;
async function parseTalabatSheet(files, dateFrom, dateTo) {
    // 1. Read and merge all files
    // Talabat has 2 header rows — skip both from every file
    let allRows = [];
    for (const file of files){
        const buffer = await file.arrayBuffer();
        const workbook = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["read"](buffer, {
            type: 'array',
            cellDates: false
        });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const fileRows = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].sheet_to_json(worksheet, {
            header: 1,
            defval: null
        });
        // Talabat: skip first 2 rows (merged category headers + column name headers)
        // Data starts at index 2 (Row 3)
        if (fileRows.length < 3) continue;
        allRows.push(...fileRows.slice(2)); // data only — no header needed across files
    }
    if (allRows.length === 0) {
        return {
            numOrders: 0,
            totalSales: 0,
            discount: 0,
            netRevenue: 0
        };
    }
    // 2. Column indices (0-based)
    const COL_ORDER_ID = 1 // B
    ;
    const COL_DATE = 9 // J
    ;
    const COL_SUBTOTAL = 22 // W
    ;
    const COL_VOUCHER = 29 // AD
    ;
    const COL_PAYOUT = 39 // AN
    ;
    // 3. Date boundaries
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    let numOrders = 0;
    let totalSales = 0;
    let discount = 0;
    let netRevenue = 0;
    // 4. Process all data rows
    for (const row of allRows){
        // Skip empty rows
        const orderId = row[COL_ORDER_ID];
        if (!orderId) continue;
        // Date filter — "YYYY-MM-DD HH:MM" → extract date part
        const rawDate = row[COL_DATE];
        if (!rawDate) continue;
        const datePart = String(rawDate).substring(0, 10);
        const orderDate = new Date(datePart);
        orderDate.setHours(12, 0, 0, 0);
        if (orderDate < from || orderDate > to) continue;
        numOrders++;
        totalSales += toNumber(row[COL_SUBTOTAL]);
        discount += toNumber(row[COL_VOUCHER]);
        netRevenue += toNumber(row[COL_PAYOUT]);
    }
    return {
        numOrders,
        totalSales: round2(totalSales),
        discount: round2(discount),
        netRevenue: round2(netRevenue)
    };
}
function toNumber(val) {
    if (val === null || val === undefined || val === '') return 0;
    const n = Number(val);
    return isNaN(n) ? 0 : n;
}
function round2(n) {
    return Math.round(n * 100) / 100;
}
}),
];

//# sourceMappingURL=lib_parsers_parseTalabat_ts_424dc3c6._.js.map