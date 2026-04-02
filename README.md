# Vehicle_SelfCheckIn

## Overview

This repository contains a full-stack application built with:

React (Frontend)

Node.js / Express (Backend)

Microsoft SQL Server 2022 (Database)

The project includes source code, SQL scripts, and the production React build.

## Technology Stack

| Component  | Version                                               |
| ---------- | ----------------------------------------------------- |
| Node.js    | **v20.17.0**                                          |
| React      | **18.3.1**                                            |
| SQL Server | **Microsoft SQL Server 2022 (RTM-GDR)** (16.0.1110.1) |

## Repository Structure

```bash
/ProjectRoot
│
├── backend/                 # Node.js API server
│   ├── src/
│   ├── package.json
│   └── .env.example
│
├── client/                  # React client-side code
│   ├── src/
│   ├── public/
│   └── package.json
│
├── React Bundle/            # Production React build (npm run build output)
│
└── database/                # SQL scripts, table definitions
    └── schema.sql
```

## 1. Database Setup (SQL Server 2022)

Create Database & Tables

Open SQL Server Management Studio and execute scripts from:
database/schema.sql

## 2. Backend Setup (Node.js)

Step 1 — Navigate to backend

```bash
cd backend
```

Step 2 — Install dependencies

```bash
npm install
```

Step 4 — Run backend (development)

```bash
node index.js
```

## 3. Frontend Setup (React)

Step 1 — Navigate to client

```bash
cd client
```

Step 2 — Install dependencies

```bash
   npm install
```

Step 3 — Start development server

```bash
npm run dev
```

## 6. Useful Commands Reference

Task Command
| Task | Command |
| ----------------------------- | --------------------------- |
| Install backend dependencies | `cd backend && npm install` |
| Install frontend dependencies | `cd client && npm install` |
| Run backend dev | `node index.js` |
| Run backend prod | `npm start` |
| Run frontend dev | `npm run dev` |
| Build frontend | `npm run build` |

## API Documentation

Production-ready API documentation for the backend is available in:

- [Backend/docs/API.md](Backend/docs/API.md)
- [Backend/docs/openapi.yaml](Backend/docs/openapi.yaml)

You can also import the Postman collection at [Backend/docs/postman_collection.json](Backend/docs/postman_collection.json) and use `{{baseUrl}}` to point to your running API (default `http://localhost:5000/api`).
