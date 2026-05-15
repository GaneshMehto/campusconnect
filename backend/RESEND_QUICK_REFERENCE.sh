#!/bin/bash
# Quick Reference - Resend Email Integration Testing

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Main menu
show_menu() {
    print_header "Resend Email Integration - Quick Reference"
    echo "Choose an option:"
    echo ""
    echo "  1) Check Configuration"
    echo "  2) Run Full Test Suite"
    echo "  3) Send Test Email"
    echo "  4) Check Email Service Status"
    echo "  5) Verify Resend Library"
    echo "  6) View Logs (last 50 lines)"
    echo "  7) Test Forgot Password Flow"
    echo "  8) Test Email Verification Flow"
    echo "  9) Deploy to Render"
    echo "  10) View Documentation"
    echo "  0) Exit"
    echo ""
}

# 1. Check Configuration
check_configuration() {
    print_header "Checking Configuration"
    
    # Check if .env exists
    if [ -f ".env" ]; then
        print_success ".env file exists"
        
        if grep -q "RESEND_API_KEY" .env; then
            print_success "RESEND_API_KEY is set in .env"
            
            # Show API key preview
            api_key=$(grep "RESEND_API_KEY" .env | cut -d'=' -f2)
            if [ -n "$api_key" ]; then
                key_preview="${api_key:0:8}...${api_key: -4}"
                print_info "API Key preview: $key_preview"
            else
                print_error "RESEND_API_KEY is empty"
            fi
        else
            print_error "RESEND_API_KEY not found in .env"
        fi
        
        if grep -q "FRONTEND_URL" .env; then
            frontend_url=$(grep "FRONTEND_URL" .env | cut -d'=' -f2)
            print_success "FRONTEND_URL: $frontend_url"
        else
            print_warning "FRONTEND_URL not found in .env"
        fi
    else
        print_error ".env file not found"
        print_info "Create .env with: RESEND_API_KEY, FRONTEND_URL, DATABASE_URL, etc."
    fi
    
    # Check Python configuration
    print_info "Checking Python settings..."
    python3 -c "
from config.settings import settings
print(f'API Key configured: {bool(settings.RESEND_API_KEY)}')
print(f'Frontend URL: {settings.FRONTEND_URL}')
print(f'App Name: {settings.APP_NAME}')
print(f'Environment: {settings.ENV}')
" 2>/dev/null || print_error "Failed to load Python settings"
}

# 2. Run Full Test Suite
run_full_tests() {
    print_header "Running Full Test Suite"
    
    if [ ! -f "test_resend_integration.py" ]; then
        print_error "test_resend_integration.py not found"
        return
    fi
    
    print_info "Starting comprehensive test suite..."
    python3 test_resend_integration.py
}

# 3. Send Test Email
send_test_email() {
    print_header "Send Test Email"
    
    read -p "Enter test email address: " email
    
    if [ -z "$email" ]; then
        print_error "Email address is required"
        return
    fi
    
    print_info "Sending test email to: $email"
    print_info "Testing locally at: http://localhost:8000"
    
    # Try to call the endpoint
    if command -v curl &> /dev/null; then
        response=$(curl -s "http://localhost:8000/api/v1/auth/test-email?recipient_email=$email")
        echo ""
        print_info "Response:"
        echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    else
        print_error "curl not found. Please install curl to test endpoints."
        print_info "Or manually test at: http://localhost:8000/api/v1/auth/test-email?recipient_email=$email"
    fi
}

# 4. Check Email Service Status
check_service_status() {
    print_header "Email Service Status"
    
    python3 << 'EOF'
try:
    from services.email import email_service
    from config.settings import settings
    
    print("Email Service Status:")
    print(f"  Resend client initialized: {email_service.resend is not None}")
    print(f"  API Key configured: {bool(settings.RESEND_API_KEY)}")
    print(f"  Frontend URL: {settings.FRONTEND_URL}")
    print(f"  App Name: {settings.APP_NAME}")
    print(f"  Environment: {settings.ENV}")
    
    if email_service.resend:
        print("\n✓ Email service is ready!")
    else:
        print("\n✗ Email service is NOT initialized")
        print("  Check RESEND_API_KEY environment variable")
except Exception as e:
    print(f"✗ Error: {e}")
EOF
}

# 5. Verify Resend Library
verify_resend_library() {
    print_header "Verifying Resend Library"
    
    python3 << 'EOF'
try:
    import resend
    print("✓ Resend library is installed")
    print(f"  Version: {resend.__version__ if hasattr(resend, '__version__') else 'Unknown'}")
except ImportError:
    print("✗ Resend library is NOT installed")
    print("\n  To install, run:")
    print("  pip install resend==0.10.0")
EOF
}

