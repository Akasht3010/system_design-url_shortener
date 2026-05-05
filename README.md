# URL Shortener 🚀

A production-ready URL shortener built with scalable system design principles.

## 🔥 Features

- Shorten long URLs
- Redirect using short codes
- Redis caching for fast lookup
- Redis-based rate limiting
- Click analytics tracking
- Background job processing (BullMQ)
- Duplicate URL detection

## 🛠 Tech Stack

- Node.js (Express)
- PostgreSQL (Prisma ORM)
- Redis (cache + rate limit)
- BullMQ (queue system)

## 📌 API Endpoints

### Create short URL
POST /shorten

### Redirect
GET /:code

### Analytics
GET /analytics/:code

## 🧠 Architecture

Client → Express → Redis (cache + rate limit) → PostgreSQL → Queue → Analytics

## 🚀 How to run locally

1. Install dependencies

npm install

2. Setup `.env`

DATABASE_URL=your_postgres_url


3. Run server

npx nodemon src/index.js

---

## 👨‍💻 Author

Akash Thakkar