# 🛒 POS System — ระบบจัดการร้านค้า

A full-stack Point of Sale system built with **Next.js 14**, **Express.js**, **Drizzle ORM**, and **PostgreSQL**.

---

## 🧱 Tech Stack

| Layer        | Technology                               |
|--------------|------------------------------------------|
| Frontend     | Next.js 14 (App Router), Tailwind CSS    |
| Backend      | Express.js + TypeScript                  |
| ORM          | Drizzle ORM                              |
| Database     | PostgreSQL 16                            |
| Auth         | JWT stored in HTTP-only cookies          |
| UI Library   | Tailwind CSS (custom dark design system) |

---

## 📁 Project Structure

```
pos-system/
├── frontend/          # Next.js 14 App
│   ├── app/
│   │   ├── (auth)/login/       # Login page
│   │   └── (dashboard)/        # Protected pages
│   │       ├── page.tsx        # Dashboard
│   │       ├── quotations/     # ใบเสนอราคา
│   │       ├── voi/            # ใบส่งของ
│   │       ├── receipts/       # ใบเสร็จรับเงิน
│   │       ├── customers/      # ลูกค้า
│   │       ├── products/       # สินค้า
│   │       └── users/          # จัดการผู้ใช้ (Owner only)
│   ├── components/
│   │   ├── layout/             # Sidebar, Header
│   │   ├── documents/          # DocumentForm, DocumentList
│   │   └── dashboard/          # StatCard, RecentDocuments
│   ├── hooks/useAuth.ts        # Auth hook
│   └── lib/
│       ├── api.ts              # Axios with interceptors
│       └── utils.ts            # Formatters, helpers
│
├── backend/           # Express.js API
│   ├── src/
│   │   ├── index.ts            # Entry point
│   │   ├── db/
│   │   │   ├── schema.ts       # Drizzle schema
│   │   │   ├── index.ts        # DB connection
│   │   │   ├── migrate.ts      # Migration runner
│   │   │   └── seed.ts         # Mock data seeder
│   │   ├── routes/             # REST API routes
│   │   ├── middleware/         # Auth + Role guard
│   │   └── utils/jwt.ts
│   └── drizzle.config.ts
│
└── docker-compose.yml # PostgreSQL container
```

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- pnpm, npm, or yarn

---

### Step 1: Clone & Install

```bash
# Clone the repo
git clone <your-repo-url>
cd pos-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 2: Environment Files

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://pos_user:pos_password@localhost:5432/pos_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

### Step 3: Start PostgreSQL

```bash
# From root of pos-system/
docker-compose up -d

# Verify it's running
docker-compose ps
```

---

### Step 4: Run Migrations

```bash
cd backend

# Generate migration files (first time)
npm run db:generate

# Push schema to database
npm run db:push
```

> **Alternative**: Use `npm run db:push` to push schema directly without migration files.

---

### Step 5: Seed Mock Data

```bash
cd backend
npm run db:seed
```

This creates:
- **1 Owner** user (username: `owner`, password: `owner123`)
- **1 Admin** user (username: `admin`, password: `admin123`)
- **5 Thai customers** (company names)
- **10 Products** (computer equipment with Thai names)
- **5 Documents** (2 quotations, 1 VOI, 2 receipts)

---

### Step 6: Start Backend

```bash
cd backend
npm run dev
# API runs at http://localhost:3001
```

---

### Step 7: Start Frontend

```bash
cd frontend
npm run dev
# App runs at http://localhost:3000
```

---

## 🔑 Login Credentials

| Role  | Username | Password |
|-------|----------|----------|
| Owner | `owner`  | `owner123` |
| Admin | `admin`  | `admin123` |

---

## 🎯 Features

### Authentication
- Login/logout with JWT in HTTP-only cookies
- Auto-redirect to login on 401
- Protected routes via middleware

### Role-Based Access
| Feature                | Owner | Admin |
|------------------------|-------|-------|
| View documents         | ✅    | ✅    |
| Create/Edit documents  | ✅    | ✅    |
| Delete documents       | ✅    | ✅    |
| Manage customers       | ✅    | ✅    |
| Manage products        | ✅    | ✅    |
| **User management**    | ✅    | ❌    |

### Document Management
- **ใบเสนอราคา** (Quotation) — with Convert to Receipt button
- **ใบส่งของ** (Delivery Order/VOI)
- **ใบเสร็จรับเงิน** (Receipt)
- Auto-calculate subtotal + VAT 7% + total
- Status tracking: draft → confirmed → converted/cancelled
- Search and filter by status

### Dashboard
- Revenue stat card (confirmed receipts only)
- Document count cards
- Quick action buttons
- Recent documents table

---

## 📡 API Reference

```
POST   /api/auth/login          Login
POST   /api/auth/logout         Logout  
GET    /api/auth/me             Current user

GET    /api/users               List users (Owner only)
POST   /api/users/invite        Create user (Owner only)
PATCH  /api/users/:id/role      Change role (Owner only)

GET    /api/customers           List customers
POST   /api/customers           Create customer
PATCH  /api/customers/:id       Update customer
DELETE /api/customers/:id       Delete customer

GET    /api/products            List products
POST   /api/products            Create product
PATCH  /api/products/:id        Update product
DELETE /api/products/:id        Delete product

GET    /api/documents           List documents (filter: type, status, search)
GET    /api/documents/:id       Get document
POST   /api/documents           Create document
PATCH  /api/documents/:id       Update document
DELETE /api/documents/:id       Delete document
POST   /api/documents/:id/convert  Convert quotation to receipt
GET    /api/documents/stats/summary  Dashboard stats
```

---

## 🗄️ Database Schema

```
users       → id, username, password_hash, full_name, role, created_at
customers   → id, name, phone, email, created_at
products    → id, name, sku, price, stock, created_at
documents   → id, doc_number, doc_type, customer_id, customer_name, 
              items (JSONB), subtotal, tax, total, status, notes,
              converted_from, created_by, created_at
```

---

## 🛠️ Development Commands

```bash
# Backend
npm run dev          # Start with hot reload
npm run db:push      # Push schema to DB
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
npm run db:seed      # Seed mock data
npm run db:studio    # Open Drizzle Studio (DB browser)

# Frontend  
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Lint check
```

---

## 🐳 Docker Commands

```bash
docker-compose up -d         # Start PostgreSQL
docker-compose down          # Stop
docker-compose down -v       # Stop + remove data volume
docker-compose logs postgres # View DB logs
```

---

## 🎨 Design System

The frontend uses a custom dark theme with:
- **Font**: Sarabun (Thai + Latin)
- **Color scheme**: Dark navy background (#0f172a) with blue primary
- **Components**: Custom Tailwind-based design system
- **Responsive**: Mobile-first with collapsible sidebar at lg breakpoint

---

## 📦 Production Considerations

1. Change `JWT_SECRET` to a strong random string
2. Set `NODE_ENV=production` in backend
3. Configure `secure: true` for cookies (requires HTTPS)
4. Set up proper CORS origins
5. Use environment-specific database credentials
6. Add rate limiting to API routes
7. Set up proper logging (e.g., Winston)
