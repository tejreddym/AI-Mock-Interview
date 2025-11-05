# Quick Start Guide

Get your AI Mock Interview platform up and running in 5 minutes!

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## Step 1: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/tejreddym/AI-Mock-Interview.git
cd AI-Mock-Interview
```

## Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your credentials
# Required values:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: A random secret key (generate one: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
# - GEMINI_API_KEY: Your Google Gemini API key
nano .env  # or use your preferred editor
```

Example `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-mock-interview
JWT_SECRET=your-generated-secret-key-here
GEMINI_API_KEY=your-gemini-api-key-here
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

```bash
# Start the backend server
npm run dev

# Server will run on http://localhost:5000
```

## Step 3: Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# The default should work for local development
# Edit if needed
nano .env
```

Example `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Start the frontend development server
npm run dev

# Frontend will run on http://localhost:5173
```

## Step 4: Test the Application

1. Open your browser and go to `http://localhost:5173`
2. Click "Sign up" to create a new account
3. Fill in your details and register
4. You'll be redirected to the dashboard
5. Click "Start New Interview"
6. Fill in the interview details:
   - Job Role: e.g., "Software Engineer"
   - Experience Level: Select your level
   - Interview Type: Choose one
   - Number of Questions: 3-10
7. Click "Start Interview"
8. Answer the AI-generated questions
9. Get instant feedback and scores!

## Troubleshooting

### MongoDB Connection Error

If you see "MongoDB Connection Error":
- Make sure MongoDB is running locally: `mongod`
- Or use MongoDB Atlas and update MONGODB_URI with your Atlas connection string

### Gemini API Error

If questions aren't generating:
- Verify your GEMINI_API_KEY is correct
- Check you have API quota available
- Make sure the API key has access to the Gemini API

### CORS Error

If you see CORS errors:
- Make sure both backend and frontend are running
- Verify FRONTEND_URL in backend .env matches your frontend URL
- Check VITE_API_URL in frontend .env points to your backend

### Camera Not Working

If camera preview isn't showing:
- Allow camera permissions in your browser
- Make sure you're using HTTPS or localhost (camera API requires secure context)

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [SECURITY.md](SECURITY.md) for security best practices
- Deploy to production using Vercel (frontend) and Render (backend)

## Production Deployment Quick Guide

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_URL=your-backend-url`
5. Deploy!

### Backend (Render)

1. Create Web Service on Render
2. Connect your repository
3. Set root directory to `backend`
4. Add all environment variables from .env.example
5. Deploy!

### Database (MongoDB Atlas)

1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist IP: 0.0.0.0/0 (allow all)
4. Get connection string
5. Update MONGODB_URI in backend

## Support

If you encounter issues:
1. Check the console for error messages
2. Review the documentation
3. Open an issue on GitHub

Happy interviewing! 🚀
