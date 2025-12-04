#Originally submitted by Michael Davis

FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY fetch_sleeper_data.py .
CMD ["python", "fetch_sleeper_data.py"]
