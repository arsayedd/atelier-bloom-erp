
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
        role: profile.role || 'staff',
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
      // Format dates for filtering
      const startDate = new Date(year, month - 1, 1); // month is 1-indexed
      const endDate = new Date(year, month, 0);
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
      
      // Get staff member details for commission rates
      const { data: staffMember, error: staffError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', staffId)
        .single();
      
      if (staffError) throw staffError;
      
      // Calculate commission amounts based on real data
      // For new bookings: number of appointments created * average commission rate
      const newBookingsAmount = (bookings?.length || 0) * 100; // 100 per booking
      
      // For additions: sum of payment amounts * commission rate
      const additionsAmount = (payments || []).reduce((sum, payment) => {
        return sum + (parseFloat(String(payment.amount)) * 0.03); // 3% commission on payments
      }, 0);
      
      // Get laundry services handled by this staff
      const { data: laundryServices, error: laundryError } = await supabase
        .from('order_items')
        .select('*, orders(*)')
        .eq('item_type', 'laundry')
        .eq('orders.created_by', staffId)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr);
      
      const laundryAmount = (laundryServices || []).reduce((sum, item) => {
        return sum + (parseFloat(String(item.price || 0)) * 0.02);
      }, 0);
      
      // Get outdoor appointments handled by this staff
      const { data: outdoorAppointments, error: outdoorError } = await supabase
        .from('appointments')
        .select('*')
        .eq('created_by', staffId)
        .eq('status', 'outdoor')
        .gte('date', startDateStr)
        .lte('date', endDateStr);
      
      // Since 'price' might not exist directly on the appointments table
      // We'll calculate a fixed amount per outdoor appointment
      const outdoorAmount = (outdoorAppointments?.length || 0) * 150; // 150 per outdoor appointment
      
      // For exemplary performance - based on number of positive reviews
      let exemplaryAmount = 0;
      
      // We need to check if a 'reviews' table exists
      const { count, error: tableError } = await supabase
        .from('profiles')  // Use an existing table to check if there are staff with good performance
        .select('*', { count: 'exact', head: true })
        .eq('role', 'staff')
        .eq('id', staffId);
        
      // If the staff exists, allocate an exemplary performance bonus if they have good metrics
      if (!tableError && count && count > 0) {
        // We could base this on metrics like bookings:payment ratio, client retention, etc.
        // For now, give a bonus if they have processed more than 5 bookings or payments
        if ((bookings?.length || 0) > 5 || (payments?.length || 0) > 5) {
          exemplaryAmount = 200; // Fixed bonus for exemplary staff
        }
      }
      
      const otherAllowances = 0; // Can be manually set if needed
      
      const totalAmount = newBookingsAmount + additionsAmount + laundryAmount + 
                        outdoorAmount + exemplaryAmount + otherAllowances;
      
      // Return the calculated commission data
      return {
        id: `comm_${staffId}_${year}_${month}`,
        staff_id: staffId,
        month: `${year}-${month.toString().padStart(2, '0')}`,
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
