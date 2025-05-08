
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
      // Check if commission record already exists
      const { data: existingRecords, error: existingError } = await supabase
        .from('staff_commissions')
        .select('*')
        .eq('staff_id', staffId)
        .eq('month', `${year}-${(month + 1).toString().padStart(2, '0')}`)
        .single();
      
      if (!existingError && existingRecords) {
        // Return existing record if found
        return existingRecords as CommissionRecord;
      }
      
      // Dates for filtering
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();
      
      // Get all bookings handled by this staff member in the given month
      const { data: bookings, error: bookingsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('created_by', staffId)
        .gte('date', startDateStr)
        .lte('date', endDateStr);
      
      if (bookingsError) throw bookingsError;
      
      // Get payments/additions handled by this staff in the given month
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('created_by', staffId)
        .gte('payment_date', startDateStr)
        .lte('payment_date', endDateStr);
      
      if (paymentsError) throw paymentsError;
      
      // Calculate commission amounts
      // For demonstration, we're calculating based on number of bookings/payments
      // In a real scenario, you'd have more specific business logic
      const newBookingsAmount = (bookings?.length || 0) * 100; // 100 per booking
      const additionsAmount = (payments?.length || 0) * 50;    // 50 per payment processed
      
      // These would come from other tables in a real implementation
      const laundryAmount = Math.random() * 200 + 100;
      const outdoorAmount = Math.random() * 1000 + 500;
      const exemplaryAmount = Math.random() > 0.7 ? 200 : 0; // 30% chance
      const otherAllowances = 0; // No other allowances by default
      
      const totalAmount = newBookingsAmount + additionsAmount + laundryAmount + 
                         outdoorAmount + exemplaryAmount + otherAllowances;
      
      // In a real implementation, you would create an entry in staff_commissions table
      // For now, we just return the calculated values
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
