WorkForcepro- Full Stack Workforce Management System

A comprehensive workforce management application built with React, TypeScript, Node.js, and Express.

## 🚀 Quick Deploy to Vercel (Full Stack)

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Which scope do you want to deploy to? → Select your account
   - Link to existing project? → N
   - What's your project's name? → `taskmaster-pro`
   - In which directory is your code located? → `./`

5. **Set up environment (optional)**:
   ```bash
   vercel env add NODE_ENV production
   ```

6. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Method 2: Vercel Dashboard

1. **Connect GitHub**: 
   - Push this code to a GitHub repository
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

3. **Deploy**: Click "Deploy" and wait for the build to complete

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ 
- npm

### Setup
1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Frontend & Backend: http://localhost:3000

### Demo Credentials
- **Admin**: admin / admin123
- **HR Manager**: hr.manager / hr123  
- **Workers**: john.doe / worker123, mike.smith / worker123, sarah.wilson / worker123

## 📁 Project Structure

```
TaskMasterPro/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/           # Utilities and API client
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data storage
├── api/                   # Vercel serverless functions
│   └── index.ts          # Serverless entry point
├── shared/                # Shared TypeScript types
└── vercel.json           # Vercel deployment config
```

## ✨ Features

### Admin Dashboard
- **Worker Management**: Add, edit, and manage worker profiles
- **Job Management**: Create and assign jobs with real-time status tracking
- **Analytics**: Comprehensive metrics and performance charts
- **Real-time Updates**: Live activity feed and notifications

### HR Dashboard  
- **Workforce Analytics**: Employee performance metrics
- **Job Oversight**: Monitor job assignments and completions
- **Reporting**: Generate workforce reports

### Worker Dashboard
- **Job Queue**: View assigned tasks and priorities
- **Status Updates**: Update job progress in real-time
- **Performance Tracking**: Personal metrics and achievements

### Technical Features
- **Authentication**: Session-based auth with role-based access
- **Real-time Updates**: WebSocket integration for live data
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Data Validation**: Type-safe forms with Zod validation
- **Charts & Analytics**: Interactive charts with Recharts
- **Modern UI**: Shadcn/ui components with dark/light themes

## 🔧 Build Process

The build process creates:
1. **Frontend**: React app bundled to `dist/public/`
2. **Backend**: Node.js server bundled to `dist/index.js`
3. **Serverless API**: Vercel-compatible functions in `api/`

## 🌐 Production Architecture

When deployed to Vercel:
- **Frontend**: Served as static files from `dist/public`
- **Backend**: Runs as serverless functions under `/api/*`
- **Database**: In-memory storage (replace with persistent DB for production)
- **Sessions**: Memory store (use Redis for production)

## 📝 Environment Variables

For production deployment, consider setting:
```
NODE_ENV=production
SESSION_SECRET=your-secret-key
DATABASE_URL=your-database-url (when using persistent DB)
```

## 🔄 Deployment Status

After deployment, your application will be available at:
- **Vercel URL**: `https://your-project.vercel.app`
- **Custom Domain**: Configure in Vercel dashboard

## 📊 Performance

- **Frontend**: Optimized React build with code splitting
- **Backend**: Serverless functions with automatic scaling  
- **Database**: Fast in-memory storage (development)
- **UI**: Responsive design with efficient rendering

## 🔒 Security

- Session-based authentication
- CORS protection
- Input validation with Zod
- Role-based access control
- Secure API endpoints

---

**Ready to deploy?** Just run `vercel` in your terminal and your full-stack TaskMasterPro application will be live in minutes! 
