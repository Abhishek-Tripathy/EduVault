# EduVault 🎓

EduVault is a modern, high-performance, full-stack educational platform designed to connect **Academies** and **Students**. It allows educational institutions to securely upload and publish PDF resources, and enables students to quickly search, preview, and download them. 

The application was built from the ground up focusing on **speed, edge-computing, security, and a premium modern UI**.

![EduVault Platform Overview](#) <!-- Add a screenshot of the landing page here -->

---

## 🚀 Live Demo
*(Insert your Vercel/Render deployment link here)*

## 🛠️ Tech Stack & Architecture

This project strictly adheres to a modern Next.js/React architecture, moving beyond the traditional MERN stack to leverage serverless databases and edge computing for superior performance.

**Frontend:**
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Components)
- **UI Library:** [React 19](https://react.dev/)
- **Styling:** Vanilla **Tailwind CSS** (Custom CSS variable-driven Design System)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Forms & Validation:** `react-hook-form` + `zod`
- **Icons:** `lucide-react`
- **Theming:** `next-themes` (Seamless Light/Dark mode)

**Backend & Database:**
- **Database:** [Neon Postgres](https://neon.tech/) (Serverless SQL)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Caching:** [Upstash Redis](https://upstash.com/) (for ultra-fast PDF search queries)
- **File Storage:** [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (Secure PDF storage)
- **Authentication:** Custom JWT generation (`jose`) & Password Hashing (`bcryptjs`) via Edge-compatible API routes.

---

## ✨ Core Features

### 1. Robust Authentication & Role-Based Access Control
- Custom credential-based authentication system using HttpOnly cookies to store stateless JSON Web Tokens (JWTs).
- **Two User Roles:** 
  - `ACADEMY`: Can upload resources and manage their published files.
  - `STUDENT`: Can search, preview, and download resources asynchronously.

### 2. High-Performance Search & Caching
- The platform uses **Upstash Redis** to cache PDF search results. 
- When a student searches for a specific subject, class, or school, the system first checks the Redis cache (returning results in ms). If it's a cache miss, it queries the Neon Postgres database and caches the result for future users.

### 3. File Upload & Processing
- Academies can upload heavy PDF documents directly to **Vercel Blob storage**. 
- The metadata (subject name, class name, uploader ID, file URL) is stored relationally in Postgres via Drizzle ORM.

### 4. In-App PDF Preview & Download
- Secure in-browser PDF previewing using isolated `iframes`.
- Files are protected via internal application logic and optimized for quick rendering without requiring users to leave the platform.
- Forced direct-download capabilities built into the Student Dashboard.

### 5. Premium UI/UX
- Detailed **Framer Motion** physics-based animations (springs, orchestrations).
- Highly accessible, high-contrast custom **Light & Dark modes**.
- Global smooth loading screens (`<Loader />`) to mask API calls and route transitions, completely eliminating UI flashing.

---

## 💻 Running Locally

### Prerequisites
- Node.js (v18+)
- Postgres database URL (e.g., Neon Tech)
- Redis URL and Token (e.g., Upstash)
- Vercel Blob Token

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/EduVault.git
   cd eduvault
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add the following keys:
   ```env
   DATABASE_URL="postgresql://user:password@endpoint.neon.tech/dbname?sslmode=require"
   JWT_SECRET="your_super_secret_jwt_key_here"
   
   UPSTASH_REDIS_REST_URL="https://your-upstash-url.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="your_upstash_token"
   
   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_token_here"
   ```

4. **Initialize the Database:**
   Push the Drizzle schema directly to your Postgres database:
   ```bash
   npm run db:push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧠 Technical Decisions & Tradeoffs

- **Why Postgres over MongoDB?** 
  While MERN is traditional, relational databases (SQL) like Postgres provide stronger guarantees for structured data (like Users relating to PDFs). Drizzle ORM + Serverless Postgres represents the modern edge-computing standard in the React ecosystem.
- **Why Redis?** 
  Educational databases scale largely based on reads (students searching for materials). Caching database read queries in Redis significantly reduces load on the primary Postgres database and guarantees instantaneous UI feedback for the end user.
- **Why Custom JWT over NextAuth?** 
  To demonstrate a deep understanding of stateless authentication flows, cryptography (hashing/verifying), and cookie management from scratch, rather than relying on a black-box authentication library.

---
*Developed as an evaluation project for Full Stack Engineering.*
