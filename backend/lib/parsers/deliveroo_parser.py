"""
Deliveroo Parser - Backend Version
SRS Section 9.5 - Deliveroo Platform Specifications
"""

import pandas as pd
import re
from datetime import date
from typing import Dict, Any, List
from pathlib import Path


def clean_restaurant_name(name: str) -> str:
    """Remove Arabic characters and trim whitespace"""
    if pd.isna(name):
        return ""
    # Remove Arabic characters (U+0600–U+06FF)
    cleaned = re.sub(r'[\u0600-\u06FF]', '', str(name))
    return cleaned.strip()


def parse_deliveroo_files(file_paths: List[str], date_from: date, date_to: date) -> Dict[str, Any]:
    """
    Parse Deliveroo CSV export files (multiple files for different weeks)
    
    File Format: .csv (multiple files)
    Key Section: 'Orders and related adjustments'
    Row Types:
    - Delivery rows: Activity = 'Delivery'
    - Discount rows: Activity = 'Marketer offer discount'
    
    Group by Order ID (UUID):
    - Total_Sales: SUM of 'Order Value' from Delivery rows per Order ID
    - Net_Revenue: SUM of all 'Total Payable' values per Order ID
    - Discount: SUM of |'Adjustment Net'| from Discount rows
    """
    try:
        all_data = []
        
        # Read all files
        for file_path in file_paths:
            df = pd.read_csv(file_path)
            df['source_file'] = Path(file_path).name
            all_data.append(df)
        
        # Combine all data
        combined_df = pd.concat(all_data, ignore_index=True)
        
        # Filter to 'Orders and related adjustments' section
        # This is typically the first section before 'Fees'
        if 'Section' in combined_df.columns:
            orders_df = combined_df[combined_df['Section'] == 'Orders and related adjustments']
        else:
            orders_df = combined_df
        
        # Group by Order ID
        order_groups = orders_df.groupby('Order ID')
        
        total_sales = 0.0
        net_revenue = 0.0
        discount = 0.0
        num_orders = 0
        
        for order_id, group in order_groups:
            num_orders += 1
            
            # Delivery rows
            delivery_rows = group[group['Activity'] == 'Delivery']
            if not delivery_rows.empty:
                total_sales += delivery_rows['Order Value'].sum()
            
            # All rows for net revenue
            net_revenue += group['Total Payable'].sum()
            
            # Discount rows
            discount_rows = group[group['Activity'] == 'Marketer offer discount']
            if not discount_rows.empty:
                discount += abs(discount_rows['Adjustment Net'].sum())
        
        return {
            "num_orders": num_orders,
            "total_sales": float(total_sales),
            "discount": float(discount),
            "net_revenue": float(net_revenue),
            "sample_rows": combined_df.head(5).to_dict('records')
        }
        
    except Exception as e:
        raise ValueError(f"Failed to parse Deliveroo files: {str(e)}")