import re

with open('src/pages/MasterRoom.tsx', 'r') as f:
    code = f.read()

skin_editor_regex = re.compile(r'function DomainSkinControl\(\{ clients \}: \{ clients: Client\[\] \}\) \{([\s\S]*?)\n\}\n\nfunction WatermarkEditor', re.MULTILINE)

new_skin_control = """function DomainSkinControl({ clients }: { clients: Client[] }) {
  const [currentDomain] = useState(window.location.hostname);
  const [assignedClientId, setAssignedClientId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { refreshClient } = useStore();

  useEffect(() => {
    async function loadDomainConfig() {
      const { data, error } = await (supabase as any)
        .from('manifest_domain_config')
        .select('client_id')
        .eq('domain', currentDomain)
        .maybeSingle();
      if (data && !error) {
        setAssignedClientId(data.client_id);
      }
    }
    loadDomainConfig();
  }, [currentDomain]);

  async function handleSelectChange(newClientId: string) {
    if (!newClientId) return;
    setAssignedClientId(newClientId);
    setIsSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('manifest_domain_config')
        .upsert({ domain: currentDomain, client_id: newClientId });
      
      if (error) throw error;
      if (refreshClient) {
        await refreshClient();
      }
    } catch (err: any) {
      alert("Failed to update domain configuration: " + err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow-sm border relative">
      <h3 className="text-lg font-bold mb-4">Domain Skin Control</h3>
      <p className="text-sm text-gray-500 mb-6">
        Instantly switch the identity of this domain (<strong>{currentDomain}</strong>). Changes take effect immediately.
      </p>
      
      <div className="relative max-w-sm">
        <select 
          value={assignedClientId} 
          onChange={e => handleSelectChange(e.target.value)}
          disabled={isSaving}
          className="appearance-none block w-full pl-3 pr-10 py-3 text-base border-gray-300 bg-gray-50 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md border font-medium cursor-pointer"
        >
          <option value="" disabled>-- Select a business --</option>
          {clients.map(c => (
             <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
"""

new_code = skin_editor_regex.sub(new_skin_control.replace('\\', '\\\\') + "\n\nfunction WatermarkEditor", code)
with open('src/pages/MasterRoom.tsx', 'w') as f:
    f.write(new_code)
print("Updated DomainSkinControl")
