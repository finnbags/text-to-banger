# Memecoin Launch Foundry

This project started as **text-to-banger** and now powers a viral memecoin generator driven by our custom fine-tuned OpenAI model. The Flask API turns chaotic prompts into structured coin briefs, while the React front-end streams each brief in a newsroom-style feed that you can monitor from your phone.

## What you get
- **Custom model endpoint (`/generate-memecoin`)** – Returns name, ticker, lore, utility bullets, virality hooks, and a fast launch plan in JSON.
- **React live feed** – Input vibes manually, remix prompts, or let the "auto-drip" mode continuously mint fresh coins for inspiration.
- **Phone-ready preview** – One command tunnels your local dev server so you can monitor the feed on mobile while you move around.

## Prerequisites
- Python 3.10+
- Node 18+
- OpenAI API access (or another drop-in provider that implements `openai.ChatCompletion.create`)

## Run the API server
```bash
cd api
python -m venv env
source env/bin/activate  # Windows: env\Scripts\activate
pip install -r requirements.txt
```

Create `api/.env` with your keys:
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL_NAME=ft:gpt-3.5-turbo-0125:personal:text-to-banger-v3:A4eTX8TJ
PORT=8080
```
Then start the server:
```bash
python server.py
```
Endpoints:
- `POST /generate-memecoin` (new) – Body `{ idea, tone, utility }` (all strings). Returns `{ "memecoin": { ... } }`.
- `POST /generate-banger` (legacy) – Accepts `{ "originalText": "..." }` for backwards compatibility.

## Run the web app
```bash
cd webapp
npm install
npm start
```
The app expects the API at `http://localhost:8080`. Override with `REACT_APP_API_URL` if you deploy the server elsewhere.

### Watch the feed from your phone
1. Keep `npm start` running.
2. In another terminal (still inside `webapp`) run:
   ```bash
   npm run mobile-preview
   ```
   This launches [localtunnel](https://github.com/localtunnel/localtunnel) and prints a public `https://*.loca.lt` URL.
3. Open that URL on your phone to see live React updates that mirror your dev machine.

> `npm run mobile-preview` only proxies the front-end. Ensure your phone can reach the API host (either through the tunnel or by exposing the API similarly) if it’s not publicly available.

## Model + data scripts
The `model/` directory still contains the data prep and fine-tuning utilities that produced the current model. Run them if you want to refresh training data or move to a different base checkpoint.

## Deployment notes
- Keep the API key private; the repo never writes it to disk outside `.env`.
- For production web hosting, point the app at a deployed API via `REACT_APP_API_URL` before building (`npm run build`).
- The `/generate-memecoin` endpoint enforces JSON output from the model and normalizes the shape so the UI never breaks, even if the model responds loosely.
