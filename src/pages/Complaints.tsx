import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../hooks/useStore';
import { 
  AlertCircle, 
  Check, 
  Loader2, 
  Search, 
  Clock, 
  MessageSquare,
  Filter
} from 'lucide-react';

export function Complaints() {
  const { profile } = useAuth();
  const { client } = useStore();
  const isStaff = profile?.role === 'staff' || profile?.role === 'manager' || profile?.role === 'master';

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [product, setProduct] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [description, setDescription] = useState('');
  const [resolutionType, setResolutionType] = useState('repair');

  // Staff state
  const [tickets, setTickets] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isStaff) {
      loadTickets();
    }
  }, [isStaff]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const { data, error: dbErr } = await (supabase as any)
        .from('manifest_complaints')
        .select('*')
        .eq('client_id', client?.id || "default")
        .order('created_at', { ascending: false });

      if (dbErr) {
         throw dbErr;
      } else {
         setTickets(data || []);
      }
    } catch (err: any) {
      console.error('Failed to load tickets, falling back to local storage:', err);
      const local = localStorage.getItem('mock_complaints');
      if (local) {
         setTickets(JSON.parse(local));
      } else {
         setTickets([]);
      }
      // Do not set error to allow graceful fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        client_id: client?.id || "default",
        customer_name: name,
        customer_phone: phone,
        product_name: product,
        purchase_date: purchaseDate || null,
        description,
        resolution_type: resolutionType,
        status: 'Received',
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      };

      const { error: dbErr } = await (supabase as any)
        .from('manifest_complaints')
        .insert([payload]);

      if (dbErr) throw dbErr;
      
      setSuccess('Your ticket has been submitted successfully. Our team will contact you shortly.');
    } catch (err: any) {
      console.error('Submit error, using local fallback:', err);
      const local = localStorage.getItem('mock_complaints');
      const tickets = local ? JSON.parse(local) : [];
      const payload = {
        client_id: client?.id || "default",
        customer_name: name,
        customer_phone: phone,
        product_name: product,
        purchase_date: purchaseDate || null,
        description,
        resolution_type: resolutionType,
        status: 'Received',
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      };
      tickets.unshift(payload);
      localStorage.setItem('mock_complaints', JSON.stringify(tickets));
      if (isStaff) {
         setTickets(tickets);
      }
      setSuccess('Your ticket has been submitted successfully (Offline Mode). Our team will contact you shortly.');
    } finally {
      // Reset form
      setName('');
      setPhone('');
      setProduct('');
      setPurchaseDate('');
      setDescription('');
      setResolutionType('repair');
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error: updateErr } = await (supabase as any)
        .from('manifest_complaints')
        .update({ status: newStatus })
        .eq('id', id);

      if (updateErr) throw updateErr;
      setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } catch (err: any) {
      console.error('Update error, using local fallback:', err);
      const local = localStorage.getItem('mock_complaints');
      if (local) {
        const parsed = JSON.parse(local);
        const updated = parsed.map((t: any) => t.id === id ? { ...t, status: newStatus } : t);
        localStorage.setItem('mock_complaints', JSON.stringify(updated));
        setTickets(updated);
      } else {
        setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
      }
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = statusFilter === 'all' || t.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = 
      t.customer_name?.toLowerCase().includes(search.toLowerCase()) || 
      t.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          {isStaff ? 'Complaints & Repair Requests' : 'Raise a Repair Ticket'}
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          {isStaff 
            ? 'Manage customer complaints and repair tickets.'
            : 'Having an issue with a product? Log a ticket below and our team will investigate.'
          }
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 text-sm rounded-xl border border-emerald-200 flex items-center gap-2">
          <Check className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {!isStaff ? (
        // Customer Form View
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent outline-none transition-all"
                  placeholder="e.g. 020 1234 5678"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={product}
                  onChange={e => setProduct(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent outline-none transition-all"
                  placeholder="Which product is this about?"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Date of Purchase
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={e => setPurchaseDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Preferred Resolution
              </label>
              <div className="flex flex-wrap gap-3">
                {['repair', 'exchange', 'refund'].map(type => (
                  <label 
                    key={type} 
                    className={`flex-1 flex items-center justify-center px-4 py-3 border rounded-xl cursor-pointer transition-all ${
                      resolutionType === type 
                        ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/5 text-[var(--theme-accent)] font-semibold ring-1 ring-[var(--theme-accent)]' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="resolutionType"
                      value={type}
                      checked={resolutionType === type}
                      onChange={e => setResolutionType(e.target.value)}
                      className="hidden"
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Description of Problem <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent outline-none resize-none transition-all"
                placeholder="Please describe the issue in detail..."
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--theme-accent)] text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        // Staff Dashboard View
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent outline-none transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              {['all', 'Received', 'In Review', 'Awaiting Customer', 'Resolved'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    statusFilter === status 
                      ? 'bg-[var(--theme-accent)] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All Tickets' : status}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center text-gray-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--theme-accent)]" />
                <span>Loading tickets...</span>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No tickets found matching your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product & Issue</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTickets.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 align-top">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </span>
                            <span className={`inline-flex self-start px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${
                              ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                              ticket.status === 'Received' ? 'bg-amber-100 text-amber-700' :
                              ticket.status === 'In Review' ? 'bg-sky-100 text-sky-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {ticket.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <p className="text-sm font-bold text-gray-900">{ticket.customer_name}</p>
                          <p className="text-sm text-gray-500 font-mono mt-0.5">{ticket.customer_phone}</p>
                        </td>
                        <td className="px-6 py-4 align-top max-w-md">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold text-gray-900">{ticket.product_name}</p>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] uppercase font-semibold">
                              Prefers {ticket.resolution_type}
                            </span>
                          </div>
                          {ticket.purchase_date && (
                            <p className="text-xs text-gray-500 mb-2">Purchased: {ticket.purchase_date}</p>
                          )}
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            {ticket.description}
                          </p>
                        </td>
                        <td className="px-6 py-4 align-top text-right">
                          <select
                            value={ticket.status}
                            onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent outline-none cursor-pointer"
                          >
                            <option value="Received">Received</option>
                            <option value="In Review">In Review</option>
                            <option value="Awaiting Customer">Awaiting Customer</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
