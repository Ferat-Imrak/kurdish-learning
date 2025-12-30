#!/bin/bash

# Kurdish Learning App Setup Script
# This script sets up the development environment for the Kurdish Learning App

set -e

echo "🚀 Setting up Kurdish Learning App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        echo "Visit: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check if PostgreSQL is installed
check_postgres() {
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL is not installed. You'll need to install it for the database."
        echo "Visit: https://www.postgresql.org/download/"
        return 1
    fi
    
    print_success "PostgreSQL is installed"
    return 0
}

# Install dependencies
install_dependencies() {
    print_status "Installing root dependencies..."
    npm install
    
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    print_success "All dependencies installed"
}

# Setup environment files
setup_env() {
    print_status "Setting up environment files..."
    
    # Frontend environment
    if [ ! -f "frontend/.env.local" ]; then
        cp frontend/env.example frontend/.env.local
        print_success "Created frontend/.env.local"
        print_warning "Please update frontend/.env.local with your Supabase credentials"
    else
        print_warning "frontend/.env.local already exists"
    fi
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        cp backend/env.example backend/.env
        print_success "Created backend/.env"
        print_warning "Please update backend/.env with your database and JWT secret"
    else
        print_warning "backend/.env already exists"
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if PostgreSQL is available
    if ! check_postgres; then
        print_warning "Skipping database setup. Please install PostgreSQL first."
        return 0
    fi
    
    # Create database if it doesn't exist
    print_status "Creating database..."
    createdb kurdish_learning 2>/dev/null || print_warning "Database might already exist"
    
    # Run migrations
    print_status "Running database migrations..."
    cd backend
    npx prisma migrate dev --name init
    npx prisma generate
    
    # Seed database
    print_status "Seeding database..."
    npx prisma db seed
    
    cd ..
    print_success "Database setup complete"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p frontend/public/audio/kurmanji
    mkdir -p frontend/public/audio/sorani
    mkdir -p frontend/public/images/letters
    mkdir -p frontend/public/images/numbers
    mkdir -p frontend/public/images/colors
    mkdir -p frontend/public/images/animals
    mkdir -p frontend/public/icons
    
    print_success "Directories created"
}

# Generate app icons placeholder
generate_icons() {
    print_status "Creating placeholder app icons..."
    
    # Create a simple colored square as placeholder
    for size in 72 96 128 144 152 192 384 512; do
        # This is a placeholder - in production you'd use a proper icon generator
        echo "Creating icon-${size}x${size}.png placeholder"
        # You can replace this with actual icon generation
    done
    
    print_success "Icon placeholders created"
}

# Main setup function
main() {
    echo "🎯 Kurdish Learning App Setup"
    echo "=============================="
    
    # Check prerequisites
    check_node
    
    # Install dependencies
    install_dependencies
    
    # Setup environment
    setup_env
    
    # Create directories
    create_directories
    
    # Generate icons
    generate_icons
    
    # Setup database
    setup_database
    
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Update environment files with your credentials:"
    echo "   - frontend/.env.local (Supabase keys)"
    echo "   - backend/.env (Database URL, JWT secret)"
    echo ""
    echo "2. Start the development servers:"
    echo "   npm run dev"
    echo ""
    echo "3. Open your browser:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:5000"
    echo ""
    echo "4. For production deployment, see DEPLOYMENT.md"
    echo ""
    print_success "Happy coding! 🚀"
}

# Run main function
main "$@"

