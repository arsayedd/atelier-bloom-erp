
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
        .select('*, orders!inner(*)')
        .eq('category', 'laundry')
        .eq('orders.created_by', staffId)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr);
      
      const laundryAmount = laundryServices && laundryServices.length > 0 
        ? laundryServices.reduce((sum, item) => sum + (parseFloat(String(item.price || 0)) * 0.02), 0) 
        : 0;
      
      // Get outdoor services handled by this staff
      const { data: outdoorServices, error: outdoorError } = await supabase
        .from('appointments')
        .select('*')
        .eq('created_by', staffId)
        .eq('location_type', 'outdoor')
        .gte('date', startDateStr)
        .lte('date', endDateStr);
      
      const outdoorAmount = outdoorServices && outdoorServices.length > 0 
        ? outdoorServices.reduce((sum, appt) => sum + (parseFloat(String(appt.price || 0)) * 0.07), 0) 
        : 0;
      
      // For exemplary performance - can be calculated based on number of 5-star reviews
      // For demo purposes, we'll use a random value if data isn't available
      let exemplaryAmount = 0;
      
      // Check for exemplary ratings/reviews
      const { data: exemplaryReviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('staff_id', staffId)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr)
        .gte('rating', 4.5);
        
      if (!reviewsError && exemplaryReviews && exemplaryReviews.length > 0) {
        exemplaryAmount = exemplaryReviews.length * 50; // 50 per excellent review
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
