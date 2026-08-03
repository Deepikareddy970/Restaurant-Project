# Guramrit Resto & Cafe - Backend API Server

This is the real Node.js + Express backend service for Guramrit Resto & Cafe. It provides endpoints for fetching the menu data, validating and saving table reservations persistently with anti-spam protections.

## Project Structure
- `data/menu.json`: The database of menu categories and dish items.
- `data/bookings.json`: Persistent file storage for reservation records.
- `public/admin.html`: The web dashboard for the restaurant owner to monitor bookings.

---

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in this directory (or copy `.env.example`):
   ```bash
   PORT=5000
   ADMIN_SECRET=GuramritAdmin2026
   CORS_ORIGIN=http://localhost:3000
   ```

---

## Running the Server

- **Development Mode** (Runs on Node):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

Once running, the backend is active at `http://localhost:5000`.

---

## API Endpoints

### 1. GET `/api/menu`
Serves the full menu data as structured JSON.
- **Response**: Array of categories containing items with pricing, category labels, veg/non-veg indicator types, and image placeholders.

### 2. POST `/api/bookings`
Validates, sanitizes, and creates a reservation.
- **Rate-limiting**: Up to 5 bookings per 10 minutes from a single IP to prevent spam.
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9876543210",
    "date": "2026-08-15",
    "time": "08:30 PM",
    "partySize": 4,
    "occasion": "anniversary",
    "seating": "Main Dining Room (Climate Control)",
    "notes": "Wheelchair access requested"
  }
  ```
- **Response**: Confirmations indicating booking status, unique booking ID (e.g. `GR-20260815-E4FA`), and text summary.

### 3. GET `/api/bookings`
Fetches a list of all table reservations.
- **Authorization**: Requires passing the admin secret token in the query params (e.g. `?key=GuramritAdmin2026`) or as the request header `x-admin-key`.
- **Response**: Array of reservations ordered by date and time.

---

## Owner Admin Portal
Open `http://localhost:5000/admin` in your web browser. You will be prompted to enter the secret token (`ADMIN_SECRET` from `.env`). Once entered, you can see all bookings in real time, view summaries, total guest counters, and filter details.
