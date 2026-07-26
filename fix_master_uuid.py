import re

with open('src/pages/MasterRoom.tsx', 'r') as f:
    code = f.read()

# Check imports
if "import { useAuth }" not in code:
    code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useAuth } from '../hooks/useAuth';")

if "Copy" not in code:
    code = code.replace("import { Trash2, Plus, Edit2, Save, X, Loader2, Upload, ImageIcon } from 'lucide-react';", "import { Trash2, Plus, Edit2, Save, X, Loader2, Upload, ImageIcon, Copy, Check } from 'lucide-react';")

# Add state to MasterRoom
# export function MasterRoom() {
#   const [clients, setClients] = useState<Client[]>([]);

old_master = """export function MasterRoom() {
  const [clients, setClients] = useState<Client[]>([]);"""

new_master = """export function MasterRoom() {
  const [clients, setClients] = useState<Client[]>([]);
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };"""

code = code.replace(old_master, new_master)

# Replace the master banner
old_banner = """      <div className="bg-purple-50 text-purple-800 px-4 py-2 rounded text-sm">
        <strong>Master Room</strong> • Manage stores, brands, and system settings.
      </div>"""

new_banner = """      <div className="bg-purple-50 text-purple-800 px-4 py-2 rounded text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <strong>Master Room</strong> • Manage stores, brands, and system settings.
        </div>
        {user?.id && (
          <div className="flex items-center gap-2 bg-purple-100 px-2 py-1 rounded text-xs font-mono">
            <span className="opacity-70">Master ID:</span>
            <strong>{user.id}</strong>
            <button 
              onClick={handleCopy}
              className="p-1 hover:bg-purple-200 rounded transition-colors text-purple-700"
              title="Copy ID"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>"""

code = code.replace(old_banner, new_banner)

with open('src/pages/MasterRoom.tsx', 'w') as f:
    f.write(code)
print("Updated MasterRoom.tsx")
