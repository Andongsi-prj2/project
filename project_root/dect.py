# 고장유형 판단 함수
# 온도, 전압, 산도 값을 입력받아 고장유형을 판단하는 함수

def determine_defect_type(temp, voltage, ph):
    if temp >= 52.46 and voltage >= 27.44:  
        return 1  # 과도도금
    elif voltage < 7.44 and ph >= 3:
        return 2  # 박리/미부착   
    elif temp < 32.46 and ph <= 1:
        return 3  # 얼룩/부식

    else:
        return 0  # 정상
