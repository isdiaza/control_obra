import pandas as pd
import sys

file_path = r"G:\Mi unidad\Crabsa\Obra\Punto Mar\Depto 9\Ppto PM 20260504 demoliciones.xlsx"

try:
    xl = pd.ExcelFile(file_path)
    print("Sheets in budget:", xl.sheet_names)
    df = pd.read_excel(file_path, sheet_name=xl.sheet_names[0], nrows=15)
    print(f"\n--- Sheet: {xl.sheet_names[0]} ---")
    print(df.head(15).to_string())
except Exception as e:
    print(f"Error: {e}")
