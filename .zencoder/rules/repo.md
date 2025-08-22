# Repository Index

This document summarizes the structure and key modules of the project to speed up navigation and maintenance.

## Overview
- **Type**: Full‑stack app (Node/Express server + React TypeScript client)
- **Server start**: `cd server && npm run start` (uses `server/server.js`)
- **Client start**: `cd client && npm start`
- **API base**: `/api`

## Root
- **.gitignore**: Monorepo ignores (node_modules, build, logs, .env, uploads, etc.)
- **.vscode/**: Workspace settings
- **.zencoder/**: Assistant configuration and this index
- **client/**: React front-end (TypeScript, CRA)
- **server/**: Express/Mongoose backend API

## Server (server/)
- **server.js**: Main Express app
  - Security: `helmet`, rate limiting
  - CORS origins: localhost:3000, 12000, and production URL
  - Static: `/uploads`
  - Routes mounted:
    - `/api/auth` → `routes/auth.js`
    - `/api/rooms` → `routes/rooms.js`
    - `/api/inquiries` → `routes/inquiries.js`
  - Health: `/api/health`
- **package.json**
  - Scripts: `start` (node), `dev` (nodemon)
  - Deps: express, mongoose, jsonwebtoken, multer, etc.
- **config/**
  - `database.js`: Connects to MongoDB via `MONGODB_URI` or local default
- **controllers/**
  - `authController.js`: Auth endpoints (login/register/etc.)
  - `roomController.js`: CRUD for rooms + owner rooms
  - `inquiryController.js`: Inquiries handling
- **middleware/**
  - `auth.js`: Auth + `ownerOnly`
  - `upload.js`: Multer configuration
- **models/**
  - `User.js`, `Room.js`, `Inquiry.js`: Mongoose schemas
- **routes/**
  - `auth.js`, `rooms.js`, `inquiries.js`: Route definitions and validation
- **scripts/**
  - `addSampleData.js`: Optional seed script

### Server configuration
- **Env**: `MONGODB_URI`, `PORT` (defaults to 12001)
- **Uploads**: `server/uploads/` (ignored by VCS)

## Client (client/)
- **package.json**
  - Scripts: `start`, `build`, `test`, `eject`
  - Deps: React 19, MUI, axios, react-router-dom
- **src/**
  - `index.tsx`: App bootstrap
  - `App.tsx`: Router + MUI theme + AuthProvider; routes:
    - `/` → `pages/SimpleHome.tsx`
    - `/login` → `pages/auth/Login.tsx`
    - `/register` → `pages/auth/Register.tsx`
    - `/rooms/:id` → `pages/rooms/SimpleRoomDetail.tsx`
  - `components/`
    - `Layout/` → `Layout.tsx`, `Header.tsx`
  - `contexts/`
    - `AuthContext.tsx`
  - `pages/`
    - `SimpleHome.tsx`, `Home.tsx`
    - `rooms/` → `RoomDetail.tsx`, `SimpleRoomDetail.tsx`
    - `auth/` → `Login.tsx`, `Register.tsx`
  - `services/` → `api.ts` (axios instance)
  - `types/` → shared TypeScript types
  - Styles: `App.css`, etc.
  - CRA files: `react-app-env.d.ts`, `reportWebVitals.ts`

## Development
- **Start server**: `cd server && npm i && npm run dev`
- **Start client**: `cd client && npm i && npm start`
- **Seeding**: `node server/scripts/addSampleData.js` (optional)

## Notes
- `.env` files are ignored and should be created locally in `server/.env` and `client/.env` as needed.
- Logs and generated uploads are ignored by VCS.