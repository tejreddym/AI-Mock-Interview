# Architecture

This document describes the architecture and design of the AI Mock Interview platform.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    React Frontend                           │ │
│  │  • Authentication UI (Login/Register)                       │ │
│  │  • Dashboard (Stats, History)                               │ │
│  │  • Interview Setup                                          │ │
│  │  • Interview Interface (Camera, Timer, Q&A)                 │ │
│  │  • Results Display                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS/REST API
                            │ (axios)
┌───────────────────────────▼─────────────────────────────────────┐
│                    Express.js Backend                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Middleware Layer                         │ │
│  │  • CORS                                                     │ │
│  │  • Rate Limiting (general, auth, interview)                │ │
│  │  • MongoDB Sanitization                                    │ │
│  │  • JWT Authentication                                      │ │
│  │  • Error Handler                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     Route Layer                             │ │
│  │  • /api/auth (register, login, getMe)                      │ │
│  │  • /api/interviews (CRUD operations)                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Controller Layer                           │ │
│  │  • authController (user management)                        │ │
│  │  • interviewController (interview logic)                   │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────┬──────────────────────────┬──────────────────────┘
                │                          │
                │                          │ AI API Calls
                │ Database Queries         │
                ▼                          ▼
┌───────────────────────────┐  ┌────────────────────────────┐
│     MongoDB Database      │  │   Google Gemini AI API     │
│  ┌─────────────────────┐  │  │  • Question Generation     │
│  │  Users Collection   │  │  │  • Answer Evaluation       │
│  │  • name             │  │  │  • Scoring (0-10)          │
│  │  • email            │  │  │  • Feedback Generation     │
│  │  • password (hash)  │  │  └────────────────────────────┘
│  └─────────────────────┘  │
│  ┌─────────────────────┐  │
│  │ Interviews Coll.    │  │
│  │  • user (ref)       │  │
│  │  • jobRole          │  │
│  │  • experienceLevel  │  │
│  │  • questions[]      │  │
│  │  • scores           │  │
│  │  • feedback         │  │
│  └─────────────────────┘  │
└───────────────────────────┘
```

## Component Architecture

### Frontend Components

```
src/
├── components/
│   ├── PrivateRoute.jsx           # Protected route wrapper
│   └── (future components)
├── context/
│   └── AuthContext.jsx            # Global auth state
├── pages/
│   ├── Login.jsx                  # Login page
│   ├── Register.jsx               # Registration page
│   ├── Dashboard.jsx              # Main dashboard
│   ├── InterviewSetup.jsx         # Interview configuration
│   ├── Interview.jsx              # Interview interface
│   └── InterviewResult.jsx        # Results display
├── utils/
│   └── api.js                     # Axios instance & interceptors
└── App.jsx                        # Main app with routing
```

### Backend Components

```
src/
├── config/
│   ├── database.js                # MongoDB connection
│   └── gemini.js                  # Gemini AI setup
├── controllers/
│   ├── authController.js          # Auth logic
│   └── interviewController.js     # Interview logic
├── middleware/
│   ├── auth.js                    # JWT verification
│   └── rateLimiter.js             # Rate limiting rules
├── models/
│   ├── User.js                    # User schema
│   └── Interview.js               # Interview schema
├── routes/
│   ├── authRoutes.js              # Auth endpoints
│   └── interviewRoutes.js         # Interview endpoints
├── utils/
│   └── generateToken.js           # JWT token creation
└── server.js                      # App entry point
```

## Data Flow

### Authentication Flow

```
1. User enters credentials
   ↓
2. Frontend sends POST /api/auth/login
   ↓
3. Backend validates credentials
   ↓
4. Backend generates JWT token
   ↓
5. Frontend stores token & user data
   ↓
6. Token included in subsequent requests
```

### Interview Flow

```
1. User fills interview setup form
   ↓
2. POST /api/interviews (create interview)
   ↓
3. POST /api/interviews/:id/generate (generate questions)
   ↓
4. Gemini AI generates questions
   ↓
5. User views questions one by one
   ↓
6. For each question:
   a. User types answer
   b. POST /api/interviews/:id/questions/:idx/answer
   c. POST /api/interviews/:id/questions/:idx/evaluate
   d. Gemini AI evaluates & scores
   e. Display feedback
   ↓
