import pandas as pd
import difflib
import sys
import re

master_file = r"G:\Mi unidad\Presupuesto de obra\Presupuesto de obra\8200-Matrics-PU-23-j7lmjy.xlsx"
new_budget_file = r"G:\Mi unidad\Crabsa\Obra\Punto Mar\Depto 9\Ppto PM 20260504 demoliciones.xlsx"

# 1. Parse New Budget
try:
    xl_new = pd.ExcelFile(new_budget_file)
    df_new = pd.read_excel(new_budget_file, sheet_name=xl_new.sheet_names[0])
    
    # Find the row that contains "DESCRIPCIÓN" or similar
    start_row = 0
    for idx, row in df_new.iterrows():
        if "DESCRIPCIÓN" in str(row.values).upper() or "DESCRIPCION" in str(row.values).upper():
            start_row = idx + 1
            break
            
    budget_items = []
    for idx in range(start_row, len(df_new)):
        row = df_new.iloc[idx]
        desc = str(row.iloc[3]) if pd.notna(row.iloc[3]) else ""
        if len(desc.strip()) < 5:
            continue
        # Check if it's a valid item (has price or unit)
        unit = str(row.iloc[4]) if pd.notna(row.iloc[4]) else ""
        qty = row.iloc[5]
        price = row.iloc[6]
        
        if pd.notna(price) and isinstance(price, (int, float)):
            budget_items.append({
                "description": desc.strip(),
                "unit": unit,
                "price": price
            })
except Exception as e:
    print(f"Error reading new budget: {e}")
    sys.exit(1)

# 2. Parse Master Matrices
master_items = []
try:
    xl_master = pd.ExcelFile(master_file)
    matrix_sheets = [s for s in xl_master.sheet_names if "Matrices" in s]
    
    for sheet in matrix_sheets:
        df_master = pd.read_excel(master_file, sheet_name=sheet)
        
        # In Matrices, "Análisis:" marks a new concept.
        # Description is usually on the next row in column 0.
        # The price is on the "Análisis:" row in column 6 (0-indexed) based on our previous output.
        # Wait, let's look for "Análisis:" in the first column.
        for idx in range(len(df_master)-1):
            val = str(df_master.iloc[idx, 0]).strip()
            if val == "Análisis:":
                # Next row, first col should be description
                desc = str(df_master.iloc[idx+1, 0]).strip()
                # Try to find price
                price = None
                for c in range(1, len(df_master.columns)):
                    p_val = df_master.iloc[idx, c]
                    if pd.notna(p_val) and isinstance(p_val, (int, float)):
                        price = p_val
                
                if desc and len(desc) > 5 and price is not None:
                    master_items.append({
                        "description": desc,
                        "price": price
                    })
except Exception as e:
    print(f"Error reading master file: {e}")
    sys.exit(1)

# 3. Compare and output markdown
print("## Comparativa de Conceptos: Demoliciones vs Base Maestra\n")
print("| Concepto Presupuesto (Punto Mar) | Precio Pto Mar | Concepto Similar (Base Maestra) | Precio Base | Diferencia |")
print("|----------------------------------|----------------|---------------------------------|-------------|------------|")

master_descriptions = [item['description'] for item in master_items]

for b_item in budget_items:
    desc = b_item['description']
    # Clean up line breaks for markdown table
    clean_desc = desc.replace('\n', ' ').replace('\r', '').replace('|', '-')
    
    matches = difflib.get_close_matches(desc, master_descriptions, n=1, cutoff=0.3)
    if matches:
        match_desc = matches[0]
        # find price
        match_price = next(item['price'] for item in master_items if item['description'] == match_desc)
        clean_match_desc = match_desc.replace('\n', ' ').replace('\r', '').replace('|', '-')
        
        diff = b_item['price'] - match_price
        diff_str = f"${diff:,.2f}"
        
        print(f"| {clean_desc[:60]}... | ${b_item['price']:,.2f} | {clean_match_desc[:60]}... | ${match_price:,.2f} | {diff_str} |")
    else:
        print(f"| {clean_desc[:60]}... | ${b_item['price']:,.2f} | *No se encontró coincidencia* | - | - |")

