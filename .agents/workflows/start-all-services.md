---
description: How to start all FormworkIQ services (Python engine, Node.js backend, React frontend, MongoDB)
---

# FormworkIQ — Full Stack Startup Workflow

## Prerequisites
- Python 3.10+ installed
- Node.js 18+ installed
- MongoDB installed locally OR MongoDB Atlas URI in `server/.env`
- All dependencies installed (see Step 0)

---

## Step 0 — Install dependencies (first time only)

Install Python engine deps:
```powershell
cd "d:\L&t_project\engine"
pip install -r requirements.txt
```

Install Node.js server deps:
```powershell
cd "d:\L&t_project\server"
npm install
```

Install React client deps:
```powershell
cd "d:\L&t_project\client"
npm install
```

---

## Step 1 — Start MongoDB

**Option A: Local MongoDB (if installed)**
```powershell
mongod
```
Or start via Windows Services: press `Win+R` → type `services.msc` → find "MongoDB Server" → Start

**Option B: MongoDB Atlas (Cloud — no install needed)**
Make sure `MONGO_URI` in `d:\L&t_project\server\.env` contains your Atlas connection string.

---

## Step 2 — Start Python Optimization Engine

> Open a new terminal window

```powershell
cd "d:\L&t_project\engine"
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ Ready when you see:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## Step 3 — Start Node.js Backend

> Open a new terminal window

```powershell
cd "d:\L&t_project\server"
node index.js
```

✅ Ready when you see:
```
✅ MongoDB connected
🚀 Node.js server running on http://localhost:5000
```

---

## Step 4 — Start React Frontend

> Open a new terminal window

```powershell
cd "d:\L&t_project\client"
npm run dev
```

✅ Ready when you see:
```
VITE ready in xxx ms
➜  Local: http://localhost:5173/
```

---

## Step 5 — Open in Browser

Navigate to: **http://localhost:5173**

### Full Test Flow:
1. Go to `/upload` → click **"Load Mock Data"** → click **"Run Optimization"**
2. Go to `/dashboard` → see animated KPI cards
3. Go to `/boq` → see panel savings chart
4. Go to `/kitting` → see daily picking lists
5. Go to `/scan` → simulate QR scan
6. Go to `/alerts` → see auto-generated alerts

---

## Troubleshooting

| Error | Fix |
|---|---|
| `connect ECONNREFUSED ::1:8000` | Start uvicorn with `--host 0.0.0.0` (Step 2) |
| `connect ECONNREFUSED ::1:27017` | MongoDB not running — do Step 1 |
| `vite: command not found` | Use `npm run dev` (uses `node node_modules/vite/bin/vite.js` internally) |
| `Optimization engine unavailable` | Python engine not running — do Step 2 |

---

## Service URLs Summary

| Service | URL |
|---|---|
| React Frontend | http://localhost:5173 |
| Node.js Backend | http://localhost:5000 |
| Python Engine | http://localhost:8000 |
| Python API Docs | http://localhost:8000/docs |
| MongoDB | mongodb://localhost:27017 |
