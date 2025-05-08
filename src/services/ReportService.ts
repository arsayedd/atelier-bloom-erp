
import { supabase } from '@/integrations/supabase/client';

export interface RevenueReport {
  period: string;
  booking: number; // إيرادات الحجوزات الجديدة
  completion: number; // إيرادات الاستكمال
  expenses: number; // المصروفات
  net: number; // الصافي
}

export interface ClientUpcomingEvent {
  client_id: string;
  client_name: string;
  client_phone: string;
  event_date: string;
  event_type: string;
  hours_remaining: number;
}

export interface StaffCommission {
  staff_id: string;
  staff_name: string;
  new_bookings: number;
  additions: number;
  laundry: number;
  outdoor: number;
  exemplary: number; // الموظف المثالي
  other_allowances: number;
  total: number;
}

export interface ReferralReport {
  client_id: string;
  client_name: string;
  client_phone: string;
  referrals_count: number;
  total_discount: number;
}

export const ReportService = {
  async getDailyRevenue(date: Date): Promise<RevenueReport> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Get new bookings (appointments created on this day)
      const { data: newBookings, error: bookingsError } = await supabase
        .from('appointments')
        .select('id')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());
      
      if (bookingsError) throw bookingsError;
      
      // Get payments made on this day
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, payment_date')
        .gte('payment_date', startOfDay.toISOString())
        .lte('payment_date', endOfDay.toISOString());
      
      if (paymentsError) throw paymentsError;
      
      // For expenses, we'd need a separate table. For now, return 0
      const expenses = 0;
      
      // Calculate totals
      const bookingRevenue = newBookings ? newBookings.length * 200 : 0; // Assuming average booking value
      const completionRevenue = payments ? payments.reduce((sum, payment) => sum + parseFloat(String(payment.amount)), 0) : 0;
      const net = bookingRevenue + completionRevenue - expenses;
      
      return {
        period: date.toLocaleDateString('ar-EG'),
        booking: bookingRevenue,
        completion: completionRevenue,
        expenses,
        net
      };
    } catch (error) {
      console.error('Error generating daily revenue report:', error);
      return {
        period: date.toLocaleDateString('ar-EG'),
        booking: 0,
        completion: 0,
        expenses: 0,
        net: 0
      };
    }
  },
  
  async getMonthlyRevenue(year: number, month: number): Promise<RevenueReport> {
    try {
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
      
      // Get new bookings for this month
      const { data: newBookings, error: bookingsError } = await supabase
        .from('appointments')
        .select('id')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());
      
      if (bookingsError) throw bookingsError;
      
      // Get payments made this month
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, payment_date')
        .gte('payment_date', startOfMonth.toISOString())
        .lte('payment_date', endOfMonth.toISOString());
      
      if (paymentsError) throw paymentsError;
      
      // For expenses, we'd need a separate table. For now, return 0
      const expenses = 0;
      
      // Calculate totals
      const bookingRevenue = newBookings ? newBookings.length * 200 : 0; // Assuming average booking value
      const completionRevenue = payments ? payments.reduce((sum, payment) => sum + parseFloat(String(payment.amount)), 0) : 0;
      const net = bookingRevenue + completionRevenue - expenses;
      
      // Format month name in Arabic
      const monthName = new Date(year, month).toLocaleDateString('ar-EG', { month: 'long' });
      
      return {
        period: `${monthName} ${year}`,
        booking: bookingRevenue,
        completion: completionRevenue,
        expenses,
        net
      };
    } catch (error) {
      console.error('Error generating monthly revenue report:', error);
      const monthName = new Date(year, month).toLocaleDateString('ar-EG', { month: 'long' });
      return {
        period: `${monthName} ${year}`,
        booking: 0,
        completion: 0,
        expenses: 0,
        net: 0
      };
    }
  },
  
  async getUpcomingClientEvents(hoursThreshold: number = 72): Promise<ClientUpcomingEvent[]> {
    try {
      const now = new Date();
      const thresholdDate = new Date(now.getTime() + (hoursThreshold * 60 * 60 * 1000));
      
      // Get appointments within the threshold
      const { data, error } = await supabase
        .from('appointments')
        .select('*, client:client_id(full_name, phone)')
        .gte('date', now.toISOString())
        .lte('date', thresholdDate.toISOString())
        .order('date');
      
      if (error) throw error;
      
      if (!data || data.length === 0) return [];
      
      return data.map(appointment => {
        const appointmentDate = new Date(appointment.date);
        const hoursRemaining = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        return {
          client_id: appointment.client_id,
          client_name: appointment.client?.full_name || 'غير معروف',
          client_phone: appointment.client?.phone || 'غير متاح',
          event_date: appointmentDate.toISOString(),
          event_type: appointment.notes || 'موعد',
          hours_remaining: Math.round(hoursRemaining)
        };
      });
    } catch (error) {
      console.error('Error fetching upcoming client events:', error);
      return [];
    }
  },
  
  async getStaffCommissions(year: number, month: number): Promise<StaffCommission[]> {
    try {
      // Get staff members
      const { data: staff, error: staffError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'staff');
      
      if (staffError) throw staffError;
      
      if (!staff || staff.length === 0) return [];
      
      // Get commission data for each staff member
      const commissions: StaffCommission[] = [];
      
      for (const member of staff) {
        // Calculate commission for each staff member
        // In a real implementation, this would fetch from a commissions table
        // Here we're simulating calculation
        
        const startDate = new Date(year, month, 1).toISOString();
        const endDate = new Date(year, month + 1, 0).toISOString();
        
        // Get bookings created by this staff member
        const { data: bookings } = await supabase
          .from('appointments')
          .select('id')
          .eq('created_by', member.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate);
          
        // Get payments processed by this staff member
        const { data: payments } = await supabase
          .from('payments')
          .select('amount')
          .eq('created_by', member.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate);
        
        // Calculate commission amounts
        const newBookings = (bookings?.length || 0) * 50;
        const additions = payments?.reduce((sum, payment) => sum + parseFloat(String(payment.amount)) * 0.03, 0) || 0;
        
        // These would be calculated from other tables in a real implementation
        const laundry = Math.floor(Math.random() * 200);
        const outdoor = Math.floor(Math.random() * 300);
        const exemplary = Math.random() > 0.7 ? 100 : 0;
        const otherAllowances = 0;
        
        const total = newBookings + additions + laundry + outdoor + exemplary + otherAllowances;
        
        commissions.push({
          staff_id: member.id,
          staff_name: member.full_name || 'غير معروف',
          new_bookings: newBookings,
          additions,
          laundry,
          outdoor,
          exemplary,
          other_allowances: otherAllowances,
          total
        });
      }
      
      return commissions;
    } catch (error) {
      console.error('Error generating staff commissions report:', error);
      return [];
    }
  },
  
  async getTopReferrers(limit: number = 10): Promise<ReferralReport[]> {
    // Use the ReferralService to get top referrers
    try {
      // We'll fetch this from the ReferralService which now connects to the database
      const { data, error } = await supabase.rpc('get_top_referrers', { limit_param: limit });
      
      if (error) {
        // Import the ReferralService directly
        const { ReferralService } = await import('./ReferralService');
        return await ReferralService.getTopReferrers(limit);
      }
      
      if (!data || data.length === 0) {
        // Import the ReferralService as fallback
        const { ReferralService } = await import('./ReferralService');
        return await ReferralService.getTopReferrers(limit);
      }
      
      return data.map((row: any) => ({
        client_id: row.client_id,
        client_name: row.client_name,
        client_phone: row.client_phone || 'غير متاح',
        referrals_count: parseInt(row.referrals_count),
        total_discount: parseFloat(row.total_discount)
      }));
    } catch (error) {
      console.error('Error fetching top referrers:', error);
      return [];
    }
  }
};
