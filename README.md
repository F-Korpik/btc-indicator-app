# backend-tasks-portfolio

This repository contains programming tasks, exercises and small projects
Each folder contains a self-contained task with its own `README`, code, and (when relevant) tests.

## Contents

- `btc-indicator-api/` – FastAPI app fetching BTC data and calculating EMA/RSI
- `data-cleaning-task/` – Pandas task for processing messy CSV data


python# BTC Indicator API

A FastAPI service that fetches current and historical Bitcoin data and calculates basic indicators like 7-day EMA and 14-day RSI.

## Features

- Fetches BTC price from public API
- Saves data to SQLite via SQLAlchemy
- Exposes `/btc/indicators` endpoint with:
    - Current price
    - 7-day average
    - 7-day EMA
    - 14-day RSI

## Setup

```bash

python -m venv .venv 
.venv\Scripts\Activate.ps1   // in backend-task-portfolio
pip install -r requirements.txt // in btc-indicator-api
uvicorn app.main:app --reload

