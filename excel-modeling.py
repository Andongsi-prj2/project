"""
excel-modeling.py
1) project 폴더 안의 원본 .xlsx 중 '_labeled'가 없는 **AND**
   대응되는 *_labeled.xlsx 파일이 아직 존재하지 않는 첫 번째 파일만 선택
2) 불량 판정 → *_labeled.xlsx 저장
"""

from pathlib import Path
import pandas as pd

# === 경로 설정 ==================================================
BASE_DIR = Path(__file__).resolve().parent  # project 폴더

# ── 처리할 원본 파일 탐색 ────────────────────────────────────────
EXCEL_PATH = OUTPUT_PATH = None
for src in sorted(BASE_DIR.glob("*.xlsx")):        # 이름순 반복
    if "_labeled" in src.stem:                     # 이미 라벨된 파일 건너뜀
        continue
    dst = src.with_name(src.stem + "_labeled" + src.suffix)
    if not dst.exists():                           # 아직 라벨링 안 된 경우
        EXCEL_PATH, OUTPUT_PATH = src, dst
        break

if EXCEL_PATH is None:
    raise FileNotFoundError(
        "새로 라벨링할 원본 Excel 파일이 없습니다.\n"
        "※ '_labeled'가 없는 .xlsx 중 결과 파일이 존재하지 않는 것만 처리합니다."
    )

print(f"[INFO] 원본 파일: {EXCEL_PATH.name}")
print(f"[INFO] 결과 파일: {OUTPUT_PATH.name}")

# === 데이터 로드 ================================================
df = pd.read_excel(EXCEL_PATH)

# === 조건별 불량 계산 ===========================================
cond_overplate = (df["Temp"] >= 52.46) & (df["Voltage"] >= 27.44)  # 과도도금/거칠기
cond_peeling   = (df["Voltage"] <= 7.44) & (df["pH"] >= 3)         # 박리/미부착
cond_stain     = (df["Temp"] <= 32.46) & (df["pH"] <= 1)           # 얼룩/부식

df["defect_cnt"] = (
    cond_overplate.astype(int) +
    cond_peeling.astype(int) +
    cond_stain.astype(int)
)

df["status"] = df["defect_cnt"].apply(lambda x: "불량품" if x >= 1 else "정상")

df["defect_reason"] = (
      cond_overplate.map({True: "과도도금/거칠기 ", False: ""})
    + cond_peeling.map({True: "박리/미부착 ",    False: ""})
    + cond_stain.map({True: "얼룩/부식",        False: ""})
).str.strip()

# === 결과 저장 ===================================================
df.to_excel(OUTPUT_PATH, index=False)
print(f"[DONE] {len(df)}건 처리 → '{OUTPUT_PATH.name}' 저장 완료")
