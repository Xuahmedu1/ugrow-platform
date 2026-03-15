"""
Careem Parser - Backend Version
SRS Section 9.6 - Careem Platform Specifications
"""

import pandas as pd
from datetime import date
from typing import Dict, Any


def parse_careem_file(file_path: str, date_from: date, date_to: date) -> Dict[str, Any]:
    """
    Parse Careem Excel export file
    
    File Format: .xlsx
    Header Rows: 1 (Row 1: column names)
    Data starts at: Row 2
    
    Columns:
    - DELIVERY_TIME: YYYY-MM-DD HH:MM:SS
    - Order value columns (to be verified against actual export)
    """
    try:
        # Read Excel
        df = pd.read_excel(file_path, header=0)
        
        # Parse date column
        df['DELIVERY_TIME'] = pd.to_datetime(df['DELIVERY_TIME'])
        
        # Filter by date range
        mask = (df['DELIVERY_TIME'].dt.date >= date_from) & (df['DELIVERY_TIME'].dt.date <= date_to)
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
        # Note: Column names need to be verified against actual Careem export
        num_orders = len(filtered_df)
        
        # Placeholder calculations - update with actual column names
        total_sales = 0.0
        discount = 0.0
        net_revenue = 0.0
        
        # Try common column names
        if 'ORDER_VALUE' in filtered_df.columns:
            total_sales = filtered_df['ORDER_VALUE'].sum()
        elif 'TOTAL' in filtered_df.columns:
            total_sales = filtered_df['TOTAL'].sum()
        
        if 'DISCOUNT' in filtered_df.columns:
            discount = filtered_df['DISCOUNT'].sum()
        
        if 'NET_PAYOUT' in filtered_df.columns:
            net_revenue = filtered_df['NET_PAYOUT'].sum()
        elif 'PAYOUT' in filtered_df.columns:
            net_revenue = filtered_df['PAYOUT'].sum()
        
        return {
            "num_orders": int(num_orders),
            "total_sales": float(total_sales),
            "discount": float(abs(discount)),
            "net_revenue": float(net_revenue),
            "sample_rows": filtered_df.head(5).to_dict('records')
        }
        
    except Exception as e:
        raise ValueError(f"Failed to parse Careem file: {str(e)}")