
import { supabase } from '@/integrations/supabase/client';

export interface Appointment {
  id: string;
  date: string;
  client_id: string;
  status: string;
  notes?: string;
  created_at: string;
  client?: {
    full_name: string;
  };
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_date: string;
  order?: {
    client_id: string;
    client?: {
      full_name: string;
    };
  };
}

export interface RevenueData {
  month: string;
  total: number;
}

export const DashboardService = {
  async getTodayAppointments(): Promise<Appointment[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*, client:client_id(full_name)')
        .gte('date', startOfDay)
        .lte('date', endOfDay)
        .order('date');
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching today appointments:', error);
      return [];
    }
  },
  
  async getPendingPayments(): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, client_id, client:client_id(full_name), total_amount, paid_amount')
        .lt('paid_amount', 'total_amount')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      return (data || []).map(order => ({
        id: order.id,
        order_id: order.id,
        amount: parseFloat(String(order.total_amount)) - parseFloat(String(order.paid_amount)),
        payment_date: new Date().toISOString(),
        order: {
          client_id: order.client_id,
          client: {
            full_name: order.client.full_name
          }
        }
      }));
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      return [];
    }
  },
  
  async getMonthlyRevenue(): Promise<RevenueData[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_monthly_revenue', {
          year_param: new Date().getFullYear()
        });
      
      if (error) {
        console.error('RPC error:', error);
        
        // Fallback to manual calculation if RPC fails
        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1).toISOString();
        const endDate = new Date(currentYear, 11, 31).toISOString();
        
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('amount, payment_date')
          .gte('payment_date', startDate)
          .lte('payment_date', endDate);
          
        if (paymentsError) throw paymentsError;
        
        // Group payments by month
        const monthlyData: { [key: string]: number } = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        monthNames.forEach(month => {
          monthlyData[month] = 0;
        });
        
        (payments || []).forEach(payment => {
          const date = new Date(payment.payment_date);
          const month = monthNames[date.getMonth()];
          monthlyData[month] += parseFloat(String(payment.amount));
        });
        
        return Object.entries(monthlyData).map(([month, total]) => ({
          month,
          total
        }));
      }
      
      // Convert month numbers to month names and handle type conversion
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      return (data || []).map(item => ({
        month: monthNames[parseInt(String(item.month)) - 1], // Convert month number to name ensuring it's handled as a string first
        total: parseFloat(String(item.total))
      }));
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      
      // Return empty data if all attempts fail
      return [];
    }
  }
};
