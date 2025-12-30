# Kurdish Kids Language Learning App

A comprehensive web application for teaching Kurdish language to children, supporting both Kurmanji and Sorani dialects.

## 🚀 Features

- **Interactive Learning Modules**: Alphabet tracing, numbers, basic words
- **Games & Activities**: Flashcards, matching games, audio-based learning
- **Progress Tracking**: Parent dashboard with kid profiles and achievements
- **Dual Dialect Support**: Kurmanji and Sorani Kurdish
- **Progressive Web App**: Offline functionality and mobile-friendly
- **Kid-Safe Design**: Colorful, intuitive interface with friendly mascot

## 🛠 Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for audio/images
- **Deployment**: Vercel (frontend) + Railway/Render (backend)

## 📁 Project Structure

```
kurdish-learning-app/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/             # Utilities and configurations
│   │   └── types/           # TypeScript type definitions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                  # Express API server
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Database models
│   │   └── utils/           # Utility functions
│   └── package.json
├── database/                 # Database migrations and seeds
├── docs/                     # Documentation
└── package.json             # Root package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd kurdish-learning-app
   npm run install:all
   ```

2. **Set up environment variables:**
   ```bash
   # Copy environment files
   cp frontend/.env.example frontend/.env.local
   cp backend/.env.example backend/.env
   ```

3. **Configure your environment variables:**
   - Frontend: Supabase URL, API keys
   - Backend: Database URL, JWT secrets

4. **Set up the database:**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start development servers:**
   ```bash
   npm run dev
   ```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📚 Learning Content

### Available Modules

1. **Alphabet (Harfên Kurdî)**
   - Interactive letter tracing
   - Audio pronunciation
   - Letter recognition games

2. **Numbers (Hejmar)**
   - Numbers 1-20 with animations
   - Counting games
   - Number writing practice

3. **Basic Words**
   - Colors (Reng)
   - Animals (Ajal)
   - Family (Malbat)
   - Objects (Tişt)

4. **Songs & Rhymes**
   - Traditional Kurdish songs
   - Educational rhymes
   - Interactive sing-along

### Games & Activities

- **Flashcards**: Visual and audio learning
- **Match Game**: Picture to word matching
- **Listen & Tap**: Audio recognition game
- **Memory Game**: Kurdish word memory

## 🎨 Design System

### Colors
- Primary: Kurdish flag colors (red, white, green, yellow)
- Secondary: Kid-friendly pastels
- Accent: Bright, playful colors

### Typography
- Headers: Playful, rounded fonts
- Body: Clear, readable fonts
- Kurdish text: Proper Kurdish font support

### Components
- Large, touch-friendly buttons
- Animated feedback
- Progress indicators
- Achievement badges

## 🔐 Authentication & User Management

- **Parent Accounts**: Create and manage child profiles
- **Child Profiles**: Individual progress tracking
- **Progress Dashboard**: Visual progress reports
- **Achievement System**: Stars, badges, certificates

## 💰 Monetization

### Free Tier
- Basic alphabet lessons
- Numbers 1-10
- 3 basic word categories
- Limited games

### Premium Subscription ($3-5/month)
- Full alphabet with advanced tracing
- Numbers 1-100
- All word categories
- Songs and rhymes
- Advanced games
- Progress analytics

### In-App Purchases
- Story packs
- Additional songs
- Special holiday content

## 📱 Progressive Web App

- Offline functionality
- Mobile app-like experience
- Push notifications for learning reminders
- Installable on devices

## 🌍 Internationalization

- Support for Kurdish Latin script
- Future: Kurdish Arabic script support
- Multi-language parent interface (English, Turkish, Arabic)

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Railway/Render)
```bash
cd backend
# Deploy to your preferred platform
```

### Database
- Production PostgreSQL instance
- Automated backups
- Environment-specific configurations

## 📊 Analytics & Monitoring

- Learning progress tracking
- User engagement metrics
- Performance monitoring
- Error tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, email support@kurdishlearning.app or create an issue in the repository.

---

**Made with ❤️ for Kurdish children worldwide**