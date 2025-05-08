
import { supabase } from '@/integrations/supabase/client';

export interface StaffMember {
  id: string;
  full_name: string;
  role: string;
  commission_rates?: {
    new_bookings?: number;
    additions?: number;
    laundry?: number;
    outdoor?: number;
    exemplary?: number;
  };
}

export interface CommissionRecord {
  id: string;
  staff_id: string;
  month: string; // Format: "YYYY-MM" 
  new_bookings_amount: number;
  additions_amount: number;
  laundry_amount: number;
  outdoor_amount: number;
  exemplary_amount: number;
  other_allowances: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export const CommissionService = {
  async getStaff(): Promise<StaffMember[]> {
    try {
      // This is a placeholder. In a real implementation, you'd have a staff table
      // Instead, we'll use profiles with a 'staff' role
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'staff');
      
      if (error) throw error;
      
      return (data || []).map(profile => ({
        id: profile.id,
        full_name: profile.full_name || '',
        role: 'staff',
        commission_rates: {
          new_bookings: 0.05, // 5%
          additions: 0.03, // 3% 
          laundry: 0.02, // 2%
          outdoor: 0.07, // 7%
          exemplary: 0.01 // 1%
        }
      }));
    } catch (error) {
      console.error('Error fetching staff:', error);
      return [];
    }
  },
  
  async calculateCommission(staffId: string, year: number, month: number): Promise<CommissionRecord | null> {
    try {
      // This is a placeholder. In a real implementation, you'd calculate based on actual data
      // For now, we'll generate mock data
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      // Mock calculation based on random values
      const newBookingsAmount = Math.random() * 500 + 500;
      const additionsAmount = Math.random() * 300 + 200;
      const laundryAmount = Math.random() * 200 + 100;
      const outdoorAmount = Math.random() * 1000 + 500;
      const exemplaryAmount = Math.random() > 0.7 ? 200 : 0; // 30% chance
      const otherAllowances = Math.random() * 100;
      
      const totalAmount = newBookingsAmount + additionsAmount + laundryAmount + 
                          outdoorAmount + exemplaryAmount + otherAllowances;
      
      return {
        id: `comm_${staffId}_${year}_${month}`,
        staff_id: staffId,
        month: `${year}-${(month + 1).toString().padStart(2, '0')}`,
        new_bookings_amount: newBookingsAmount,
        additions_amount: additionsAmount,
        laundry_amount: laundryAmount,
        outdoor_amount: outdoorAmount,
        exemplary_amount: exemplaryAmount,
        other_allowances: otherAllowances,
        total_amount: totalAmount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error calculating commission for staff ${staffId}:`, error);
      return null;
    }
  }
};
