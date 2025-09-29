# Store Rating Platform

A comprehensive full-stack web application for store rating and review management, built as part of the Roxiler Systems campus hiring assessment.

## 🚀 Project Overview

The Store Rating Platform is a modern web application that allows users to discover, rate, and review stores. It features role-based access control with three distinct user types: Admin, Store Owner, and regular User, each with specific permissions and capabilities.

## ✨ Features

### Authentication & Authorization
- **JWT-based Authentication** with secure token management
- **Role-based Access Control** (Admin, Store Owner, User)
- **Password Security** with bcrypt hashing and strength validation
- **Session Management** with automatic token refresh

### Store Management
- **CRUD Operations** for store management (Admin/Store Owner)
- **Store Discovery** with search and filtering capabilities
- **Store Profiles** with detailed information and ratings
- **Owner Dashboard** for managing store information

### Rating System
- **1-5 Star Rating System** with validation
- **Prevent Duplicate Ratings** (one per user per store)
- **Rating Updates** - users can modify their existing ratings
- **Real-time Rating Calculations** with automatic average updates
- **Rating History** and analytics

### Admin Dashboard
- **User Management** - view, create, update, delete users
- **Store Management** - comprehensive store oversight
- **Analytics Dashboard** with key metrics and insights
- **System Statistics** and reporting

### Advanced Features
- **Search & Filtering** across stores by name and location
- **Pagination** for efficient data loading
- **Sorting** by various criteria (name, rating, date)
- **Responsive Design** optimized for all devices
- **Real-time Notifications** with toast messages
- **Data Validation** on both client and server sides

## 🛠 Tech Stack

### Frontend
- **React.js** (v18.2.0) - Modern UI framework
- **React Router DOM** (v6.16.0) - Client-side routing
- **Tailwind CSS** (v3.3.4) - Utility-first CSS framework
- **React Hook Form** (v7.47.0) - Form management
- **Axios** (v1.5.0) - HTTP client
- **React Toastify** (v9.1.3) - Notifications
- **Chart.js** & **React Chart.js 2** - Data visualization

### Backend
- **Node.js** & **Express.js** (v4.18.2) - Server framework
- **PostgreSQL** with **Sequelize ORM** (v6.33.0) - Database
- **JSON Web Tokens** (v9.0.2) - Authentication
- **Bcryptjs** (v2.4.3) - Password hashing
- **Joi** (v17.10.2) - Input validation
- **Helmet** (v7.1.0) - Security headers
- **Express Rate Limit** (v6.10.0) - Rate limiting
- **CORS** (v2.8.5) - Cross-origin resource sharing

## 📁 Project Structure

```
store-rating-platform/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── auth/          # Authentication components
│   │   │   ├── dashboard/     # Dashboard components
│   │   │   ├── store/         # Store-related components
│   │   │   └── user/          # User management components
│   │   ├── context/           # React Context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API service functions
│   │   └── utils/             # Utility functions
│   ├── package.json
│   └── tailwind.config.js
├── server/                     # Express backend
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Custom middleware
│   │   ├── models/            # Sequelize models
│   │   ├── routes/            # Express routes
│   │   ├── utils/             # Utility functions
│   │   ├── migrations/        # Database migrations
│   │   └── seeders/           # Database seeders
│   ├── tests/                 # Test files
│   └── package.json
└── README.md
```

## 🚀 Installation and Setup

### Prerequisites
- **Node.js** (v16.0.0 or higher)
- **PostgreSQL** (v12.0 or higher)
- **npm** or **yarn** package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd store-rating-platform
```

### 2. Database Setup
1. Create a PostgreSQL database:
```sql
CREATE DATABASE store_rating_platform;
```

2. Create a database user (optional but recommended):
```sql
CREATE USER store_app_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE store_rating_platform TO store_app_user;
```

### 3. Backend Setup
```bash
cd server
npm install

# Copy environment variables template
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=store_rating_platform
DB_USER=store_app_user
DB_PASSWORD=your_password
DB_DIALECT=postgres

# JWT Configuration
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Run database migrations and start the server:
```bash
# Run migrations (if any)
npm run migrate

# Start development server
npm run dev
```

### 4. Frontend Setup
```bash
cd ../client
npm install

# Copy environment variables template
cp .env.example .env
```

