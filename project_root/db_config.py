from sqlalchemy import create_engine

def get_engine(db_name):
    user = "roy9194"
    password = "9194"
    host = "3.38.2.58"
    port = 3306
    url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{db_name}?charset=utf8mb4"
    return create_engine(url)
