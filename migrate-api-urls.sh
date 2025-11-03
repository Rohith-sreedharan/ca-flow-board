#!/bin/bash

# Script to migrate all hardcoded API URLs to centralized config

echo "🔧 Migrating hardcoded API URLs to centralized config..."
echo ""

cd /Users/rohithaditya/Documents/ca-flow-board

# Function to add import if not present
add_api_import() {
    local file=$1
    if ! grep -q "from '@/config/api.config'" "$file"; then
        # Add import after the last import statement
        sed -i.bak '/^import/!b;:a;n;/^import/ba;i\
import { API_BASE_URL, buildWsUrl } from '"'"'@/config/api.config'"'"';
' "$file"
        echo "  ✓ Added import to $file"
    fi
}

# Array of files to fix
files=(
    "src/hooks/useTemplates.tsx"
    "src/hooks/useSystemVitals.tsx"
    "src/hooks/useEmployees.tsx"
    "src/hooks/useChat.tsx"
    "src/hooks/useLayoutPreferences.tsx"
    "src/hooks/useRecurringTasks.tsx"
    "src/hooks/useInvoices.tsx"
    "src/pages/owner/OwnerDashboard.tsx"
    "src/components/onboarding/OnboardingWizard.tsx"
    "src/components/ai/AIChatbox.tsx"
    "src/components/tasks/TaskInvoicing.tsx"
    "src/components/forms/AddTaskForm.tsx"
)

echo "📝 Fixing files..."
echo ""

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Processing: $file"
        
        # Replace hardcoded URLs
        sed -i.bak "s|const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'|import { API_BASE_URL } from '@/config/api.config'|g" "$file"
        sed -i.bak "s|const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'|import { API_BASE_URL } from '@/config/api.config'|g" "$file"
        sed -i.bak "s|const API_BASE_URL = 'http://localhost:3001/api'|import { API_BASE_URL } from '@/config/api.config'|g" "$file"
        sed -i.bak "s|const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'|import { API_BASE_URL } from '@/config/api.config'|g" "$file"
        sed -i.bak "s|const API_BASE = 'http://localhost:3001/api'|import { API_BASE_URL } from '@/config/api.config'|g" "$file"
        sed -i.bak "s|const API_BASE_URL = 'http://localhost:3001/api'|import { API_BASE_URL } from '@/config/api.config'|g" "$file"
        
        # Replace inline usages
        sed -i.bak "s|import.meta.env.VITE_API_URL || 'http://localhost:3001/api'|API_BASE_URL|g" "$file"
        sed -i.bak "s|'http://localhost:3001/api|API_BASE_URL + '|g" "$file"
        sed -i.bak "s|\"http://localhost:3001/api|API_BASE_URL + \"|g" "$file"
        
        # Replace API_BASE with API_BASE_URL
        sed -i.bak 's/\${API_BASE}/\${API_BASE_URL}/g' "$file"
        sed -i.bak 's/`\${API_BASE}\//`\${API_BASE_URL}\//g' "$file"
        
        # Fix WebSocket URLs
        sed -i.bak "s|ws://localhost:3001/chat|buildWsUrl('chat')|g" "$file"
        sed -i.bak 's|`ws://localhost:3001/chat?token=\${wsToken}`|buildWsUrl('"'"'chat'"'"', wsToken)|g' "$file"
        
        echo "  ✓ Fixed $file"
    else
        echo "  ⚠  Skipped $file (not found)"
    fi
done

echo ""
echo "🧹 Cleaning up backup files..."
find src -name "*.bak" -delete

echo ""
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Review the changes"
echo "2. Test the application"
echo "3. Update .env file if needed"
echo""
