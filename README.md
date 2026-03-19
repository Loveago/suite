# THE SUIT — Luxury Room Booking Platform

A premium, Airbnb-inspired room booking platform for a single luxury property. Built with a focus on fluid animations, elegant UI, and seamless booking flow.

## Tech Stack

**Frontend:** Next.js 16 (App Router), Tailwind CSS v4, Framer Motion, Zustand, Lucide React  
**Backend:** Node.js, Express, Prisma ORM, PostgreSQL, Multer

## Project Structure

```
/frontend   — Next.js application
/backend    — Express API server
```

## Setup Instructions

### 1. Database (PostgreSQL)

Make sure PostgreSQL is running locally. Create a database:

```sql
CREATE DATABASE thesuit;
```

Update the connection string in `backend/.env` if needed:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/thesuit?schema=public"
```

### 2. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node seed.js        # Seeds the database with sample rooms
npm run dev         # Starts on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev         # Starts on http://localhost:3000
```

## Pages

| Route | Description |
|---|---|
| `/` | Homepage — hero, booking bar, featured rooms, steps, CTA |
| `/rooms` | All rooms grid with price filters and sorting |
| `/rooms/[id]` | Room detail — image gallery, lightbox, booking card |
| `/booking` | Multi-step booking flow (dates → details → confirm) |
| `/bookings` | Guest booking search by email/ID |
| `/admin` | Admin panel — rooms CRUD, image upload, booking management |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/rooms` | List all rooms |
| GET | `/api/rooms/:id` | Get room by ID |
| POST | `/api/rooms` | Create room (admin) |
| PUT | `/api/rooms/:id` | Update room (admin) |
| DELETE | `/api/rooms/:id` | Delete room (admin) |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings` | List all bookings (admin) |
| PUT | `/api/bookings/:id` | Update booking status |
| POST | `/api/upload/room-images` | Upload room images |

## Theme

- **Primary:** Black (#0A0A0A) + Gold (#C9A646)
- **Typography:** Clean, minimal, premium serif + sans
- **Animations:** Framer Motion — page transitions, card hovers, image zoom, loading states
