# Hello Next.js

A full-stack Next.js application with a beautiful frontend and backend API.

## Features

- **Frontend**: Modern React-based UI with gradient background and glassmorphism design
- **Backend**: Next.js API route that returns random hello messages
- **Full-stack integration**: Frontend fetches data from backend API
- **TypeScript**: Fully typed for better development experience

## Project Structure

```
hello-nextjs/
├── app/
│   ├── api/
│   │   └── hello/
│   │       └── route.ts       # Backend API endpoint
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Frontend page
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
└── next.config.js             # Next.js configuration
```

## Setup Instructions

1. **Navigate to the project directory**:
   ```bash
   cd hello-nextjs
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## How It Works

1. The frontend (`app/page.tsx`) displays a beautiful hello page
2. When the page loads, it fetches data from the backend API (`/api/hello`)
3. The backend API returns a random hello message with a timestamp
4. The user can click "Refresh Message" to get a new message from the backend

## Technologies Used

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **CSS** - Styling with inline styles for simplicity
