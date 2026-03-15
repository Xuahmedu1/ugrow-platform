"""
Keeta Parser - Backend Version
SRS Section 9.2 - Keeta Platform Specifications
"""

import pandas as pd
import re
from datetime import date
from typing import Dict, Any


def parse_money_value(value) -> float:
    """Parse AED-prefixed money values like 'AED 42.67' or '-AED 34.00'"""
    if pd.isna(value):
        return 0.0
    
    if isinstance(value, (int, float)):
        return float(value)
    
    value_str = str(value).strip()
    
    # Handle negative values
    negative = False
    if value_str.startswith('-'):
        negative = True
        value_str = value_str[1:]
    
    # Remove AED prefix
    value_str = re.sub(r'AED\s*', '', value_str, flags=re.IGNORECASE)
    
    # Remove any remaining non-numeric chars except decimal point
    value_str = re.sub(r'[^\d.]', '', value_str)
    
    try:
        result = float(value_str)
        return -result if negative else result
    except ValueError:
        return 0.0


def parse_keeta_file(file_path: str, date_from: date, date_to: date) -> Dict[str, Any]:
    """
    Parse Keeta Excel export file
    
    File Format: .xlsx
    Header Rows: 1 (Row 1: column names)
    Data starts at: Row 2
    
    Columns:
    - F: 'Order time' (DD Mon YYYY at HH:MM, e.g., '28 Feb 2026 at 21:45')
    - Q: 'Original price' (Total_Sales, AED-prefixed string)
    - X: 'Promotion funded by merchant' (Discount, negative like '-AED 34.00')
    - Y: 'Net payout' (Net_Revenue, AED-prefixed string)
    - D: 'Order status' (filter for 'Completed')
    """
    try:
        # Read Excel, skip 1 header row
        df = pd.read_excel(file_path, header=0)
        
        # Parse date column
        df['Order time'] = pd.to_datetime(df['Order time'], format='%d %b %Y at %H:%M', errors='coerce')
        
        # Filter by date range
        mask = (df['Order time'].dt.date >= date_from) & (df['Order time'].dt.date <= date_to)
        filtered_df = df[mask]
        
        # Filter for completed orders only
        if 'Order status' in filtered_df.columns:
            filtered_df = filtered_df[filtered_df['Order status'] == 'Completed']
        
        if filtered_df.empty:
            return {
                "num_orders": 0,
                "total_sales": 0.0,
                "discount": 0.0,
                "net_revenue": 0.0,
                "sample_rows": []
            }
        
        # Calculate metrics with money parsing
        num_orders = len(filtered_df)
        total_sales = filtered_df['Original price'].apply(parse_money_value).sum()
        discount = filtered_df['Promotion funded by merchant'].apply(parse_money_value).sum()
        net_revenue = filtered_df['Net payout'].apply(parse_money_value).sum()
        
        # Convert discount to positive
        discount = abs(discount)
        
        return {
            "num_orders": int(num_orders),
            "total_sales": float(total_sales),
            "discount": float(discount),
            "net_revenue": float(net_revenue),
            "sample_rows": filtered_df.head(5).to_dict('records')
        }
        
    except Exception as e:
        raise ValueError(f"Failed to parse Keeta file: {str(e)}")