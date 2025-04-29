# Blog Platform Backend API

This is a **fully functional blog platform backend** built with **Next.js 14 App Router**, **PostgreSQL**, and **Prisma ORM**. It supports a robust **authentication system** using **NextAuth** (Credentials + Google & GitHub OAuth), full CRUD operations for posts, categories, comments, and users, plus features like **pagination**, **search**, **sorting**, and **role-based access control**.

---

## ⚙️ Stack

- **Framework:** Next.js 14 (App Directory, API Routes)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js
  - Credentials (Email + Password)
  - Google OAuth
  - GitHub OAuth
- **Authorization:** Role-based (USER / ADMIN)
- **Session:** JWT (stateless auth)
- **Password Hashing:** bcrypt
- **API Access:** RESTful structure

---

## 📌 Features

- User registration (with credentials) and login
- Social login (Google & GitHub OAuth)
- Role-based authorization (admin access for managing posts/categories/users)
- Create/read/update/delete (CRUD) for:
  - Posts
  - Comments
  - Categories
  - Users (admin only)
- View posts by category
- Search posts by title or content
- Pagination for post listing
- Sorting posts by creation date
- Protected endpoints with authentication middleware
- Detailed error handling
- Developer-ready API for frontend integration

---

## 📁 Project Structure

```
/app/api/
├── auth/         → Register, login, session (NextAuth)
├── posts/        → CRUD, pagination, sorting, search
├── comments/     → Create/read comments per post
├── categories/   → CRUD for categories
├── users/        → Admin user management
/lib/
├── db.ts         → Prisma client
├── auth.ts       → NextAuth config
/middleware.ts    → Auth and role checking
```

---

## 🔐 Authentication & Authorization

### Authentication

- Users can register using **email/password**
- Users can login using:
  - Email + password
  - Google account (OAuth)
  - GitHub account (OAuth)
- Sessions are maintained via **JWT tokens**.
- Passwords are hashed using **bcrypt**.

### Authorization

| Role   | Description                     |
|--------|---------------------------------|
| USER   | Can read posts and add comments |
| ADMIN  | Can manage posts, categories, and users |

Role checking is done in protected routes using middleware.

---

## 🧪 API Endpoints

### 🔑 Auth

| Method | Route              | Description               | Auth Required |
|--------|-------------------|---------------------------|---------------|
| POST   | `/api/auth/register` | Register new user        | ❌            |
| POST   | `/api/auth/login`    | Login with credentials   | ❌            |
| GET    | `/api/auth/session`  | Get user session info    | ✅            |

---

### 📬 Posts

| Method | Route            | Description                          | Auth | Role   |
|--------|------------------|--------------------------------------|------|--------|
| GET    | `/api/posts`     | Get posts with pagination, filters   | ❌   | -      |
| POST   | `/api/posts`     | Create new post                      | ✅   | ADMIN  |
| PATCH  | `/api/posts/:id` | Update a post                        | ✅   | ADMIN  |
| DELETE | `/api/posts/:id` | Delete a post                        | ✅   | ADMIN  |

**Query Parameters**:
- `category`: filter by category slug
- `q`: full-text search (title/content)
- `sort`: `asc` or `desc` by createdAt
- `page`: page number (default: 1)
- `limit`: items per page (default: 10)

---

### 💬 Comments

| Method | Route                   | Description                   | Auth |
|--------|--------------------------|-------------------------------|------|
| GET    | `/api/comments?postId=`  | Get comments for a post       | ❌   |
| POST   | `/api/comments`          | Add a comment to a post       | ✅   |

---

### 📚 Categories

| Method | Route              | Description                | Auth | Role  |
|--------|--------------------|----------------------------|------|-------|
| GET    | `/api/categories`  | Get all categories         | ❌   | -     |
| POST   | `/api/categories`  | Create a category          | ✅   | ADMIN |

---

### 👥 Users (Admin only)

| Method | Route              | Description                   | Auth | Role  |
|--------|--------------------|-------------------------------|------|-------|
| GET    | `/api/users`       | Get all users                 | ✅   | ADMIN |
| PATCH  | `/api/users/:id`   | Update user role              | ✅   | ADMIN |
| DELETE | `/api/users/:id`   | Delete a user                 | ✅   | ADMIN |

---

## 🔧 Prisma Schema Models (Simplified)

```prisma
model User {
  id             String   @id @default(uuid())
  name           String
  email          String   @unique
  hashedPassword String?  // Only for credentials login
  role           Role     @default(USER)
  image          String?
  posts          Post[]
  comments       Comment[]
}

model Post {
  id         String   @id @default(uuid())
  title      String
  content    String
  createdAt  DateTime @default(now())
  author     User     @relation(fields: [authorId], references: [id])
  authorId   String
  category   Category @relation(fields: [categoryId], references: [id])
  categoryId String
  comments   Comment[]
}

model Comment {
  id        String   @id @default(uuid())
  content   String
  createdAt DateTime @default(now())
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  post      Post     @relation(fields: [postId], references: [id])
  postId    String
}

model Category {
  id    String @id @default(uuid())
  name  String
  slug  String @unique
  posts Post[]
}

enum Role {
  USER
  ADMIN
}
```

---

## 🧱 Setup & Development

```bash
# Clone project
git clone https://github.com/your-org/blog-api.git
cd blog-api

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Fill in:
# DATABASE_URL=
# NEXTAUTH_SECRET=
# GOOGLE_CLIENT_ID=, GOOGLE_CLIENT_SECRET=
# GITHUB_CLIENT_ID=, GITHUB_CLIENT_SECRET=

# Set up Prisma
npx prisma migrate dev --name init
npx prisma generate

# Start development server
npm run dev
```

---

## 🧪 Testing the API

You can test the API using:

- **Postman**
- **Insomnia**
- **cURL**

Use `/api/auth/login` or OAuth providers to authenticate, then attach token to `Authorization: Bearer <token>` in your requests to protected endpoints.

---

## 🚀 Deployment

You can deploy this backend to platforms like:

- **Vercel** (Serverless API routes)
- **Render**
- **Railway**
- **Heroku (with custom server)**

Use environment variables for your DB connection and OAuth credentials.

---

## 📋 Error Handling

All endpoints return appropriate HTTP status codes:

| Code | Meaning               |
|------|------------------------|
| 200  | OK                     |
| 201  | Created                |
| 400  | Bad Request            |
| 401  | Unauthorized           |
| 403  | Forbidden              |
| 404  | Not Found              |
| 500  | Internal Server Error  |

Error messages are descriptive and consistent.

---

## 📎 License

MIT – feel free to use, extend, or contribute.

---

## 👨‍💻 Author

Created by [Ali Ghorbani] – Backend Engineer & Open Source Contributor
