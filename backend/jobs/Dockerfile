FROM python:3.11-slim

WORKDIR /app

COPY ../requirements.txt .
RUN pip install -r requirements.txt

# העתק את כל הקוד של backend
COPY ../.. .

# הוסף backend ל-PYTHONPATH
ENV PYTHONPATH=/app/backend

# הפקודה שתופעל
CMD ["python", "backend/jobs/update_sentiments.py"]
