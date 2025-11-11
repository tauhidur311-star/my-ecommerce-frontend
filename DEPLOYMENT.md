# Frontend Deployment Guide

## Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/my-ecommerce-frontend.git
   cd my-ecommerce-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your API URL and Google Client ID
   ```

4. **Start development server**:
   ```bash
   npm start
   ```

## Production Deployment

### Option 1: Vercel (Recommended for React)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts to deploy
4. Add environment variables in Vercel dashboard

### Option 2: Netlify
1. Build the project: `npm run build`
2. Drag and drop `build` folder to Netlify
3. Or connect GitHub repository for automatic deployments
4. Add environment variables in Netlify settings

### Option 3: GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json scripts:
   ```json
   "homepage": "https://yourusername.github.io/my-ecommerce-frontend",
   "predeploy": "npm run build",
   "deploy": "gh-pages -d build"
   ```
3. Run: `npm run deploy`

### Option 4: AWS S3 + CloudFront
1. Build the project: `npm run build`
2. Upload build folder to S3 bucket
3. Enable static website hosting
4. Configure CloudFront distribution

## Environment Variables Required

```
REACT_APP_API_URL=https://your-backend-domain.com
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
GENERATE_SOURCEMAP=false
```

## Build Configuration

The build is optimized with:
- Source maps disabled for production
- Code splitting for better performance
- Asset optimization
- PWA capabilities (manifest.json included)