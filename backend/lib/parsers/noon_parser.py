"""
Noon Parser - Backend Version
SRS Section 9.3 - Noon Platform Specifications
"""

import pandas as pd
from datetime import date
from typing import Dict, Any


def parse_noon_file(file_path: str, date_from: date, date_to: date) -> Dict[str, Any]:
    """
    Parse Noon CSV export file
    
    File Format: .csv
    Columns:
    - order_date: YYYY-MM-DD
    - item_value: Total_Sales (positive float)
    - outlet_discount: Discount (NEGATIVE float, multiply by -1)
    - net_payable: Net_Revenue (float, can be negative)
    """
    try:
        # Read CSV, parse all as text first to preserve leading zeros
        df = pd.read_csv(file_path, dtype=str)
        
        # Convert types
        df['order_date'] = pd.to_datetime(df['order_date'])
        df['item_value'] = pd.to_numeric(df['item_value'], errors='coerce').fillna(0)
        df['outlet_discount'] = pd.to_numeric(df['outlet_discount'], errors='coerce').fillna(0)
        df['net_payable'] = pd.to_numeric(df['net_payable'], errors='coerce').fillna(0)
        
        # Filter by date range
        mask = (df['order_date'].dt.date >= date_from) & (df['order_date'].dt.date <= date_to)
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
        total_sales = filtered_df['item_value'].sum()
        discount = filtered_df['outlet_discount'].sum() * -1  # Convert negative to positive
        net_revenue = filtered_df['net_payable'].sum()
        
        return {
            "num_orders": int(num_orders),
            "total_sales": float(total_sales),
            "discount": float(discount),
            "net_revenue": float(net_revenue),
            "sample_rows": filtered_df.head(5).to_dict('records')
        }
        
    except Exception as e:
        raise ValueError(f"Failed to parse Noon file: {str(e)}")