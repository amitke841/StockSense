import os
import mysql.connector


def get_db_connection():
    return mysql.connector.connect(
        host=os.environ["NF_STOCKSENSEDATABASE_HOST"],
        user=os.environ["NF_STOCKSENSEDATABASE_USERNAME"],
        password=os.environ["NF_STOCKSENSEDATABASE_PASSWORD"],
        database=os.environ["NF_STOCKSENSEDATABASE_DATABASE"],
        port=int(os.environ.get("NF_STOCKSENSEDATABASE_PORT", 3306))
    )