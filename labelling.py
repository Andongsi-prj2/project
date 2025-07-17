import pandas as pd
from pathlib import Path

# === 파일 로드 ===================================================
input_path = Path("merged_with_random_images_cleaned.csv")
output_path = input_path.with_name(input_path.stem + "_labeled.xlsx")

df = pd.read_csv(input_path)

# === 고장 조건 정의 ===============================================
cond_overplate = (df["Temp"] >= 52.46) & (df["Voltage"] >= 27.44)  # 과도도금/거칠기
cond_peeling   = (df["Voltage"] <= 7.44) & (df["pH"] >= 3)         # 박리/미부착
cond_stain     = (df["Temp"] <= 32.46) & (df["pH"] <= 1)           # 얼룩/부식

# === image_file 컬럼 고장유형으로 대체 ============================
df["image_file"] = (
      cond_overplate.map({True: "과도도금/거칠기 ", False: ""})
    + cond_peeling.map({True: "박리/미부착 ",    False: ""})
    + cond_stain.map({True: "얼룩/부식",        False: ""})
).str.strip()

# === 엑셀로 저장 ==================================================
df.to_excel(output_path, index=False)
print(f"[완료] 결과 저장됨: {output_path}")