# 6. View Logs
view_logs() {
    print_header "Recent Logs (Last 50 lines)"
    
    if command -v tail &> /dev/null; then
        # Try to find and show logs
        if [ -f "app.log" ]; then
            tail -50 app.log
        elif [ -f "../logs/app.log" ]; then
            tail -50 ../logs/app.log
        else
            print_warning "Log file not found"
            print_info "Logs are typically output to console when running uvicorn"
            print_info "To save logs, run: uvicorn main:app >> app.log 2>&1"
        fi
    else
        print_error "tail command not found"
    fi
}

# 7. Test Forgot Password Flow
test_forgot_password() {
    print_header "Test Forgot Password Flow"
    
    read -p "Enter test email address (must be registered): " email
    
    if [ -z "$email" ]; then
        print_error "Email is required"
        return
    fi
    
    print_info "Testing forgot password endpoint..."
    print_info "Backend URL: http://localhost:8000"
    
    if command -v curl &> /dev/null; then
        response=$(curl -s -X POST \
            "http://localhost:8000/api/v1/auth/forgot-password" \
            -H "Content-Type: application/json" \
            -d "{\"email\":\"$email\"}")
        
        echo ""
        print_info "Response:"
        echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
        
        print_info "\nCheck your email for the password reset link"
        print_info "Check backend logs for email send status"
    else
        print_error "curl not found"
    fi
}

# 8. Test Email Verification Flow
test_verification() {
    print_header "Test Email Verification Flow"
    
    read -p "Enter test email address (must be registered but not verified): " email
    
    if [ -z "$email" ]; then
        print_error "Email is required"
        return
    fi
    
    print_info "Testing email verification endpoint..."
    print_info "Backend URL: http://localhost:8000"
    
    if command -v curl &> /dev/null; then
        response=$(curl -s -X POST \
            "http://localhost:8000/api/v1/auth/resend-verification" \
            -H "Content-Type: application/json" \
            -d "{\"email\":\"$email\"}")
        
        echo ""
        print_info "Response:"
        echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
        
        print_info "\nCheck your email for the verification link"
        print_info "Check backend logs for email send status"
    else
        print_error "curl not found"
    fi
}

# 9. Deploy to Render
deploy_to_render() {
    print_header "Deploy to Render"
    
    print_info "Prerequisites:"
    print_info "  1. Code committed to Git"
    print_info "  2. .env file NOT committed"
    print_info "  3. Render service created"
    print_info "  4. Environment variables set in Render"
    echo ""
    
    read -p "Are these prerequisites met? (y/n): " choice
    
    if [[ "$choice" != "y" && "$choice" != "Y" ]]; then
        print_warning "Please complete prerequisites first"
        return
    fi
    
    print_info "Deployment steps:"
    echo "  1. Commit changes: git commit -m 'Resend integration'"
    echo "  2. Push to Git: git push origin main"
    echo "  3. Render auto-deploys (or manually trigger)"
    echo "  4. Monitor logs for build and deployment"
    echo "  5. Test endpoints after deployment"
    echo ""
    
    print_success "For detailed instructions, see: RENDER_DEPLOYMENT_GUIDE.md"
}

# 10. View Documentation
view_documentation() {
    print_header "Documentation Files"
    
    docs=(
        "RESEND_SETUP.md:Initial setup guide"
        "RESEND_TESTING_GUIDE.md:Complete testing instructions"
        "RENDER_DEPLOYMENT_GUIDE.md:Production deployment guide"
        "RESEND_IMPLEMENTATION_CHECKLIST.md:Implementation checklist"
        "RESEND_INTEGRATION_COMPLETE.md:Integration summary"
    )
    
    echo "Available documentation:"
    for i in "${!docs[@]}"; do
        IFS=":" read -r file desc <<< "${docs[$i]}"
        echo "  $((i+1)). $file - $desc"
    done
    echo ""
    
    read -p "Enter file number to view (or 0 to skip): " choice
    
    if [[ "$choice" -ge 1 && "$choice" -le ${#docs[@]} ]]; then
        IFS=":" read -r file _ <<< "${docs[$((choice-1))]}"
        if [ -f "$file" ]; then
            less "$file"
        else
            print_error "File not found: $file"
        fi
    fi
}

# Main loop
main() {
    # Check if we're in the backend directory
    if [ ! -f "main.py" ]; then
        print_error "Must be run from backend directory"
        exit 1
    fi
    
    while true; do
        show_menu
        read -p "Enter choice (0-10): " choice
        
        case $choice in
            1) check_configuration ;;
            2) run_full_tests ;;
            3) send_test_email ;;
            4) check_service_status ;;
            5) verify_resend_library ;;
            6) view_logs ;;
            7) test_forgot_password ;;
            8) test_verification ;;
            9) deploy_to_render ;;
            10) view_documentation ;;
            0) 
                print_info "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please select 0-10."
                ;;
        esac
        
        read -p "Press Enter to continue..."
    done
}

# Run main function
main
