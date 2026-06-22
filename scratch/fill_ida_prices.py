import pandas as pd
import difflib
import sys

master_file = r"G:\Mi unidad\Presupuesto de obra\Presupuesto de obra\8200-Matrics-PU-23-j7lmjy.xlsx"
ida_file = r"G:\Mi unidad\Crabsa\Obra\Punto Mar\Depto 9\Ppto PM 20260504 demoliciones IDA.xlsx"

# 1. Read Master
master_items = []
try:
    xl_master = pd.ExcelFile(master_file)
    matrix_sheets = [s for s in xl_master.sheet_names if "Matrices" in s]
    
    for sheet in matrix_sheets:
        df_master = pd.read_excel(master_file, sheet_name=sheet)
        for idx in range(len(df_master)-1):
            val = str(df_master.iloc[idx, 0]).strip()
            if val == "Análisis:":
                desc = str(df_master.iloc[idx+1, 0]).strip()
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

master_descriptions = [item['description'] for item in master_items]

# 2. Read IDA
try:
    # 0-indexed, Row 15 is index 14, Row 37 is index 36. 
    # But read_excel with header=None reads from row 1.
    df_ida = pd.read_excel(ida_file, sheet_name=0, header=None)
    
    print("## Precios Unitarios Encontrados para 'Ppto PM 20260504 demoliciones IDA'\n")
    print("| Fila | Concepto IDA (Punto Mar) | Concepto Base (Matrices) | P.U. Base |")
    print("|------|--------------------------|--------------------------|-----------|")
    
    # Rows 15 to 37 (inclusive) means indices 14 to 36
    for i in range(14, min(37, len(df_ida))):
        row = df_ida.iloc[i]
        # column D is index 3
        desc = str(row[3]) if pd.notna(row[3]) else ""
        if len(desc.strip()) < 5:
            continue
            
        clean_desc = desc.replace('\n', ' ').replace('\r', '').replace('|', '-')
        
        matches = difflib.get_close_matches(desc, master_descriptions, n=1, cutoff=0.2)
        if matches:
            match_desc = matches[0]
            match_price = next(item['price'] for item in master_items if item['description'] == match_desc)
            clean_match_desc = match_desc.replace('\n', ' ').replace('\r', '').replace('|', '-')
            print(f"| G{i+1} | {clean_desc[:60]}... | {clean_match_desc[:60]}... | ${match_price:,.2f} |")
        else:
            print(f"| G{i+1} | {clean_desc[:60]}... | *No se encontró coincidencia* | - |")
            
except Exception as e:
    print(f"Error reading IDA file: {e}")

