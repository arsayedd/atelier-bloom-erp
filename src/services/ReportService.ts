
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

export interface InventorySummary {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export const ReportService = {
  async getDailyRevenue(date: Date): Promise<RevenueReport> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Get new bookings revenue (appointments created on this day)
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());
      
      if (appointmentsError) throw appointmentsError;
      
      // Get payments made on this day
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .gte('payment_date', startOfDay.toISOString())
        .lte('payment_date', endOfDay.toISOString());
      
      if (paymentsError) throw paymentsError;
      
      // Get orders created on this day
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());
        
      if (ordersError) throw ordersError;
      
      // Calculate booking revenue from orders
      const bookingRevenue = orders ? orders.reduce((sum, order) => sum + parseFloat(String(order.total_amount)) * 0.2, 0) : 0; // 20% of order value as booking
      
      // Calculate completion revenue from payments
      const completionRevenue = payments ? payments.reduce((sum, payment) => sum + parseFloat(String(payment.amount)), 0) : 0;
      
      // For expenses, we'd need a separate table. For now, return 0
      const expenses = 0;
      
      // Calculate net revenue
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
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
      
      // Get orders created this month
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());
        
      if (ordersError) throw ordersError;
      
      // Get payments made this month
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .gte('payment_date', startOfMonth.toISOString())
        .lte('payment_date', endOfMonth.toISOString());
      
      if (paymentsError) throw paymentsError;
      
      // Calculate booking revenue from orders (20% of order value)
      const bookingRevenue = orders ? orders.reduce((sum, order) => sum + parseFloat(String(order.total_amount)) * 0.2, 0) : 0;
      
      // Calculate completion revenue from payments
      const completionRevenue = payments ? payments.reduce((sum, payment) => sum + parseFloat(String(payment.amount)), 0) : 0;
      
      // For expenses, we'd need a separate table. For now, return 0
      const expenses = 0;
      
      // Calculate net revenue
      const net = bookingRevenue + completionRevenue - expenses;
      
      // Format month name in Arabic
      const monthName = new Date(year, month - 1).toLocaleDateString('ar-EG', { month: 'long' });
      
      return {
        period: `${monthName} ${year}`,
        booking: bookingRevenue,
        completion: completionRevenue,
        expenses,
        net
      };
    } catch (error) {
      console.error('Error generating monthly revenue report:', error);
      const monthName = new Date(year, month - 1).toLocaleDateString('ar-EG', { month: 'long' });
      return {
        period: `${monthName} ${year}`,
        booking: 0,
        completion: 0,
        expenses: 0,
        net: 0
      };
    }
  },
  
  async getMonthlyRevenueData(year: number): Promise<MonthlyRevenue[]> {
    try {
      // Get monthly revenue data from the database
      const { data, error } = await supabase.rpc('get_monthly_revenue', { year_param: year });
      
      if (error) throw error;
      
      // Transform data into the format needed for charts
      const monthlyRevenue: MonthlyRevenue[] = [];
      
      // Fill in data for all months (even those with no revenue)
      const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                          'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
                          
      for (let i = 0; i < 12; i++) {
        const matchingData = data?.find(item => item.month === i + 1);
        
        monthlyRevenue.push({
          month: monthNames[i],
          revenue: matchingData ? parseFloat(String(matchingData.total)) : 0,
          expenses: 0, // Placeholder for expenses - would come from expenses table
          profit: matchingData ? parseFloat(String(matchingData.total)) : 0 // For now profit = revenue
        });
      }
      
      return monthlyRevenue;
    } catch (error) {
      console.error('Error fetching monthly revenue data:', error);
      
      // Return empty data for all months
      const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                          'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      
      return monthNames.map(month => ({
        month,
        revenue: 0,
        expenses: 0,
        profit: 0
      }));
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
        const startDate = new Date(year, month - 1, 1).toISOString();
        const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString();
        
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
    try {
      // Get clients with their referral counts
      const { data: clients, error } = await supabase
        .from('clients')
        .select('id, full_name, phone, reference_source')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      if (!clients || clients.length === 0) return [];
      
      // Transform into ReferralReport format
      // In a real implementation, we would track actual referrals
      return clients
        .filter(client => client.reference_source === 'referral')
        .map((client, index) => ({
          client_id: client.id,
          client_name: client.full_name,
          client_phone: client.phone || 'غير متاح',
          // For demo, generate random counts
          referrals_count: Math.floor(Math.random() * 5) + 1,
          total_discount: (Math.floor(Math.random() * 5) + 1) * 50
        }));
    } catch (error) {
      console.error('Error fetching top referrers:', error);
      return [];
    }
  },
  
  async getInventorySummary(): Promise<InventorySummary> {
    try {
      const { data, error } = await supabase
        .from('dresses')
        .select('is_available, condition');
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return { total: 0, available: 0, rented: 0, maintenance: 0 };
      }
      
      const total = data.length;
      const available = data.filter(dress => dress.is_available && dress.condition !== 'maintenance').length;
      const maintenance = data.filter(dress => dress.condition === 'maintenance').length;
      const rented = total - available - maintenance;
      
      return {
        total,
        available,
        rented,
        maintenance
      };
    } catch (error) {
      console.error('Error generating inventory summary:', error);
      return { total: 0, available: 0, rented: 0, maintenance: 0 };
    }
  },
  
  async getTopDresses(limit: number = 5): Promise<any[]> {
    try {
      // This would typically join order_items with dresses
      // For now, return the top dresses based on orders
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select('dress_id, price')
        .not('dress_id', 'is', null);
      
      if (error) throw error;
      
      if (!orderItems || orderItems.length === 0) return [];
      
      // Count dress occurrences and total revenue
      const dressStats: {[key: string]: {count: number, revenue: number}} = {};
      
      orderItems.forEach(item => {
        if (!item.dress_id) return;
        
        if (!dressStats[item.dress_id]) {
          dressStats[item.dress_id] = { count: 0, revenue: 0 };
        }
        
        dressStats[item.dress_id].count += 1;
        dressStats[item.dress_id].revenue += parseFloat(String(item.price));
      });
      
      // Get details for the top dresses
      const topDressIds = Object.keys(dressStats)
        .sort((a, b) => dressStats[b].count - dressStats[a].count)
        .slice(0, limit);
      
      if (topDressIds.length === 0) return [];
      
      const { data: dresses } = await supabase
        .from('dresses')
        .select('id, name, category')
        .in('id', topDressIds);
        
      // Combine dress details with stats
      return dresses?.map(dress => ({
        id: dress.id,
        name: dress.name,
        type: dress.category || 'other',
        rentCount: dressStats[dress.id].count,
        revenue: dressStats[dress.id].revenue
      })) || [];
    } catch (error) {
      console.error('Error fetching top dresses:', error);
      return [];
    }
  }
};
