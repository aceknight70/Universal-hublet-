import { supabase } from './supabase';

export interface IndividualStaffEntry {
  client_id: string;
  staff_name: string;
  pin?: string;
  created_at?: string;
}

/**
 * Verify a tier PIN ('manager' or 'staff') for a business client
 */
export async function verifyTierPin(clientId: string, tier: 'manager' | 'staff', pin: string): Promise<boolean> {
  if (!clientId || !pin) return false;

  try {
    const { data, error } = await (supabase as any).rpc('verify_tier_pin', {
      p_client_id: clientId,
      p_tier: tier,
      p_pin: pin
    });
    if (!error && typeof data === 'boolean') {
      return data;
    }
  } catch (e) {
    console.warn('RPC verify_tier_pin failed:', e);
  }

  return false;
}

/**
 * Verify a named individual staff member's PIN
 */
export async function verifyIndividualStaffPin(clientId: string, staffName: string, pin: string): Promise<boolean> {
  if (!clientId || !staffName || !pin) return false;

  try {
    const { data, error } = await (supabase as any).rpc('verify_individual_staff_pin', {
      p_client_id: clientId,
      p_staff_name: staffName,
      p_pin: pin
    });
    if (!error && typeof data === 'boolean') {
      return data;
    }
  } catch (e) {
    console.warn('RPC verify_individual_staff_pin failed:', e);
  }

  return false;
}

/**
 * List named staff members for a client business
 */
export async function listStaffNames(clientId: string): Promise<string[]> {
  if (!clientId) return [];

  try {
    const { data, error } = await (supabase as any).rpc('list_staff_names', { p_client_id: clientId });
    if (!error && Array.isArray(data)) {
      return data.map((item: any) => typeof item === 'string' ? item : item.staff_name || item.name).filter(Boolean);
    }
  } catch (e) {
    console.warn('RPC list_staff_names failed:', e);
  }

  return [];
}

/**
 * Set tier PIN (Master only)
 */
export async function setTierPin(clientId: string, tier: 'manager' | 'staff', newPin: string): Promise<{ success: boolean; error?: string }> {
  if (!clientId || !newPin) return { success: false, error: 'Client ID and new PIN are required' };

  try {
    const { error } = await (supabase as any).rpc('set_tier_pin', {
      p_client_id: clientId,
      p_tier: tier,
      p_pin: newPin
    });
    if (!error) return { success: true };
    return { success: false, error: error.message };
  } catch (e: any) {
    console.warn('RPC set_tier_pin failed:', e);
    return { success: false, error: e.message || 'Database error' };
  }
}

/**
 * Set or update a named individual staff PIN (Manager with Manager PIN, or Master)
 */
export async function setIndividualStaffPin(
  clientId: string,
  staffName: string,
  newPin: string,
  managerPin?: string
): Promise<{ success: boolean; error?: string }> {
  if (!clientId || !staffName || !newPin) {
    return { success: false, error: 'Store, Staff Name, and New PIN are required.' };
  }

  const cleanName = staffName.trim();

  if (managerPin) {
    // Manager flow: RPC set_individual_staff_pin with manager pin verification
    try {
      const { data, error } = await (supabase as any).rpc('set_individual_staff_pin', {
        p_client_id: clientId,
        p_staff_name: cleanName,
        p_new_pin: newPin,
        p_manager_pin: managerPin
      });
      if (!error) {
        if (data === false) return { success: false, error: 'Authentication failed. Manager PIN is incorrect.' };
        return { success: true };
      }
      return { success: false, error: error.message };
    } catch (e: any) {
      console.warn('RPC set_individual_staff_pin failed:', e);
      return { success: false, error: e.message || 'Database error' };
    }
  } else {
    // Master flow
    try {
      const { error } = await (supabase as any).rpc('set_individual_staff_pin_by_master', {
        p_client_id: clientId,
        p_staff_name: cleanName,
        p_new_pin: newPin
      });
      if (!error) return { success: true };
      return { success: false, error: error.message };
    } catch (e: any) {
      console.warn('RPC set_individual_staff_pin_by_master failed:', e);
      return { success: false, error: e.message || 'Database error' };
    }
  }
}

/**
 * Delete a named individual staff PIN entry
 */
export async function deleteIndividualStaffPin(clientId: string, staffName: string): Promise<{ success: boolean; error?: string }> {
  if (!clientId || !staffName) return { success: false, error: 'Client ID and staff name required' };

  try {
    const { error } = await (supabase as any)
      .from('manifest_individual_staff_pins')
      .delete()
      .eq('client_id', clientId)
      .eq('staff_name', staffName);

    if (!error) return { success: true };
    return { success: false, error: error.message };
  } catch (e: any) {
    return { success: false, error: e.message || 'Database error' };
  }
}
