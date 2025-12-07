# Deployment Guide

## Frontend (React + Vite)

### Build for Production

```bash
cd client
npm run build
```

This creates a `dist/` folder with optimized production files.

### Configure for Production

1. Create `.env.production` in `/client`:
```env
VITE_API_URL=https://your-backend-url.com/api
```

2. Or set during build:
```bash
VITE_API_URL=https://api.yoursite.com npm run build
```

### Deploy Options

**Option 1: Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd client
netlify deploy --prod --dir=dist
```

**Option 2: Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd client
vercel --prod
```

**Option 3: Static Hosting (AWS S3, GitHub Pages, etc.)**
- Upload contents of `dist/` folder
- Configure server to serve `index.html` for all routes (SPA mode)

---

## Backend (Node.js + Express)

### Configure for Production

Edit `/server/.env`:
```env
# Switch to production mode (requires JWT)
USE_DEV_AUTH=false

# Your production MongoDB
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/cardwise

# Strong JWT secret
JWT_SECRET=your-very-strong-secret-key-here

# Port (usually 3000 or from hosting provider)
PORT=3000

# Firebase credentials
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

### Deploy Options

**Option 1: Render**
1. Connect your GitHub repo
2. Set environment variables in dashboard
3. Build command: `cd server && npm install`
4. Start command: `cd server && npm start`

**Option 2: Railway**
1. Connect GitHub repo
2. Add environment variables
3. Railway auto-detects Node.js

**Option 3: Heroku**
```bash
# Create Procfile in /server
echo "web: node src/index.js" > Procfile

# Deploy
cd server
heroku create your-app-name
git push heroku main
```

**Option 4: AWS EC2 / DigitalOcean**
```bash
# SSH into server
ssh user@your-server

# Clone repo
git clone https://github.com/your-repo.git
cd your-repo/server

# Install dependencies
npm install

# Set up PM2 (process manager)
npm install -g pm2
pm2 start src/index.js --name cardwise-api
pm2 save
pm2 startup
```

---

## Environment Variables Checklist

### Frontend (.env)
- ✅ `VITE_API_URL` - Backend API URL

### Backend (.env)
- ✅ `MONGO_URI` - MongoDB connection string
- ✅ `JWT_SECRET` - Secret key for JWT tokens
- ✅ `JWT_EXPIRES_IN` - Token expiration (e.g., "7d")
- ✅ `USE_DEV_AUTH` - Set to `false` for production
- ✅ `PORT` - Server port
- ✅ `FIREBASE_SERVICE_ACCOUNT` - Firebase credentials (optional)

---

## CORS Configuration

Update `/server/src/app.js` or `/server/src/index.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',  // Local dev
    'https://your-frontend-domain.com'  // Production
  ],
  credentials: true
}));
```

---

## Quick Deployment Checklist

### Before Deploying

- [ ] Build frontend: `cd client && npm run build`
- [ ] Test build locally: `cd client && npm run preview`
- [ ] Set production environment variables
- [ ] Update CORS origins in backend
- [ ] Test backend API endpoints
- [ ] Set `USE_DEV_AUTH=false` in production

### After Deploying

- [ ] Test login/logout
- [ ] Test session persistence across tabs
- [ ] Verify API calls work
- [ ] Check browser console for errors
- [ ] Test on mobile devices

---

## Troubleshooting

**Issue**: API calls fail with CORS error
- **Fix**: Add your frontend URL to CORS origins in backend

**Issue**: "Authorization required" errors
- **Fix**: Ensure `USE_DEV_AUTH=false` and users are logging in

**Issue**: Blank page after deployment
- **Fix**: Check SPA routing is configured on hosting (serve index.html for all routes)

**Issue**: Session not persisting
- **Fix**: Check browser localStorage isn't blocked, verify JWT token in localStorage

---

## Monitoring

### Backend Logs
```bash
# If using PM2
pm2 logs cardwise-api

# Check errors
pm2 list
```

### Frontend Errors
- Check browser DevTools Console
- Check Network tab for failed API calls

---

## Rollback

If deployment fails:

**Frontend**: Deploy previous `dist/` folder
**Backend**: Revert to previous Git commit and redeploy

```bash
git revert HEAD
git push
```
