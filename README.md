# SaaS Notes - Multi-Tenant Notes Application

A secure, scalable multi-tenant SaaS notes application built with Next.js 14, featuring JWT authentication, role-based access control, and subscription-based feature gating.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)

## 🏗️ Architecture

### Multi-Tenancy Approach: Shared Schema with Tenant ID

I chose the **shared schema with tenant ID** approach for the following reasons:

1. **Cost Effectiveness**: Single database instance reduces infrastructure costs
2. **Simplified Management**: Easier backup, maintenance, and monitoring
3. **Performance**: Efficient resource utilization and connection pooling
4. **Scalability**: Can handle thousands of tenants in a single database
5. **Data Integrity**: Easy to implement cross-tenant analytics and features

**Tenant Isolation Strategy:**
- Every data model includes a `tenantId` field
- All database queries are filtered by tenant ID
- Middleware ensures users can only access their tenant's data
- Database-level constraints prevent cross-tenant data leakage

## 🚀 Features

### Authentication & Authorization
- ✅ JWT-based authentication with secure token validation
- ✅ Role-based access control (Admin/Member)
- ✅ Secure password hashing with bcrypt
- ✅ Automatic token refresh and session management

### Multi-Tenancy
- ✅ Strict tenant isolation - data never leaks between tenants
- ✅ Support for multiple companies (Acme & Globex included)
- ✅ Tenant-specific subscription management
- ✅ Scalable architecture supporting unlimited tenants

### Subscription & Feature Gating
- ✅ Free Plan: Maximum 3 notes per tenant
- ✅ Pro Plan: Unlimited notes
- ✅ Real-time limit enforcement
- ✅ Instant upgrade capability (Admin only)
- ✅ Subscription status visibility

### Notes Management
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Tenant-isolated note storage
- ✅ User attribution and audit trail
- ✅ Real-time UI updates

### Security
- ✅ CORS enabled for API access
- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention via Prisma ORM
- ✅ Authentication middleware on all protected routes

## 📊 Database Schema

```prisma
model Tenant {
  id           String   @id @default(cuid())
  slug         String   @unique  // "acme", "globex"
  name         String              // "Acme Corp", "Globex Corporation"
  subscription String   @default("FREE") // "FREE" or "PRO"
  users        User[]
  notes        Note[]
}

model User {
  id       String   @id @default(cuid())
  email    String   @unique
  password String
  role     UserRole @default(MEMBER) // ADMIN or MEMBER
  tenantId String
  tenant   Tenant   @relation(fields: [tenantId], references: [id])
  notes    Note[]
}

model Note {
  id       String @id @default(cuid())
  title    String
  content  String
  tenantId String
  userId   String
  tenant   Tenant @relation(fields: [tenantId], references: [id])
  user     User   @relation(fields: [userId], references: [id])
}
```

## 🔑 Test Accounts

All test accounts use the password: **`password`**

| Email | Role | Tenant | Capabilities |
|-------|------|--------|-------------|
| `admin@acme.test` | Admin | Acme | Create notes, upgrade subscription |
| `user@acme.test` | Member | Acme | Create/manage notes only |
| `admin@globex.test` | Admin | Globex | Create notes, upgrade subscription |
| `user@globex.test` | Member | Globex | Create/manage notes only |

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Health Check
- `GET /api/health` - Application health status

### Notes CRUD
- `GET /api/notes` - List all notes (tenant-isolated)
- `POST /api/notes` - Create a new note (with limit checking)
- `GET /api/notes/:id` - Get specific note (tenant-isolated)
- `PUT /api/notes/:id` - Update note (tenant-isolated)
- `DELETE /api/notes/:id` - Delete note (tenant-isolated)

### Subscription Management
- `POST /api/tenants/:slug/upgrade` - Upgrade tenant to Pro (Admin only)

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd saas-notes-app
   npm install
   ```

2. **Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database connection:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/saas_notes"
   JWT_SECRET="your-jwt-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-here"
   ```

3. **Database Setup**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000)

## 🏃‍♂️ Usage

### Login
1. Navigate to `/login`
2. Use any of the test accounts listed above
3. You'll be redirected to the dashboard

### Dashboard Features
- **View Notes**: See all notes for your tenant
- **Create Notes**: Add new notes (subject to plan limits)
- **Edit Notes**: Modify existing notes
- **Delete Notes**: Remove notes
- **Upgrade Subscription**: Admin users can upgrade to Pro plan

