
import { supabase } from '@/integrations/supabase/client';

export interface ReferralCode {
  id: string;
  code: string;
  discount_percentage: number;
  expiration_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ReferralStats {
  client_id: string;
  client_name: string;
  client_phone?: string;
  referrals_count: number;
  total_discount: number;
}

export const ReferralService = {
  async getReferralCodes(): Promise<ReferralCode[]> {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching referral codes:', error);
      return [];
    }
  },
  
  async getReferralCodeById(id: string): Promise<ReferralCode | null> {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching referral code ${id}:`, error);
      return null;
    }
  },
  
  async getReferralCodeByCode(code: string): Promise<ReferralCode | null> {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching referral code with code ${code}:`, error);
      return null;
    }
  },
  
  async createReferralCode(referral: Omit<ReferralCode, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    try {
      // Set default expiration date to 1 year if not provided
      if (!referral.expiration_date) {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        referral.expiration_date = oneYearFromNow.toISOString();
      }
      
      const { data, error } = await supabase
        .from('referral_codes')
        .insert([referral])
        .select();
      
      if (error) throw error;
      return data && data[0] ? data[0].id : null;
    } catch (error) {
      console.error('Error creating referral code:', error);
      return null;
    }
  },
  
  async updateReferralCode(id: string, updates: Partial<ReferralCode>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('referral_codes')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error updating referral code ${id}:`, error);
      return false;
    }
  },
  
  async deleteReferralCode(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('referral_codes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting referral code ${id}:`, error);
      return false;
    }
  },
  
  async generateReferralCodeForClient(clientId: string, clientName: string): Promise<string | null> {
    try {
      // Generate a unique code based on client name and current timestamp
      const timestamp = Date.now().toString(36);
      const nameCode = clientName
        .replace(/\s+/g, '')
        .substring(0, 4)
        .toLowerCase();
      
      const code = `${nameCode}-${timestamp}`.toUpperCase();
      
      // Create referral code with 1-year validity and 10% discount
      const referral: Omit<ReferralCode, 'id' | 'created_at' | 'updated_at'> = {
        code,
        discount_percentage: 10,
        is_active: true,
        created_by: clientId
      };
      
      const referralId = await this.createReferralCode(referral);
      
      return referralId ? code : null;
    } catch (error) {
      console.error(`Error generating referral code for client ${clientId}:`, error);
      return null;
    }
  },
  
  async getTopReferrers(limit: number = 10): Promise<ReferralStats[]> {
    try {
      // In a real implementation, we would join referral_codes with orders table
      // to get statistics about how many times a client's referral code was used
      // For now we'll return placeholder data until the relevant tables are created
      
      // Get most active referrers from referral_codes table
      const { data, error } = await supabase
        .from('referral_codes')
        .select('created_by')
        .not('created_by', 'is', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Count referrals per client
      const referrerCounts: Record<string, number> = {};
      data?.forEach(item => {
        if (item.created_by) {
          if (referrerCounts[item.created_by]) {
            referrerCounts[item.created_by]++;
          } else {
            referrerCounts[item.created_by] = 1;
          }
        }
      });
      
      // Get client details for top referrers
      const referrerIds = Object.keys(referrerCounts).slice(0, limit);
      
      if (referrerIds.length === 0) {
        return [];
      }
      
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, full_name, phone')
        .in('id', referrerIds);
        
      if (clientsError) throw clientsError;
      
      // Combine data
      return (clients || []).map(client => ({
        client_id: client.id,
        client_name: client.full_name,
        client_phone: client.phone || '',
        referrals_count: referrerCounts[client.id] || 0,
        total_discount: (referrerCounts[client.id] || 0) * 800 // 800 EGP per referral
      })).sort((a, b) => b.referrals_count - a.referrals_count);
    } catch (error) {
      console.error('Error fetching top referrers:', error);
      return [];
    }
  }
};
