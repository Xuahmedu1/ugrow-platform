(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/parsers/parseSmiles.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseSmilesSheet",
    ()=>parseSmilesSheet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-client] (ecmascript)");
;
async function parseSmilesSheet(files, _dateFrom, _dateTo) {
    // 1. Read and merge all files
    let allRows = [];
    for (const file of files){
        const buffer = await file.arrayBuffer();
        const workbook = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["read"](buffer, {
            type: 'array',
            cellDates: false
        });
        const sheetName = workbook.SheetNames[0] // Sheet 1 only
        ;
        const worksheet = workbook.Sheets[sheetName];
        const fileRows = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].sheet_to_json(worksheet, {
            header: 1,
            defval: null
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
    const COL_POS_ID = 2 // C — 'Total' label in summary row
    ;
    const COL_TOTAL_ORDERS = 3 // D
    ;
    const COL_TOTAL_SALES = 4 // E
    ;
    const COL_ONLINE_SALES = 5 // F
    ;
    const COL_NET_PAYABLE = 8 // I
    ;
    let numOrders = 0;
    let totalSales = 0;
    let onlineSales = 0;
    let netRevenue = 0;
    // 3. Process data rows — skip header (index 0) and Total rows
    for(let i = 1; i < allRows.length; i++){
        const row = allRows[i];
        // Skip the "Total" summary row
        const posId = row[COL_POS_ID];
        if (posId !== null && String(posId).trim().toLowerCase() === 'total') continue;
        // Skip empty rows
        if (row[COL_TOTAL_ORDERS] === null && row[COL_TOTAL_SALES] === null) continue;
        numOrders += toNumber(row[COL_TOTAL_ORDERS]);
        totalSales += toNumber(row[COL_TOTAL_SALES]);
        onlineSales += toNumber(row[COL_ONLINE_SALES]);
        netRevenue += toNumber(row[COL_NET_PAYABLE]);
    }
    // Discount = Total Sales − Online paid Sales (always positive or 0)
    const discount = round2(totalSales - onlineSales);
    return {
        numOrders,
        totalSales: round2(totalSales),
        discount: Math.max(0, discount),
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=lib_parsers_parseSmiles_ts_d67123ef._.js.map