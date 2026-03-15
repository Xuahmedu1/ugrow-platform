/**
 * UGROW Master Sheet Export
 * Exports KPI data to Excel with UGROW brand styling
 * Matches the original HTML design
 */

import * as XLSX from 'xlsx';
import type { KPIResult, PlatformKPIResult, Restaurant } from './types';

// Platform colors (matching the HTML design)
const PLATFORM_COLORS = {
  talabat: { bg: 'FF9900', text: '000000' },    // Orange
  keeta: { bg: 'FFE599', text: '000000' },       // Light Yellow
  noon: { bg: '1155CC', text: 'FFFFFF' },        // Blue
  careem: { bg: '38761D', text: 'FFFFFF' },       // Green
  deliveroo: { bg: '00B2A9', text: 'FFFFFF' },    // Teal
  eateasily: { bg: 'CC0000', text: 'FFFFFF' },   // Red
  smiles: { bg: 'FF6B6B', text: 'FFFFFF' },      // Light Red
};

// UGROW Brand colors
const BRAND_COLORS = {
  purple: 'A64D79',      // Header background
  lightPurple: 'EAD1DC', // Label background
  darkPurple: '674EA7',  // Meta value background
  white: 'FFFFFF',
  black: '000000',
};

interface ExportData {
  restaurant: Restaurant;
  dateFrom: string;
  dateTo: string;
  platformResults: PlatformKPIResult[];
  totalKPI: KPIResult;
}

// KPI Row labels (Arabic and English)
const KPI_ROWS = [
  { ar: 'اجمالي الطلبات', en: 'Total Orders', key: 'numOrders' },
  { ar: 'اجمالي المبيعات', en: 'Total Sales', key: 'totalSales' },
  { ar: 'الخصم', en: 'Discount', key: 'discount' },
  { ar: 'المبلغ المحتسب منه العموله', en: 'Earnings', key: 'earnings' },
  { ar: 'سعر المطعم', en: 'Actual Sales', key: 'actualSales' },
  { ar: 'المصروفات', en: 'Expenses', key: 'expenses' },
  { ar: 'الارباح', en: 'Net Revenue', key: 'netRevenue' },
  { ar: 'الفرق بين الربح وسعر المطعم الاصلي', en: 'Difference', key: 'difference' },
  { ar: 'تكلفه الطعام', en: 'Food Cost', key: 'foodCost' },
  { ar: 'الفرق بين الربح والتكلفه', en: 'Difference Food Cost', key: 'differenceCost' },
];

// Platform order (matching HTML)
const PLATFORM_ORDER = ['talabat', 'keeta', 'noon', 'careem', 'deliveroo', 'eateasily'];

/**
 * Create styled cell
 */
function styledCell(value: any, bgColor: string, textColor: string = '000000', bold: boolean = false, numFmt?: string): any {
  return {
    v: value,
    s: {
      fill: { fgColor: { rgb: bgColor } },
      font: { bold, color: { rgb: textColor } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '999999' } },
        bottom: { style: 'thin', color: { rgb: '999999' } },
        left: { style: 'thin', color: { rgb: '999999' } },
        right: { style: 'thin', color: { rgb: '999999' } },
      },
      ...(numFmt && { numFmt }),
    },
  };
}

/**
 * Export analysis results to Excel Master Sheet
 */
