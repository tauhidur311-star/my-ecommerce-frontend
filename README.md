# My E-commerce Frontend

A modern React-based frontend for an e-commerce application with responsive design, real-time features, and comprehensive user experience.

## Features

- **Modern UI/UX**: Responsive design with dark/light mode support
- **User Authentication**: Login/register with Google OAuth integration
- **Product Catalog**: Advanced search, filtering, and product browsing
- **Shopping Cart**: Real-time cart management with persistent storage
- **User Dashboard**: Profile management, order history, wishlist
- **Admin Panel**: Product management, analytics, and order processing
- **Real-time Updates**: Live notifications and real-time data sync
- **Internationalization**: Multi-language support (English/Bengali)

## Tech Stack

- **Framework**: React 18
- **Routing**: React Router v7
- **State Management**: React Context + Hooks
- **Styling**: CSS3 with CSS Variables
- **UI Components**: Custom components with Framer Motion animations
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Authentication**: Google OAuth + JWT
- **Image Handling**: React Image Crop, Zoom Pan Pinch

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   ```bash
   # Edit .env with your API URL and Google Client ID
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Environment Variables

Configure in `.env`:

- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GENERATE_SOURCEMAP`: Set to false for production builds

## Available Scripts

- `npm start` - Start development server (http://localhost:3000)
- `npm run build` - Create production build
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App (one-way operation)

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── admin/       # Admin-specific components
│   └── ui/          # Base UI components
├── contexts/        # React contexts for state management
├── hooks/           # Custom React hooks
├── i18n/            # Internationalization
│   └── locales/     # Translation files
├── lib/             # Utility libraries
├── pages/           # Page components
│   ├── admin/       # Admin pages
│   ├── auth/        # Authentication pages
│   ├── dashboard/   # User dashboard
│   └── store/       # Store pages
├── services/        # API services and external integrations
├── styles/          # Global styles and animations
├── utils/           # Utility functions
├── App.js           # Main application component
└── index.js         # Application entry point
```