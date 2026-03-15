(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/exportMasterSheet.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "exportMasterSheet",
    ()=>exportMasterSheet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-client] (ecmascript)");
;
// ─── Platform config ──────────────────────────────────────────────────────────
const PLATFORM_ORDER = [
    "talabat",
    "keeta",
    "noon",
    "careem",
    "deliveroo",
    "smiles"
];
const PLATFORM_LABELS = {
    talabat: "Talabat",
    keeta: "Keeta",
    noon: "Noon",
    careem: "Careem",
    deliveroo: "Deliveroo",
    smiles: "Smiles"
};
// Platform header colors (ARGB format for xlsx)
const PLATFORM_HEADER_FILL = {
    talabat: "FFFF9900",
    keeta: "FFFFF2CC",
    noon: "FF1155CC",
    careem: "FF38761D",
    deliveroo: "FF00B2A9",
    smiles: "FFCC0000"
};
const PLATFORM_HEADER_FONT = {
    talabat: "FF000000",
    keeta: "FF000000",
    noon: "FFFFFFFF",
    careem: "FFFFFFFF",
    deliveroo: "FFFFFFFF",
    smiles: "FFFFFFFF"
};
// Platform data cell colors
const PLATFORM_DATA_FILL = {
    talabat: "FFFCE5CD",
    keeta: "FFFFF2CC",
    noon: "FFC9DAF8",
    careem: "FFD9EAD3",
    deliveroo: "FFD0E0E3",
    smiles: "FFF4CCCC"
};
const KPI_ROWS = [
    {
        ar: "اجمالي الطلبات",
        en: "Total Orders",
        key: "numOrders",
        format: "number",
        percentFormula: ()=>"1"
    },
    {
        ar: "اجمالي المبيعات",
        en: "Total Sales",
        key: "totalSales",
        format: "currency",
        percentFormula: ()=>"1"
    },
    {
        ar: "الخصم",
        en: "Discount",
        key: "discount",
        format: "currency",
        percentFormula: (t, b)=>`=${t}/${b}`
    },
    {
        ar: "المبلغ المحتسب منه العموله",
        en: "Earnings",
        key: "earnings",
        format: "currency",
        percentFormula: (t, b)=>`=${t}/${b}`
    },
    {
        ar: "سعر المطعم",
        en: "Actual Sales",
        key: "actualSales",
        format: "currency",
        percentFormula: (t, b)=>`=${t}/${b}`
    },
    {
        ar: "المصروفات",
        en: "Expenses",
        key: "expenses",
        format: "currency",
        percentFormula: (t, b)=>`=${t}/${b}`
    },
    {
        ar: "الارباح",
        en: "Net Revenue",
        key: "netRevenue",
        format: "currency",
        percentFormula: (t, b)=>`=${t}/${b}`
    },
    {
        ar: "الفرق بين الربح وسعر المطعم الاصلي",
        en: "Difference",
        key: "difference",
        format: "currency",
        percentFormula: (t, b)=>`=${t}/${b}`
    },
    {
        ar: "تكلفه الطعام",
        en: "Food Cost",
        key: "foodCost",
        format: "currency",
        percentFormula: (t, b)=>`=${t}/${b}`
    },
    {
        ar: "الفرق بين الربح والتكلفه",
        en: "Difference Food Cost",
        key: "differenceCost",
        format: "currency",
        percentFormula: (t, b)=>`=${t}/${b}`
    }
];
// ─── Helper functions ─────────────────────────────────────────────────────────
function colLetter(index) {
    // 0-based index to Excel column letter (A=0, B=1, ...)
    let result = "";
    let n = index + 1;
    while(n > 0){
        const rem = (n - 1) % 26;
        result = String.fromCharCode(65 + rem) + result;
        n = Math.floor((n - 1) / 26);
    }
    return result;
}
function fmt(value, format) {
    return Math.round(value * 100) / 100;
}
function applyStyle(ws, cell, style) {
    if (!ws[cell]) ws[cell] = {
        v: "",
        t: "s"
    };
    ws[cell].s = style;
}
function exportMasterSheet({ restaurantName, dateFrom, dateTo, platformResults, totalKPI }) {
    const wb = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].book_new();
    const wsData = [];
    // ── Row 1: Restaurant Name ──────────────────────────────────────────────────
    wsData.push([
        "Restaurant Name:",
        restaurantName,
        "",
        "Period:",
        "From:",
        dateFrom,
        "To:",
        dateTo
    ]);
    wsData.push([]); // empty row
    // ── Which platforms are selected (in fixed order) ───────────────────────────
    const selectedPlatforms = PLATFORM_ORDER.filter((p)=>platformResults.some((r)=>r.platform === p));
    // Build result map for quick lookup
    const resultMap = new Map();
    for (const r of platformResults){
        resultMap.set(r.platform, r.kpi);
    }
    // ── Row 3: Headers ──────────────────────────────────────────────────────────
    const headerRow = [
        "المنصات",
        "Aggregator"
    ];
    for (const p of selectedPlatforms){
        headerRow.push(PLATFORM_LABELS[p]);
    }
    headerRow.push("Total", "Percent");
    wsData.push(headerRow);
    // ── Data rows ───────────────────────────────────────────────────────────────
    // Row indices (1-based in Excel): headers at row 3, data starts at row 4
    const HEADER_ROW = 3;
    const DATA_START_ROW = 4;
    // Column indices (0-based): 0=Arabic label, 1=English label, 2..=platforms, last-1=Total, last=Percent
    const PLATFORM_COL_START = 2;
    const TOTAL_COL = PLATFORM_COL_START + selectedPlatforms.length;
    const PERCENT_COL = TOTAL_COL + 1;
    for(let i = 0; i < KPI_ROWS.length; i++){
        const kpiRow = KPI_ROWS[i];
        const excelRow = DATA_START_ROW + i;
        const row = [
            kpiRow.ar,
            kpiRow.en
        ];
        // Platform values
        for (const p of selectedPlatforms){
            const kpi = resultMap.get(p);
            const val = kpi ? fmt(kpi[kpiRow.key], kpiRow.format) : 0;
            row.push(val);
        }
        // Total
        const totalVal = fmt(totalKPI[kpiRow.key], kpiRow.format);
        row.push(totalVal);
        // Percent formula
        let percentVal = "";
        if (kpiRow.percentFormula) {
            const totalCellRef = `${colLetter(TOTAL_COL)}${excelRow}`;
            const salesRowNum = DATA_START_ROW + 1; // Total Sales row (row index 1 = 2nd KPI row)
            const salesCellRef = `${colLetter(TOTAL_COL)}${salesRowNum}`;
            const actualSalesRowNum = DATA_START_ROW + 4; // Actual Sales row (index 4)
            const actualSalesCellRef = `${colLetter(TOTAL_COL)}${actualSalesRowNum}`;
            if (i === 0 || i === 1) {
                percentVal = 1;
            } else if (i === 7) {
                // Difference: / actualSales
                percentVal = `=${totalCellRef}/${actualSalesCellRef}`;
            } else {
                percentVal = `=${totalCellRef}/${colLetter(TOTAL_COL)}${salesRowNum}`;
            }
        }
        row.push(percentVal);
        wsData.push(row);
    }
    // ── Create worksheet ────────────────────────────────────────────────────────
    const ws = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].aoa_to_sheet(wsData);
    // ── Column widths ───────────────────────────────────────────────────────────
    const colWidths = [
        {
            wch: 35
        },
        {
            wch: 22
        },
        ...selectedPlatforms.map(()=>({
                wch: 14
            })),
        {
            wch: 14
        },
        {
            wch: 10
        }
    ];
    ws["!cols"] = colWidths;
    // ── Styling ─────────────────────────────────────────────────────────────────
    // Note: XLSX.utils styles require xlsx-js-style or SheetJS Pro for full support
    // Using cell .s property which works with some renderers
    const PURPLE = "FF674EA7";
    const PINK_DARK = "FFA64D79";
    const PINK_LIGHT = "FFEAD1DC";
    const WHITE = "FFFFFFFF";
    const BLACK = "FF000000";
    const centerBold = (fill, fontColor = BLACK, fontSize = 11)=>({
            font: {
                bold: true,
                color: {
                    rgb: fontColor
                },
                sz: fontSize
            },
            fill: {
                fgColor: {
                    rgb: fill
                }
            },
            alignment: {
                horizontal: "center",
                vertical: "center",
                wrapText: true
            },
            border: {
                top: {
                    style: "thin",
                    color: {
                        rgb: "FF999999"
                    }
                },
                bottom: {
                    style: "thin",
                    color: {
                        rgb: "FF999999"
                    }
                },
                left: {
                    style: "thin",
                    color: {
                        rgb: "FF999999"
                    }
                },
                right: {
                    style: "thin",
                    color: {
                        rgb: "FF999999"
                    }
                }
            }
        });
    // Style meta row (row 1)
    const metaLabelStyle = {
        font: {
            bold: true,
            sz: 11
        },
        fill: {
            fgColor: {
                rgb: PINK_LIGHT
            }
        },
        border: {
            top: {
                style: "thin"
            },
            bottom: {
                style: "thin"
            },
            left: {
                style: "thin"
            },
            right: {
                style: "thin"
            }
        }
    };
    const metaValueStyle = {
        font: {
            bold: true,
            color: {
                rgb: WHITE
            },
            sz: 11
        },
        fill: {
            fgColor: {
                rgb: PURPLE
            }
        },
        alignment: {
            horizontal: "center"
        },
        border: {
            top: {
                style: "thin"
            },
            bottom: {
                style: "thin"
            },
            left: {
                style: "thin"
            },
            right: {
                style: "thin"
            }
        }
    };
    [
        "A1",
        "D1",
        "E1",
        "G1"
    ].forEach((c)=>applyStyle(ws, c, metaLabelStyle));
    [
        "B1",
        "F1",
        "H1"
    ].forEach((c)=>applyStyle(ws, c, metaValueStyle));
    // Style header row (row 3)
    const headerRowNum = HEADER_ROW;
    applyStyle(ws, `A${headerRowNum}`, centerBold(PINK_DARK, WHITE));
    applyStyle(ws, `B${headerRowNum}`, centerBold(PINK_DARK, WHITE));
    selectedPlatforms.forEach((p, i)=>{
        const col = colLetter(PLATFORM_COL_START + i);
        applyStyle(ws, `${col}${headerRowNum}`, centerBold(PLATFORM_HEADER_FILL[p], PLATFORM_HEADER_FONT[p]));
    });
    applyStyle(ws, `${colLetter(TOTAL_COL)}${headerRowNum}`, centerBold(PINK_DARK, WHITE));
    applyStyle(ws, `${colLetter(PERCENT_COL)}${headerRowNum}`, centerBold(PINK_DARK, WHITE));
    // Style data rows
    for(let i = 0; i < KPI_ROWS.length; i++){
        const excelRow = DATA_START_ROW + i;
        // Arabic label
        applyStyle(ws, `A${excelRow}`, {
            font: {
                bold: true,
                sz: 10
            },
            fill: {
                fgColor: {
                    rgb: PINK_LIGHT
                }
            },
            alignment: {
                horizontal: "right",
                readingOrder: 2
            },
            border: {
                top: {
                    style: "thin",
                    color: {
                        rgb: "FFCCCCCC"
                    }
                },
                bottom: {
                    style: "thin",
                    color: {
                        rgb: "FFCCCCCC"
                    }
                },
                left: {
                    style: "thin",
                    color: {
                        rgb: "FFCCCCCC"
                    }
                },
                right: {
                    style: "thin",
                    color: {
                        rgb: "FFCCCCCC"
                    }
                }
            }
        });
        // English label
        applyStyle(ws, `B${excelRow}`, {
            font: {
                bold: true,
                sz: 10
            },
            fill: {
                fgColor: {
                    rgb: PINK_LIGHT
                }
            },
            alignment: {
                horizontal: "left"
            },
            border: {
                top: {
                    style: "thin",
                    color: {
                        rgb: "FFCCCCCC"
                    }
                },
                bottom: {
                    style: "thin",
                    color: {
                        rgb: "FFCCCCCC"
                    }
                },
                left: {
                    style: "thin",
                    color: {
                        rgb: "FFCCCCCC"
                    }
                },
                right: {
                    style: "thin",
                    color: {
                        rgb: "FFCCCCCC"
                    }
                }
            }
        });
        // Platform cells
        selectedPlatforms.forEach((p, pi)=>{
            const col = colLetter(PLATFORM_COL_START + pi);
            applyStyle(ws, `${col}${excelRow}`, centerBold(PLATFORM_DATA_FILL[p]));
        });
        // Total cell
        applyStyle(ws, `${colLetter(TOTAL_COL)}${excelRow}`, centerBold(PINK_LIGHT));
        // Percent cell
        applyStyle(ws, `${colLetter(PERCENT_COL)}${excelRow}`, centerBold(PURPLE, WHITE));
    }
    // ── Number format ───────────────────────────────────────────────────────────
    const currencyFmt = "#,##0.00";
    const pctFmt = "0.00%";
    for(let i = 0; i < KPI_ROWS.length; i++){
        const kpiRow = KPI_ROWS[i];
        const excelRow = DATA_START_ROW + i;
        const isNum = kpiRow.format === "number";
        for(let ci = PLATFORM_COL_START; ci <= TOTAL_COL; ci++){
            const cellRef = `${colLetter(ci)}${excelRow}`;
            if (ws[cellRef]) {
                ws[cellRef].z = isNum ? "0" : currencyFmt;
            }
        }
        // Percent column (skip rows 1 & 2 which are hardcoded 1)
        const pctRef = `${colLetter(PERCENT_COL)}${excelRow}`;
        if (ws[pctRef] && i >= 2) {
            ws[pctRef].z = pctFmt;
        }
    }
    // ── Add sheet & save ────────────────────────────────────────────────────────
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(wb, ws, "Master Sheet");
    const filename = `UGROW_MasterSheet_${restaurantName.replace(/\s+/g, "_")}_${dateFrom}_${dateTo}.xlsx`;
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["writeFile"](wb, filename);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=lib_exportMasterSheet_ts_6da7045f._.js.map