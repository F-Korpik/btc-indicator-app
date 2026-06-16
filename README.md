# BTC Price Analysis Tool

Interactive Bitcoin price chart with moving averages and Golden/Death Cross detection, built with FastAPI and D3.js.

![BTC Chart](docs/screenshot.png)
<!-- Replace with an actual screenshot of your chart -->

---

## Features

- **Live BTC price data** — automatically fetches and updates price history from CoinGecko API
- **Moving averages** — 30-day and 200-day rolling averages plotted alongside price
- **Golden Cross / Death Cross detection** — automatically identifies and marks MA crossings on the chart
- **Interactive chart** — hover tooltip with exact price and date, D3-powered range slider for zooming into any time period
- **Lagging MA simulation** — toggle to shift moving averages and visualize their predictive vs. lagging behavior

---

## Tech Stack

**Backend:** Python · FastAPI · Pandas · NumPy  
**Frontend:** D3.js · HTML/CSS · Jinja2  
**Data:** CoinGecko API · JSON

---

## Project Structure

```
app/
├── analysis/
│   └── timeline_analysis.py   # Moving averages, crossing detection
├── data/
│   ├── btc_price_history.json
│   ├── rm_200_data.json
│   ├── rm_30_data.json
│   └── update_price_info.py   # CoinGecko API fetcher
├── static/
│   └── main_chart.js          # D3.js chart logic
├── templates/
│   └── chart.html
└── main.py                    # FastAPI app
```

---

## Getting Started

```bash
git clone https://github.com/F-Korpik/btc-indicator-api
cd btc-indicator-api

python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # macOS/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

---

## How It Works

1. On startup, the app fetches the latest BTC prices from CoinGecko and appends any missing days to the local JSON history
2. 30-day and 200-day moving averages are computed using Pandas rolling windows
3. The backend detects Golden Cross (RM30 crosses above RM200) and Death Cross (RM30 crosses below RM200) events
4. All data is passed to the Jinja2 template and rendered as an interactive D3.js chart

---

