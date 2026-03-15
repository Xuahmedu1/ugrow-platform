"""
Talabat Parser - Backend Version
SRS Section 9.1 - Talabat Platform Specifications
"""

import pandas as pd
from datetime import date
from typing import Dict, Any


def parse_talabat_file(file_path: str, date_from: date, date_to: date) -> Dict[str, Any]:
    """
    Parse Talabat Excel export file
    
    File Format: .xlsx
    Header Rows: 2 (Row 1: merged category headers, Row 2: column names)
    Data starts at: Row 3
    
    Columns:
    - J: 'Order received at' (YYYY-MM-DD HH:MM)
    - W: 'Subtotal' (Total_Sales under Income)
    - AD: 'Voucher Funded by Vendor' (Discount under Deductions)
    - AN: 'Payout Amount' (Net_Revenue under Payout)
    - B: Order ID (for counting)
    """
    try:
        # Read Excel, skip 2 header rows
        df = pd.read_excel(file_path, header=2)
        
        # Convert date column
        df['Order received at'] = pd.to_datetime(df['Order received at'])
        
        # Filter by date range
        mask = (df['Order received at'].dt.date >= date_from) & (df['Order received at'].dt.date <= date_to)
        filtered_df = df[mask]
        
        if filtered_df.empty:
            return {
                "num_orders": 0,
                "total_sales": 0.0,
                "discount": 0.0,
                "net_revenue": 0.0,
                "sample_rows": []
            }
        
        # Calculate metrics
        num_orders = len(filtered_df)
        total_sales = filtered_df['Subtotal'].sum() if 'Subtotal' in filtered_df.columns else 0.0
        discount = filtered_df['Voucher Funded by Vendor'].sum() if 'Voucher Funded by Vendor' in filtered_df.columns else 0.0
        net_revenue = filtered_df['Payout Amount'].sum() if 'Payout Amount' in filtered_df.columns else 0.0
        
        return {
            "num_orders": int(num_orders),
            "total_sales": float(total_sales),
            "discount": float(abs(discount)),  # Ensure positive
            "net_revenue": float(net_revenue),
            "sample_rows": filtered_df.head(5).to_dict('records')
        }
        
    except Exception as e:
        raise ValueError(f"Failed to parse Talabat file: {str(e)}")