7. PUT /api/interviews/:id/complete
   ↓
8. Display final results
```

## Database Schema

### User Schema

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Interview Schema

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  jobRole: String,
  experienceLevel: 'entry' | 'intermediate' | 'senior',
  interviewType: 'technical' | 'behavioral' | 'mixed',
  questions: [
    {
      question: String,
      answer: String,
      score: Number (0-10),
      feedback: String,
      answeredAt: Date
    }
  ],
  totalScore: Number,
  averageScore: Number,
  status: 'in-progress' | 'completed',
  duration: Number (seconds),
  createdAt: Date,
  completedAt: Date
}
```

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login user |
| GET | /api/auth/me | Yes | Get current user |

### Interviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/interviews | Yes | Get user's interviews |
| POST | /api/interviews | Yes | Create new interview |
| GET | /api/interviews/:id | Yes | Get specific interview |
| POST | /api/interviews/:id/generate | Yes | Generate questions |
| POST | /api/interviews/:id/questions/:idx/answer | Yes | Submit answer |
| POST | /api/interviews/:id/questions/:idx/evaluate | Yes | Evaluate answer |
| PUT | /api/interviews/:id/complete | Yes | Complete interview |
| GET | /api/interviews/stats | Yes | Get user statistics |

## Security Architecture

### Layers of Security

1. **Network Layer**
   - HTTPS encryption (production)
   - CORS policy enforcement

2. **Application Layer**
   - Rate limiting (3 tiers)
   - Input sanitization
   - Input validation
   - Request size limits

3. **Authentication Layer**
   - JWT tokens
   - Password hashing (bcryptjs)
   - Token expiration

4. **Data Layer**
   - MongoDB sanitization
   - Mongoose schema validation
   - NoSQL injection prevention

## Deployment Architecture

### Development

```
Local Machine
├── MongoDB (localhost:27017)
├── Backend (localhost:5000)
└── Frontend (localhost:5173)
```

### Production

```
Internet
    │
    ├─→ Vercel (Frontend)
    │   └─→ Static assets
    │
    └─→ Render (Backend)
        ├─→ Express API
        └─→ MongoDB Atlas
            └─→ Database
```

## Scalability Considerations

### Current Architecture
- Single server deployment
- Suitable for up to 1000 concurrent users

### Future Enhancements
- Load balancing for multiple backend instances
- Redis for session management
- CDN for static assets
- Database read replicas
- Microservices architecture for AI processing
- Message queue for async operations

## Technology Stack

### Frontend
- **React 19**: UI library
- **Vite**: Build tool & dev server
- **TailwindCSS**: Utility-first CSS
- **React Router**: Client-side routing
- **Axios**: HTTP client

### Backend
- **Node.js**: Runtime
- **Express 5**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **express-rate-limit**: Rate limiting
- **express-mongo-sanitize**: Input sanitization

### AI/ML
- **Google Gemini AI**: Question generation & evaluation

### DevOps
- **Git**: Version control
- **Vercel**: Frontend hosting
- **Render**: Backend hosting
- **MongoDB Atlas**: Database hosting

## Performance Optimization

### Frontend
- Code splitting (React lazy loading)
- Asset optimization (Vite)
- Browser caching
- Minimal re-renders (React optimization)

### Backend
- Request/response compression
- Database indexing (email, user references)
- Connection pooling (MongoDB)
- Rate limiting to prevent abuse

### Database
- Indexed queries
- Lean queries (select only needed fields)
- Aggregation pipelines for statistics

## Monitoring & Logging

### Recommended Tools
- **Frontend**: Vercel Analytics
- **Backend**: Render logs
- **Database**: MongoDB Atlas monitoring
- **Error Tracking**: Sentry (future)
- **API Monitoring**: Postman monitoring (future)

## Future Architecture Improvements

1. **Caching Layer**
   - Redis for session storage
   - Cache frequently accessed data

2. **Queue System**
   - RabbitMQ or AWS SQS
   - Async AI processing

3. **WebSocket Support**
   - Real-time updates
   - Live interview collaboration

4. **Analytics Pipeline**
   - Data warehouse
   - Business intelligence

5. **Microservices**
   - Separate AI service
   - Dedicated auth service
   - Independent scaling
