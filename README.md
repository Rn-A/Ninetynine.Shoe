# Ninetynine Shoe

Website layanan cuci sepatu premium — pemesanan online, lacak resi, panel admin, dan CMS (testimoni & showcase).

## Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Express 5, Sequelize, MySQL
- **Auth:** JWT + bcrypt

## Prasyarat

- Node.js 20+
- MySQL (XAMPP / Laragon / MySQL Server)

## Setup

### 1. Database

Buat database dan tabel (opsional — Sequelize `sync()` juga bisa membuat tabel):

```bash
mysql -u root -p < database.sql
```

Atau import `database.sql` lewat phpMyAdmin.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: DB_*, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run dev
```

Jika `npm install` gagal dengan error sertifikat SSL (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`), di PowerShell:

```powershell
$env:NODE_OPTIONS="--use-system-ca"
npm install
```

API berjalan di **http://localhost:5000**

Akun admin pertama dibuat otomatis jika belum ada (lihat `ADMIN_EMAIL` / `ADMIN_PASSWORD` di `.env`).

**Login admin:** gunakan email admin (bukan username `admin` lama). Password default dari `.env`: `ChangeMe123!` — ganti segera.

Jika database lama masih menyimpan password plain text, login pertama dengan password yang benar akan otomatis di-hash.

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Buka **http://localhost:3000**

Request `/api/*` di-proxy ke backend (lihat `frontend/next.config.ts`).

## Endpoint API (ringkas)

| Method | Path | Akses |
|--------|------|--------|
| POST | `/api/login`, `/api/register` | Public |
| GET | `/api/services`, `/api/testimonials`, `/api/showcase` | Public |
| GET | `/api/orders/:id` | Public (lacak resi) |
| GET | `/api/orders?userId=` | User login (token) |
| GET | `/api/admin/orders` | Admin |
| POST | `/api/orders` | User login |
| POST/PUT/DELETE | services, orders, CMS, upload | Admin |

Header auth: `Authorization: Bearer <token>`

## Struktur

```
backend/          # API Express
frontend/         # Next.js app
  src/components/pages/   # Halaman UI
  src/context/            # State global
  src/lib/api.ts          # Helper fetch + URL upload
database.sql
```

## Produksi

- Ganti `JWT_SECRET` dengan string acak panjang
- Ganti `ADMIN_PASSWORD` sebelum deploy
- Set `NEXT_PUBLIC_API_URL` ke URL backend production
- Gunakan HTTPS
