
https://github.com/user-attachments/assets/0e59edfe-1a5d-4ea8-a48f-08fb4aa1b3ae
# 🏗️ FormworkIQ

> **AI-powered Formwork Kitting & BoQ Optimization Platform**  
> Built for **L&T CreaTech 2026** — Problem Statement 4

FormworkIQ is a full-stack, data-driven system that automates formwork kitting, optimizes Bill of Quantities (BoQ) planning, and maximizes panel reuse to reduce inventory and overall project costs.

---

## 🚀 Features

- **Algorithmic Optimization Engine** — Chronological sort + 2D Bin Packing + Repetition Matcher (Python)
- **BoQ Optimizer** — Flattens demand curves to minimize buffer stock and over-ordering
- **Daily Kitting Scheduler** — Auto-generates panel dispatch plans for yard supervisors
- **Inventory Tracker** — Real-time panel health tracking with QR code scanning support
- **Smart Alerts** — Auto-triggers BoQ adjustments when panels are damaged or scrapped
- **BIM & Primavera Integration** — Ingests structural and scheduling data via JSON

---

## 🏛️ Architecture

```
FormWorkIQ_/
├── client/          # React + Vite frontend
├── server/          # Node.js + Express API (MongoDB)
└── engine/          # Python FastAPI optimization engine
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Recharts |
| Backend | Node.js, Express, MongoDB Atlas |
| AI Engine | Python, FastAPI, NumPy, SciPy |
| Database | MongoDB Atlas |

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas URI

### 1. Clone the repo
```bash
git clone https://github.com/Anantgitu/FormWorkIQ_.git
cd FormWorkIQ_
```

### 2. Configure environment

Create `server/.env`:
```
MONGO_URI=your_mongodb_atlas_uri
PORT=5000
```

### 3. Start all services

**Python Engine** (port 8000)
```bash
cd engine
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

**Node.js Backend** (port 5000)
```bash
cd server
npm install
node index.js
```

**React Frontend** (port 5173)
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 📊 Demo Results

| Metric | Value |
|---|---|
| Panels eliminated via reuse | 71 panels |
| Inventory reduction | 62% |
| Cost savings (single batch) | ₹1.7 Lakhs |
| Reuse connections ident



ified | 12 |

---

## 👥 Team

Built with ❤️ for **L&T CreaTech 2026**

This is video of the prototype

https://github.com/user-attachments/assets/91c86ca6-da1e-49fe-8fdd-72f6991b48b9

This is ppt
[ppt_creaTech.pdf](https://github.com/user-attachments/files/25664679/ppt_creaTech.pdf)

