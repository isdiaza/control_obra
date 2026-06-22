import pandas as pd
import sys

file_path = r"G:\Mi unidad\Presupuesto de obra\Presupuesto de obra\8200-Matrics-PU-23-j7lmjy.xlsx"

try:
    xl = pd.ExcelFile(file_path)
    df = pd.read_excel(file_path, sheet_name='Matrices 1', nrows=30)
    with open(r"c:\Users\israe\OneDrive\Documentos\Antigravity\Dibersa\scratch\matrices1_output.txt", "w", encoding="utf-8") as f:
        f.write(df.head(30).to_string())
    print("Done writing to matrices1_output.txt")
except Exception as e:
    print(f"Error: {e}")
