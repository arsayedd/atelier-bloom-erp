
import { supabase } from '@/integrations/supabase/client';

export interface ReferralCoupon {
  id: string;
  code: string;
  amount: number;
  type: 'fixed' | 'percentage';
  valid_until: string;
  issued_to: string | null;
  client_id: string | null;
  status: 'active' | 'inactive';
  usage_count: number;
  created_at?: string;
  updated_at?: string;
}

export const ReferralCouponService = {
  async getCoupons(): Promise<ReferralCoupon[]> {
    try {
      const { data, error } = await supabase
        .from('referral_coupons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching coupons:', error);
      return [];
    }
  },
  
  async createCoupon(coupon: Omit<ReferralCoupon, 'id' | 'created_at' | 'updated_at' | 'usage_count'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('referral_coupons')
        .insert({
          ...coupon,
          usage_count: 0
        })
        .select();
      
      if (error) throw error;
      return data && data[0] ? data[0].id : null;
    } catch (error) {
      console.error('Error creating coupon:', error);
      return null;
    }
  },
  
  async updateCoupon(id: string, updates: Partial<ReferralCoupon>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('referral_coupons')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error updating coupon ${id}:`, error);
      return false;
    }
  },
  
  async deleteCoupon(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('referral_coupons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting coupon ${id}:`, error);
      return false;
    }
  },
  
  async toggleCouponStatus(id: string, status: 'active' | 'inactive'): Promise<boolean> {
    return this.updateCoupon(id, { status });
  }
};