export function exportMasterSheet(data: ExportData): void {
  const { restaurant, dateFrom, dateTo, platformResults, totalKPI } = data;

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Get platforms in order
  const orderedPlatforms = PLATFORM_ORDER.map(name => 
    platformResults.find(p => p.platform === name)
  ).filter(Boolean) as PlatformKPIResult[];

  // ==========================================
  // Build Master Sheet
  // ==========================================
  
  const wsData: any[][] = [];

  // Row 1: Restaurant Name
  wsData.push([
    styledCell('Restaurant Name:', BRAND_COLORS.lightPurple, BRAND_COLORS.black, true),
    styledCell(restaurant.name, BRAND_COLORS.darkPurple, BRAND_COLORS.white, true),
    null, null, null, null, null, null, null, null,
  ]);

  // Row 2: Period
  wsData.push([
    styledCell('Period:', BRAND_COLORS.lightPurple, BRAND_COLORS.black, true),
    styledCell('From:', BRAND_COLORS.lightPurple, BRAND_COLORS.black, true),
    styledCell(dateFrom, BRAND_COLORS.darkPurple, BRAND_COLORS.white, true),
    styledCell('To:', BRAND_COLORS.lightPurple, BRAND_COLORS.black, true),
    styledCell(dateTo, BRAND_COLORS.darkPurple, BRAND_COLORS.white, true),
    null, null, null, null, null,
  ]);

  // Empty row
  wsData.push([]);

  // Header Row
  const headerRow = [
    styledCell('المنصات', BRAND_COLORS.purple, BRAND_COLORS.white, true), // Arabic label
    styledCell('Aggregator', BRAND_COLORS.purple, BRAND_COLORS.white, true), // English label
  ];

  // Platform headers
  PLATFORM_ORDER.forEach(platform => {
    const color = PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS];
    headerRow.push(styledCell(platform.charAt(0).toUpperCase() + platform.slice(1), color.bg, color.text, true));
  });

  // Total and Percent headers
  headerRow.push(styledCell('Total', BRAND_COLORS.purple, BRAND_COLORS.white, true));
  headerRow.push(styledCell('Percent', BRAND_COLORS.purple, BRAND_COLORS.white, true));

  wsData.push(headerRow);

  // KPI Data Rows
  KPI_ROWS.forEach((rowDef, rowIndex) => {
    const dataRow: any[] = [];

    // Arabic label
    dataRow.push({
      v: rowDef.ar,
      s: {
        fill: { fgColor: { rgb: BRAND_COLORS.lightPurple } },
        font: { bold: true },
        alignment: { horizontal: 'right' },
        border: {
          top: { style: 'thin', color: { rgb: '999999' } },
          bottom: { style: 'thin', color: { rgb: '999999' } },
          left: { style: 'thin', color: { rgb: '999999' } },
          right: { style: 'thin', color: { rgb: '999999' } },
        },
      },
    });

    // English label
    dataRow.push({
      v: rowDef.en,
      s: {
        fill: { fgColor: { rgb: BRAND_COLORS.lightPurple } },
        font: { bold: true },
        alignment: { horizontal: 'left' },
        border: {
          top: { style: 'thin', color: { rgb: '999999' } },
          bottom: { style: 'thin', color: { rgb: '999999' } },
          left: { style: 'thin', color: { rgb: '999999' } },
          right: { style: 'thin', color: { rgb: '999999' } },
        },
      },
    });

    // Platform values
    PLATFORM_ORDER.forEach(platform => {
      const platformData = orderedPlatforms.find(p => p.platform === platform);
      const value = platformData ? (platformData.kpi as any)[rowDef.key] : 0;
      const color = PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS];
      
      const isNumber = typeof value === 'number';
      dataRow.push(styledCell(
        isNumber ? value : value || 0,
        color.bg,
        color.text,
        true,
        isNumber ? '#,##0.00' : undefined
      ));
    });

    // Total value
    const totalValue = (totalKPI as any)[rowDef.key];
    dataRow.push(styledCell(
      totalValue,
      BRAND_COLORS.lightPurple,
      BRAND_COLORS.black,
      true,
      '#,##0.00'
    ));

    // Percent (formula placeholder)
    const percentValue = rowIndex === 0 ? 1 : `=(K${rowIndex + 6}/K5)`;
    dataRow.push(styledCell(
      percentValue,
      BRAND_COLORS.darkPurple,
      BRAND_COLORS.white,
      true
    ));

    wsData.push(dataRow);
  });

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 25 }, // Arabic label
    { wch: 20 }, // English label
    { wch: 12 }, // Talabat
    { wch: 12 }, // Keeta
    { wch: 12 }, // Noon
    { wch: 12 }, // Careem
    { wch: 12 }, // Deliveroo
    { wch: 12 }, // Eateasily
    { wch: 15 }, // Total
    { wch: 12 }, // Percent
  ];

  // Set row heights
  ws['!rows'] = [
    { hpt: 25 },
    { hpt: 25 },
    { hpt: 15 }, // Empty
    { hpt: 30 }, // Header
    ...KPI_ROWS.map(() => ({ hpt: 25 })),
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Master Sheet');

  // ==========================================
  // Generate File Name & Download
  // ==========================================
  const safeName = restaurant.name.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `UGROW_MasterSheet_${safeName}_${dateFrom}_${dateTo}.xlsx`;
  
  XLSX.writeFile(wb, fileName);
}

/**
 * Simple export for testing
 */
export function exportPlatformKPI(
  platform: string,
  kpi: KPIResult,
  fileName?: string
): void {
  const data = [
    ['Platform', platform.toUpperCase()],
    [''],
    ['Metric', 'Value (AED)'],
    ['Number of Orders', kpi.numOrders],
    ['Total Sales', kpi.totalSales],
    ['Discount', kpi.discount],
    ['Earnings', kpi.earnings],
    ['Actual Sales', kpi.actualSales],
    ['Net Revenue', kpi.netRevenue],
    ['Expenses', kpi.expenses],
    ['Difference', kpi.difference],
    ['Food Cost', kpi.foodCost],
    ['Difference Cost', kpi.differenceCost],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'KPI Results');

  const finalFileName = fileName || `KPI_${platform}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, finalFileName);
}

export default exportMasterSheet;