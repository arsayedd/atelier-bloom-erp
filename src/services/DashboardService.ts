
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
        .from('payments')
        .select('id, amount, payment_date, order_id, order:order_id(client_id, client:client_id(full_name))')
        .order('payment_date', { ascending: false })
        .limit(5);
      
      if (error) {
        // إذا فشل الاستعلام الأول، نحاول استخدام استعلام آخر
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id, client_id, client:client_id(full_name), total_amount, paid_amount')
          .lt('paid_amount', 'total_amount')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (ordersError) throw ordersError;
        
        return (ordersData || []).map(order => ({
          id: `pending_${order.id}`,
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
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      return [];
    }
  },
  
  async getMonthlyRevenue(): Promise<RevenueData[]> {
    try {
      // استخدام دالة قاعدة البيانات للحصول على الإيرادات الشهرية
      const { data, error } = await supabase
        .rpc('get_monthly_revenue', {
          year_param: new Date().getFullYear()
        });
      
      if (error) {
        console.error('RPC error:', error);
        
        // احتياطيًا نستخدم الحساب اليدوي إذا فشل RPC
        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1).toISOString();
        const endDate = new Date(currentYear, 11, 31).toISOString();
        
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('amount, payment_date')
          .gte('payment_date', startDate)
          .lte('payment_date', endDate);
          
        if (paymentsError) throw paymentsError;
        
        // تجميع المدفوعات حسب الشهر
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
      
      // تحويل أرقام الشهور إلى أسماء الشهور ومعالجة تحويلات الأنواع
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      return (data || []).map(item => ({
        month: monthNames[parseInt(String(item.month)) - 1], 
        total: parseFloat(String(item.total))
      }));
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      
      // إرجاع بيانات فارغة إذا فشلت كل المحاولات
      return [];
    }
  }
};
