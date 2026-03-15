"""
Smiles (Eateasily) Parser - Backend Version
SRS Section 9.4 - Smiles Platform Specifications
"""

import pandas as pd
from datetime import date
from typing import Dict, Any


def parse_smiles_file(file_path: str, date_from: date, date_to: date) -> Dict[str, Any]:
    """
    Parse Smiles legacy Excel export file
    
    File Format: .xls (BIFF8/CDFV2 - requires xlrd)
    Data Row: Row 2 (index 1) - the actual restaurant data
    Row 3 is a 'Total' row - DO NOT USE
    
    Columns (Row 2):
    - Total_Sales: Gross sales
    - Online_Paid_Sales: Actual online payments
    - Discount: Calculated as Total_Sales - Online_Paid_Sales
    
    Note: Smiles exports are pre-filtered by date, no date filtering needed
    """
    try:
        # Read Excel with xlrd engine for .xls files
        df = pd.read_excel(file_path, engine='xlrd', header=None)
        
        # Row 2 (index 1) contains the data
        if len(df) < 2:
            raise ValueError("Invalid Smiles file: insufficient rows")
        
        data_row = df.iloc[1]  # Row 2 (0-indexed: 1)
        
        # Extract values based on known column positions
        # These may need adjustment based on actual file structure
        total_sales = float(data_row[1]) if len(data_row) > 1 else 0.0  # Adjust index as needed
        online_paid_sales = float(data_row[2]) if len(data_row) > 2 else 0.0
        
        # Calculate discount
        discount = total_sales - online_paid_sales
        
        # For Smiles, we estimate orders based on average order value
        # or use a specific column if available
        estimated_orders = int(data_row[0]) if len(data_row) > 0 and pd.notna(data_row[0]) else 0
        
        # Net revenue is typically online_paid_sales minus fees
        # Use a placeholder calculation
        net_revenue = online_paid_sales * 0.85  # Approximate 15% fees
        
        return {
            "num_orders": estimated_orders,
            "total_sales": float(total_sales),
            "discount": float(discount),
            "net_revenue": float(net_revenue),
            "sample_rows": [data_row.to_dict()]
        }
        
    except Exception as e:
        raise ValueError(f"Failed to parse Smiles file: {str(e)}")