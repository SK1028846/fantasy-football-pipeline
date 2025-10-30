import os
import requests
from pymongo import MongoClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongodb:27017/nfl")
NFL_API_KEY = os.getenv("NFL_API_KEY")
HEADERS = {"Ocp-Apim-Subscription-Key": NFL_API_KEY}
BASE_URL = "https://api.sportsdata.io/api/nfl"

def fetch_data(endpoint):
    """Fetch data from the given API endpoint."""
    url = f"{BASE_URL}{endpoint}"
    resp = requests.get(url, headers=HEADERS)
    resp.raise_for_status()
    return resp.json()

def store_data(collection_name, data, db):
    """Store fetched data into a MongoDB collection."""
    if not data:
        print(f"No data returned for {collection_name}.")
        return
    db[collection_name].delete_many({})
    db[collection_name].insert_many(data)
    print(f"✅ Inserted {len(data)} records into '{collection_name}' collection.")

if __name__ == "__main__":
    client = MongoClient(MONGO_URI)
    db = client.nfl

    # endpoints to ingest
    endpoints = {
        "teams": "/fantasy/json/Teams",
        "fantasy_players": "/fantasy/json/FantasyPlayers",
    }


    for name, path in endpoints.items():
        try:
            data = fetch_data(path)
            store_data(name, data, db)
        except requests.HTTPError as e:
            print(f"Error fetching {name}: {e}")

    print("NFL data ingestion completed.")