### Role Differences
- **Members**: Can only manage notes
- **Admins**: Can manage notes + upgrade subscription

## 🔒 Security Features

### Tenant Isolation
- All database queries include tenant filtering
- Middleware validates tenant access on every request
- No cross-tenant data exposure possible

### Authentication Security
- JWT tokens with expiration
- Secure password hashing (bcrypt, rounds: 12)
- Protected API routes with middleware
- Automatic logout on token expiry

### Input Validation
- Zod schemas for all API inputs
- XSS prevention through React's built-in protections
- SQL injection prevention via Prisma ORM

## 🎨 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form management

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Robust relational database
- **JWT** - Stateless authentication
- **bcrypt** - Secure password hashing

### Deployment
- **Vercel** - Serverless deployment platform
- **Vercel Postgres** - Managed PostgreSQL (recommended)

## 🚀 Deployment to Vercel

### Automatic Deployment

1. **Connect Repository**
   - Push code to GitHub/GitLab/Bitbucket
   - Connect repository to Vercel

2. **Environment Variables**
   Set the following in Vercel dashboard:
   ```
   DATABASE_URL=your_production_database_url
   JWT_SECRET=your_production_jwt_secret
   NEXTAUTH_URL=your_production_domain
   NEXTAUTH_SECRET=your_production_nextauth_secret
   ```

3. **Database Setup**
   ```bash
   # Run migrations in production
   npx prisma migrate deploy
   
   # Seed production database
   npx prisma db seed
   ```

### Manual Deployment
```bash
# Build the application
npm run build

# Deploy to Vercel
npx vercel deploy --prod
```

## 📋 Testing the Application

### Manual Testing Checklist

1. **Health Endpoint**
   ```bash
   curl https://your-domain.vercel.app/api/health
   # Expected: {"status":"ok"}
   ```

2. **Authentication Test**
   ```bash
   curl -X POST https://your-domain.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@acme.test","password":"password"}'
   ```

3. **Notes API Test**
   ```bash
   # Create note
   curl -X POST https://your-domain.vercel.app/api/notes \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"title":"Test Note","content":"Test content"}'
   ```

4. **Tenant Isolation Test**
   - Login as `admin@acme.test`
   - Create some notes
   - Login as `admin@globex.test`
   - Verify you can't see Acme's notes

5. **Subscription Upgrade Test**
   - Login as `admin@acme.test`
   - Create 3 notes (should work)
   - Try creating 4th note (should fail)
   - Upgrade to Pro plan
   - Create 4th note (should work)

## 🤝 API Integration Examples

### JavaScript/Node.js
```javascript
const API_BASE = 'https://your-domain.vercel.app/api'

// Login
const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return response.json()
}

// Get notes
const getNotes = async (token) => {
  const response = await fetch(`${API_BASE}/notes`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  return response.json()
}
```

### Python
```python
import requests

API_BASE = "https://your-domain.vercel.app/api"

# Login
def login(email, password):
    response = requests.post(f"{API_BASE}/auth/login", 
                           json={"email": email, "password": password})
    return response.json()

# Get notes
def get_notes(token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_BASE}/notes", headers=headers)
    return response.json()
```

## 🎯 Production Considerations

### Performance Optimizations
- Database connection pooling via Prisma
- Optimized React rendering with proper key props
- Lazy loading and code splitting
- Efficient database queries with proper indexes

### Monitoring & Observability
- Health endpoint for uptime monitoring
- Structured error logging
- Database query performance monitoring
- User authentication audit trails

### Scalability
- Stateless JWT authentication (horizontally scalable)
- Database-per-tenant option available for scale
- CDN-ready static assets
- Serverless architecture (scales to zero)

## 📈 Future Enhancements

- [ ] Real-time collaboration with WebSockets
- [ ] File attachments and media support
- [ ] Advanced search and filtering
- [ ] Audit logs and compliance features
- [ ] Multi-language support
- [ ] Mobile app with React Native
- [ ] Advanced analytics dashboard
- [ ] Bulk operations and import/export

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ for the internship application**

This application demonstrates advanced full-stack development skills including:
- 🏗️ **Architecture**: Multi-tenant SaaS design patterns
- 🔐 **Security**: Comprehensive authentication and authorization
- 📊 **Database**: Efficient schema design and data modeling  
- 🎨 **Frontend**: Modern React patterns and responsive design
- 🚀 **DevOps**: Production-ready deployment and monitoring
- 📝 **Documentation**: Comprehensive API and setup documentation
