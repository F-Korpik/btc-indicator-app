import requests
import json
from datetime import datetime, timedelta, date
from collections import OrderedDict


def update_price_info(url, currency: str = "usd", btc_price_history: str = "app/data/btc_price_history.json") -> None:
    now = date.today()

    with open(btc_price_history, "r") as history:
        data = json.load(history)

    last_data = datetime.strptime(data[0][0], "%Y-%m-%d").date()

    print(f"LAST: {last_data}, NOW: {now}")

    if now != last_data:
        params = {
            "vs_currency": currency,
            "from": int(datetime.combine(last_data + timedelta(days=2), datetime.min.time()).timestamp()),
            "to": int(datetime.combine(now + timedelta(days=1), datetime.min.time()).timestamp()),
        }

        response = requests.get(url, params=params)
        if response.status_code != 200: raise RuntimeError(f"❌ Błąd pobierania danych: {response.status_code} {response.text}")

        raw_prices = response.json()["prices"]

        filtered = OrderedDict()
        for ts_ms, price in raw_prices:
            date_str = datetime.utcfromtimestamp(ts_ms / 1000).date().isoformat()
            if date_str not in filtered:
                filtered[date_str]= str(int(price))

        new_data = [[date, price] for date, price in filtered.items()]

        new_data.reverse()

        data = new_data + data


        with open(btc_price_history, "w") as f:
            json.dump(data, f, indent=2)

        print(f"✅ Dane z zapisane do: {btc_price_history}")

    else: print(f"✅ Dane są aktualne")




