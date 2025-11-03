#!/usr/bin/env python3
"""
API URL Migration Script - Properly migrates all hardcoded URLs
"""

import os
import re
import sys

def fix_file(filepath):
    """Fix a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        changed = False
        
        # Check if import already exists
        has_api_config_import = "from '@/config/api.config'" in content or 'from "@/config/api.config"' in content
        
        # Remove bad const declarations created by sed
        patterns_to_remove = [
            r"const API_BASE = import\.meta\.env\.VITE_API_URL \|\| API_BASE_URL \+ '';",
            r"const API_BASE_URL = import\.meta\.env\.VITE_API_URL \|\| API_BASE_URL \+ '';",
        ]
        
        for pattern in patterns_to_remove:
            if re.search(pattern, content):
                content = re.sub(pattern, '', content)
                changed = True
        
        # Add import if not present
        if not has_api_config_import:
            # Find the last import statement
            import_pattern = r'^import\s+.*?;$'
            imports = list(re.finditer(import_pattern, content, re.MULTILINE))
            
            if imports:
                last_import = imports[-1]
                insert_pos = last_import.end()
                
                # Check what we need to import
                needs_ws = 'buildWsUrl' in content or 'ws://localhost' in content
                
                if needs_ws:
                    import_line = "\nimport { API_BASE_URL, buildWsUrl } from '@/config/api.config';"
                else:
                    import_line = "\nimport { API_BASE_URL } from '@/config/api.config';"
                
                content = content[:insert_pos] + import_line + content[insert_pos:]
                changed = True
        
        # Replace hardcoded URLs in fetch calls
        replacements = [
            (r"'http://localhost:3001/api", r"API_BASE_URL + '"),
            (r'"http://localhost:3001/api', r'API_BASE_URL + "'),
            (r'`http://localhost:3001/api', r'`${API_BASE_URL}'),
        ]
        
        for pattern, replacement in replacements:
            if pattern in content:
                content = content.replace(pattern, replacement)
                changed = True
        
        # Fix WebSocket URLs
        ws_patterns = [
            (r"`ws://localhost:3001/chat\?token=\$\{wsToken\}`", "buildWsUrl('chat', wsToken)"),
            (r'`ws://localhost:3001/chat`', "buildWsUrl('chat')"),
        ]
        
        for pattern, replacement in ws_patterns:
            content = re.sub(pattern, replacement, content)
            if content != original_content:
                changed = True
        
        # Remove standalone const declarations for API_BASE or API_BASE_URL
        const_patterns = [
            r"const API_BASE_URL = import\.meta\.env\.VITE_API_URL \|\| 'http://localhost:3001/api';?\n?",
            r"const API_BASE_URL = import\.meta\.env\.VITE_API_URL \|\| 'http://localhost:5000/api';?\n?",
            r"const API_BASE_URL = 'http://localhost:3001/api';?\n?",
            r"const API_BASE = import\.meta\.env\.VITE_API_URL \|\| 'http://localhost:3001/api';?\n?",
            r"const API_BASE = 'http://localhost:3001/api';?\n?",
        ]
        
        for pattern in const_patterns:
            if re.search(pattern, content):
                content = re.sub(pattern, '', content)
                changed = True
        
        # Replace ${API_BASE} with ${API_BASE_URL}
        if '${API_BASE}' in content and '${API_BASE_URL}' not in content.replace('${API_BASE}', ''):
            content = content.replace('${API_BASE}', '${API_BASE_URL}')
            changed = True
        
        # Write back if changed
        if changed and content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, None
        
        return False, "No changes needed"
        
    except Exception as e:
        return False, str(e)

def main():
    """Main function"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    files_to_fix = [
        'src/hooks/useTemplates.tsx',
        'src/hooks/useSystemVitals.tsx',
        'src/hooks/useEmployees.tsx',
        'src/hooks/useChat.tsx',
        'src/hooks/useLayoutPreferences.tsx',
        'src/hooks/useRecurringTasks.tsx',
        'src/hooks/useInvoices.tsx',
        'src/pages/owner/OwnerDashboard.tsx',
        'src/components/onboarding/OnboardingWizard.tsx',
        'src/components/ai/AIChatbox.tsx',
        'src/components/tasks/TaskInvoicing.tsx',
        'src/components/forms/AddTaskForm.tsx',
    ]
    
    print("🔧 API URL Migration Script")
    print("=" * 50)
    print()
    
    fixed_count = 0
    error_count = 0
    skipped_count = 0
    
    for rel_path in files_to_fix:
        filepath = os.path.join(base_dir, rel_path)
        
        if not os.path.exists(filepath):
            print(f"⚠️  {rel_path} - Not found")
            skipped_count += 1
            continue
        
        success, message = fix_file(filepath)
        
        if success:
            print(f"✅ {rel_path}")
            fixed_count += 1
        elif message:
            if message == "No changes needed":
                print(f"⏭️  {rel_path} - {message}")
                skipped_count += 1
            else:
                print(f"❌ {rel_path} - Error: {message}")
                error_count += 1
    
    print()
    print("=" * 50)
    print(f"✅ Fixed: {fixed_count}")
    print(f"⏭️  Skipped: {skipped_count}")
    print(f"❌ Errors: {error_count}")
    print()
    
    if fixed_count > 0:
        print("Next steps:")
        print("1. Review the changes: git diff")
        print("2. Test the application: npm run dev")
        print("3. Check for TypeScript errors: npx tsc --noEmit")

if __name__ == '__main__':
    main()
