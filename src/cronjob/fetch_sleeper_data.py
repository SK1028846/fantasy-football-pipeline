import os
import requests
from pymongo import MongoClient

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo-service:27017/tradehelper")
client = MongoClient(MONGO_URI)
db = client.nfl

# Sleeper API endpoint
BASE_URL = "https://api.sleeper.app/v1/nfl"

# Collections to populate
endpoints = {
    "players": "/players/nfl",  # All NFL players basic info
}

def fetch_data(url):
    resp = requests.get(url)
    resp.raise_for_status()
    return resp.json()

def store_data(collection_name, data):
    if not data:
        print(f"No data returned for {collection_name}.")
        return
    db[collection_name].delete_many({})
    db[collection_name].insert_many(list(data.values()))
    print(f"✅ Inserted {len(data)} records into '{collection_name}' collection.")

if __name__ == "__main__":
    for name, path in endpoints.items():
        try:
            data = fetch_data(BASE_URL + path)
            store_data(name, data)
        except requests.HTTPError as e:
            print(f"Error fetching {name}: {e}")

    print("Sleeper NFL data ingestion completed.")