Edit client `.env` file:
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_NAME=Store Rating Platform
REACT_APP_VERSION=1.0.0
```

Start the development server:
```bash
npm start
```

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe Smith Johnson",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "address": "123 Main Street, City, State",
  "role": "user"
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

#### Get Profile
```
GET /auth/profile
Authorization: Bearer <jwt_token>
```

#### Update Profile
```
PUT /auth/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "address": "Updated Address"
}
```

### Store Endpoints

#### Get All Stores
```
GET /stores?page=1&limit=10&query=search_term&sortBy=name&sortOrder=ASC
```

#### Get Store by ID
```
GET /stores/:id
```

#### Create Store (Admin only)
```
POST /stores
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Amazing Store Name Here",
  "email": "store@example.com",
  "address": "Store address",
  "owner_id": 1
}
```

#### Update Store
```
PUT /stores/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Store Name",
  "address": "Updated address"
}
```

#### Delete Store (Admin only)
```
DELETE /stores/:id
Authorization: Bearer <jwt_token>
```

### Rating Endpoints

#### Submit Rating
```
POST /ratings
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "store_id": 1,
  "rating": 5
}
```

#### Get Store Ratings
```
GET /ratings/store/:storeId?page=1&limit=10
```

#### Get My Ratings
```
GET /ratings/my-ratings
Authorization: Bearer <jwt_token>
```

### Dashboard Endpoints

#### Admin Statistics
```
GET /dashboard/admin/stats
Authorization: Bearer <jwt_token>
```

#### Store Owner Statistics
```
GET /dashboard/store-owner/stats
Authorization: Bearer <jwt_token>
```

#### User Statistics
```
GET /dashboard/user/stats
Authorization: Bearer <jwt_token>
```

### User Management (Admin only)

#### Get All Users
```
GET /users?page=1&limit=10&query=search&role=user
Authorization: Bearer <jwt_token>
```

#### Create User
```
POST /users
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "New User Full Name Here",
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "role": "user"
}
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL CHECK (LENGTH(name) BETWEEN 20 AND 60),
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  address VARCHAR(400),
  role VARCHAR CHECK (role IN ('admin', 'user', 'store_owner')) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Stores Table
```sql
CREATE TABLE stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL CHECK (LENGTH(name) BETWEEN 20 AND 60),
  email VARCHAR UNIQUE NOT NULL,
  address VARCHAR(400),
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  average_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5),
  total_ratings INTEGER DEFAULT 0 CHECK (total_ratings >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Ratings Table
```sql
CREATE TABLE ratings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, store_id)
);
```

## 👥 User Roles and Permissions

### Admin
- **Users**: Create, read, update, delete all users
- **Stores**: Create, read, update, delete all stores
- **Ratings**: View all ratings and analytics
- **Dashboard**: Access to comprehensive analytics
- **System**: Full system administration

### Store Owner
- **Profile**: Update own profile information
- **Stores**: Create and manage owned stores
- **Ratings**: View ratings for owned stores
- **Dashboard**: View store-specific analytics
- **Analytics**: Access to owned store metrics

### User
- **Profile**: Update own profile information
- **Stores**: Browse and search all stores
- **Ratings**: Rate stores and update own ratings
- **Dashboard**: View personal rating history
- **Discovery**: Find and review stores

## 🔒 Security Features

### Authentication Security
- **JWT Tokens** with secure secret and expiration
- **Password Hashing** with bcrypt and configurable salt rounds
- **Password Validation** with strength requirements
- **Session Management** with automatic cleanup

### Input Security
- **Input Validation** on both client and server
- **SQL Injection Prevention** with parameterized queries
- **XSS Protection** with input sanitization
- **CSRF Protection** with security headers

### API Security
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for cross-origin requests
- **Security Headers** with Helmet.js
- **Request Size Limits** to prevent large payload attacks

### Data Security
- **Role-based Access Control** with middleware
- **Data Encryption** for sensitive information
- **Audit Logging** for admin actions
- **Error Handling** without information disclosure

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
- **Unit Tests**: Controllers, middleware, utilities
- **Integration Tests**: API endpoints and database operations
- **Component Tests**: React components and user interactions
- **E2E Tests**: Complete user workflows

## 🚀 Deployment

### Environment Configuration

#### Production Environment Variables (Server)
```env
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your_production_jwt_secret
CLIENT_URL=https://your-frontend-domain.com
```

#### Production Environment Variables (Client)
```env
REACT_APP_API_BASE_URL=https://your-api-domain.com/api
```

### Build for Production
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

### Docker Deployment (Optional)
```dockerfile
# Example Dockerfile for server
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Platform Deployment Options
- **Heroku**: Easy deployment with Postgres add-on
- **Vercel/Netlify**: Frontend deployment
- **Railway**: Full-stack deployment
- **AWS/Google Cloud**: Scalable cloud deployment

## 📈 Performance Optimization

### Backend Optimizations
- **Database Indexing** on frequently queried columns
- **Query Optimization** with eager loading
- **Response Compression** with gzip
- **Caching Strategies** for frequently accessed data

### Frontend Optimizations
- **Code Splitting** with React lazy loading
- **Asset Optimization** with build tools
- **State Management** optimization
- **Bundle Size Analysis** and optimization

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
