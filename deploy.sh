#!/bin/bash

# EventCraft Full Deployment Script
# This script handles complete deployment including database updates

set -e  # Exit on any error

echo "🚀 EventCraft Deployment Script"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    echo "Checking dependencies..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "git is not installed"
        exit 1
    fi
    
    print_status "Dependencies check passed"
}

# Install backend dependencies
install_backend_deps() {
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_status "Backend dependencies installed"
}

# Install frontend dependencies
install_frontend_deps() {
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    print_status "Frontend dependencies installed"
}

# Build backend
build_backend() {
    echo "Building backend..."
    cd backend
    npm run build
    cd ..
    print_status "Backend build completed"
}

# Build frontend
build_frontend() {
    echo "Building frontend..."
    cd frontend
    npm run build
    cd ..
    print_status "Frontend build completed"
}

# Update database schema
update_database() {
    echo "Updating database schema..."
    
    # Try automatic migration first
    cd backend
    if npm run migrate 2>/dev/null; then
        print_status "Database migration completed automatically"
        cd ..
        return 0
    fi
    cd ..
    
    # Fallback to manual instructions
    print_warning "Automatic migration failed. Manual steps required:"
    echo ""
    echo "Option 1 - Run migration script manually:"
    echo "cd backend && npm run migrate"
    echo ""
    echo "Option 2 - Manual SQL execution:"
    echo "1. Go to your Supabase SQL Editor"
    echo "2. Copy and paste the entire contents of backend/database/schema.sql"
    echo "3. Execute the SQL commands"
    echo ""
    echo "The key change is updating the handle_new_user() trigger function:"
    echo "COALESCE(NEW.raw_user_meta_data->>'user_type', 'user')::user_type"
    echo ""
    print_warning "After completing database update, press any key to continue..."
    read -n 1 -s
    print_status "Database update completed"
}

# Check environment variables
check_env_vars() {
    echo "Checking environment variables..."
    
    # Check backend .env
    if [[ ! -f "backend/.env" ]]; then
        print_error "backend/.env file not found"
        echo "Please create backend/.env with required variables"
        exit 1
    fi
    
    # Check frontend .env
    if [[ ! -f "frontend/.env" ]]; then
        print_error "frontend/.env file not found"
        echo "Please create frontend/.env with required variables"
        exit 1
    fi
    
    print_status "Environment files found"
}

# Git operations
git_operations() {
    echo "Performing git operations..."
    
    # Add all changes
    git add -A
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        print_warning "No changes to commit"
    else
        echo "Committing changes..."
        git commit -m "$(cat <<'EOF'
Deploy EventCraft updates

- Updated database schema and triggers
- Built frontend and backend
- Ready for production deployment

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
        
        echo "Pushing to GitHub..."
        git push origin main
        print_status "Changes pushed to GitHub"
    fi
}

# Wait for deployments
wait_for_deployments() {
    echo "Waiting for deployments..."
    print_warning "Frontend deployment (GitHub Pages): Usually takes 1-2 minutes"
    print_warning "Backend deployment (Render.com): Usually takes 2-5 minutes"
    echo ""
    echo "Monitor deployment status:"
    echo "- Frontend: https://github.com/6ixstack/evt-mngment/actions"
    echo "- Backend: https://dashboard.render.com/"
    echo ""
    print_status "Deployment initiated"
}

# Test deployment
test_deployment() {
    echo "Testing deployment..."
    echo ""
    echo "URLs to test:"
    echo "- Frontend: https://6ixstack.github.io/evt-mngment/"
    echo "- Backend: Check your Render.com dashboard for the backend URL"
    echo ""
    echo "Test scenarios:"
    echo "1. Sign up as a regular user"
    echo "2. Sign up as a provider"
    echo "3. Sign in with Google as user"
    echo "4. Sign in with Google as provider"
    echo "5. Check database to ensure user types are correct"
    echo ""
    print_status "Please test the above scenarios"
}

# Main deployment flow
main() {
    echo "Starting full deployment process..."
    echo ""
    
    # Run all deployment steps
    check_dependencies
    check_env_vars
    install_backend_deps
    install_frontend_deps
    build_backend
    build_frontend
    update_database
    git_operations
    wait_for_deployments
    test_deployment
    
    echo ""
    echo "🎉 Deployment Complete!"
    echo "======================"
    print_status "All steps completed successfully"
    echo ""
    echo "Next steps:"
    echo "1. Wait for deployments to finish"
    echo "2. Test the application thoroughly"
    echo "3. Monitor for any issues"
    echo ""
}

# Run main function
main