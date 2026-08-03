# Guramrit Resto & Cafe - Frontend Web Portal

This is the Vite-powered Single Page Application (SPA) frontend for Guramrit Resto & Cafe. It presents a premium, responsive interface featuring climate-comfort statements, dynamic menu querying, and a multi-step table reservation wizard.

## Tech Stack
- **Core**: Vanilla HTML5, ES Modules (JS).
- **Styling**: Vanilla CSS3 (Custom design system utilizing HSL color tokens).
- **Dev Server**: Vite.

---

## Directory Structure
- `index.html`: The main entry page with SEO metadata, structured schema, and sections.
- `src/main.js`: The application controller managing scroll effects, menu querying/rendering (from API), and the multi-step booking engine POST flow.
- `src/styles/`: CSS layout files:
  - `variables.css`: Design system parameters, colors, typography, sizing.
  - `global.css`: Reset, container parameters, and global typography.
  - `components.css`: Button presets, cards, form inputs, dialogs, accordions, and overlays.

---

## Local Setup & Run

1. **Install Dependencies**
   Make sure you are in the `/frontend` directory:
   ```bash
   npm install
   ```

2. **Run Dev Server**
   ```bash
   npm run dev
   ```
   By default, Vite will start the portal at `http://localhost:3000`.

---

## Features

### 1. Dynamic Menu Browser
- Query items from the API server (`http://localhost:5000/api/menu` in dev).
- **Keyword Search**: Live case-insensitive search bar filtering titles and descriptions.
- **Diet Filters**: Live selector tags to toggle between Veg, Non-Veg, Seafood, and Egg items (styled with color-coded dot badges and left border highlights).
- **Subgroup Accordions**: Chinese cuisine groups are automatically categorized into collapsible accordion headers, with others displaying serif separation banners.

### 2. Multi-Step Reservation Wizard
- **Step 1 (Details)**: Guest count, date selection (starts at today, disables past dates), and Rayagada business-hour sessions (Lunch/Dinner).
- **Step 2 (Preferences)**: Table seating options and special dietary request inputs.
- **Step 3 (Contact)**: Name, email, and phone validation.
- Submits to `POST /api/bookings` with anti-spam protections. Renders server-returned unique reservation IDs (e.g. `GR-20260815-F4E1`).
