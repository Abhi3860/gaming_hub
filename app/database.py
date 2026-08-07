from sqlmodel import create_engine, Session
import psycopg
from psycopg.rows import dict_row
import time
from .config import settings
import os


SQLALCHEMY_DATABASE_URL = f"postgresql://{settings.database_username}:{settings.database_password}@{settings.database_hostname}:{settings.database_port}/{settings.database_name}"
#DATABASE_URL = settings.database_url
engine = create_engine(SQLALCHEMY_DATABASE_URL)




#dependency
def get_db():
    with Session(engine) as session:
        yield session

#while True:
    # try:
    #    conn = psycopg.connect(host='localhost', dbname='fastapi', user='postgres', password='Hellrider3860', row_factory=dict_row)   
    #    cursor =conn.cursor()
    #   print("database connection successful")
    #   break
    #except Exception as error:
    #    print("database connection failed")
    #    print("Error:", error)
    #    time.sleep(2)