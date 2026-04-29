# mini-aap

A config-driven web application generator built with a React + Vite frontend and a Node.js + Express backend. The system is designed for real-world product readiness with dynamic UI rendering, JWT authentication, CSV import, localization, and event notifications.

## Setup

### Backend
1. Open `Backend/`.
2. Copy `.env.example` to `.env` and fill in your values.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend
1. Open `Frontend/`.
2. Copy `.env.example` to `.env` and verify `VITE_API_BASE_URL` points to the backend API.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the frontend app:
   ```bash
   npm run dev
   ```

## Features

- Config-driven pages and API engine
- Email/password authentication with JWT + refresh token cookies
- Dynamic task management page with create/edit/delete
- CSV import preview, validation, and bulk insertion
- English and Hindi translation support
- Notification center with MongoDB-backed history
- Responsive sidebar layout and polished Tailwind design

## Folder structure

- `Backend/` contains the Express server, Mongoose models, dynamic config engine, and API routes.
- `Frontend/` contains the React/Vite app, dynamic renderer, state management, and localization.
