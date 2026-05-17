# BTC Indicator API

A FastAPI service that fetches current and historical Bitcoin data and calculates basic indicators like 7-day EMA and 14-day RSI.

## Features

- Fetches BTC price from public API
- Saves data to SQLite via SQLAlchemy

## Setup

```bash

python -m venv .venv 
.venv\Scripts\Activate.ps1   // in backend-task-portfolio
pip install -r requirements.txt // in btc-indicator-api
uvicorn app.main:app --reload

