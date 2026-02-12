from datetime import date, datetime
from gradio_client import Client
from dbConnection import get_db_connection
import os
from dotenv import load_dotenv

load_dotenv()

def train_or_predict(symbol: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # 1. Check symbol state
    cursor.execute(
        """
        SELECT symbol, last_trained, prediction
        FROM Symbols
        WHERE symbol = %s
        """,
        (symbol,)
    )
    row = cursor.fetchone()

    # ✅ If already predicted today, return stored prediction immediately
    if (
        row is not None
        and row["prediction"] is not None
        and row["last_trained"] is not None
        and row["last_trained"].date() == date.today()
    ):
        prediction_value = float(row["prediction"])
        cursor.close()
        conn.close()
        return prediction_value

    # 2. Decide if training is needed
    needs_training = False

    if row is None:
        needs_training = True
    else:
        if row["prediction"] is None:
            needs_training = True
        elif row["last_trained"] is None:
            needs_training = True
        elif row["last_trained"].date() != date.today():
            needs_training = True

    # 3. Train if needed
    if needs_training:
        print("Training is NEEDED")
        client = Client("MLSpeech/StockSenseSpace", token=os.getenv("HF_TOKEN"))
        client.predict(
            symbol=symbol,
            api_name="/train",
            start=None,
            end=None
        )

        now = datetime.now()

        if row is None:
            cursor.execute(
                """
                INSERT INTO Symbols (symbol, last_trained, prediction)
                VALUES (%s, %s, NULL)
                """,
                (symbol, now)
            )
        else:
            cursor.execute(
                """
                UPDATE Symbols
                SET last_trained = %s
                WHERE symbol = %s
                """,
                (now, symbol)
            )

        conn.commit()

    # 4. Predict (only if we didn't already have today's prediction)
    print("PREDICTING...")
    client = Client("MLSpeech/StockSenseSpace", token=os.getenv("HF_TOKEN"))
    prediction_result = client.predict(
        symbol=symbol,
        days=1,
        api_name="/predict"
    )

    prediction_value = float(prediction_result["predictions"][0])

    cursor.execute(
        """
        UPDATE Symbols
        SET prediction = %s
        WHERE symbol = %s
        """,
        (prediction_value, symbol)
    )

    conn.commit()

    cursor.close()
    conn.close()

    return prediction_value
