
import { supabase } from '@/integrations/supabase/client';

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  transaction_id?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
  order?: {
    client_id: string;
    client?: {
      full_name: string;
      phone?: string;
    };
  };
}

export interface PendingPayment {
  id: string;
  orderId: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  date: string;
  dueDate: string;
  total: number;
  paid: number;
  remaining: number;
  service: string;
  type: string;
  status: string;
  notes?: string;
}

export const PaymentService = {
  async getAllPayments(): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, order:order_id(client_id, client:client_id(full_name, phone))')
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  },

  async getPendingPayments(): Promise<PendingPayment[]> {
    try {
      // Get orders with unpaid amounts
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id, 
          client_id,
          client:client_id(full_name, phone), 
          order_date, 
          delivery_date,
          total_amount, 
          paid_amount,
          status,
          notes
        `)
        .lt('paid_amount', 'total_amount')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (!orders || orders.length === 0) return [];
      
      // Get order items to determine service type
      const orderIds = orders.map(order => order.id);
      
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('order_id, item_type, description')
        .in('order_id', orderIds);
      
      if (itemsError) throw itemsError;
      
      // Map to PendingPayment structure
      return orders.map(order => {
        // Find related order items
        const items = orderItems?.filter(item => item.order_id === order.id) || [];
        const mainItem = items[0];  // Use first item to determine type
        
        // Determine type based on item_type
        let type = 'unknown';
        if (mainItem) {
          if (mainItem.item_type.includes('makeup')) type = 'makeup';
          else if (mainItem.item_type.includes('skincare')) type = 'skincare';
          else if (mainItem.item_type.includes('atelier')) type = 'atelier';
        }
        
        // Set due date as delivery date or 7 days after order date
        const orderDate = new Date(order.order_date);
        const dueDate = order.delivery_date 
          ? new Date(order.delivery_date)
          : new Date(orderDate.setDate(orderDate.getDate() + 7));
        
        // Determine status
        const today = new Date();
        let status = 'pending';
        if (dueDate < today) {
          status = 'overdue';
        }
        
        return {
          id: `payment_${order.id}`,
          orderId: order.id,
          clientId: order.client_id,
          clientName: order.client?.full_name || 'عميل غير معروف',
          clientPhone: order.client?.phone || '',
          date: order.order_date,
          dueDate: dueDate.toISOString(),
          total: parseFloat(String(order.total_amount)),
          paid: parseFloat(String(order.paid_amount)),
          remaining: parseFloat(String(order.total_amount)) - parseFloat(String(order.paid_amount)),
          service: mainItem?.description || 'خدمة غير محددة',
          type,
          status,
          notes: order.notes
        };
      });
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      return [];
    }
  },

  async createPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<Payment | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([payment])
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the order's paid_amount
      if (data) {
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('paid_amount')
          .eq('id', payment.order_id)
          .single();
        
        if (orderError) throw orderError;
        
        const newPaidAmount = parseFloat(String(order.paid_amount)) + payment.amount;
        
        const { error: updateError } = await supabase
          .from('orders')
          .update({ paid_amount: newPaidAmount })
          .eq('id', payment.order_id);
        
        if (updateError) throw updateError;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating payment:', error);
      return null;
    }
  },

  async getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error(`Error fetching payments for order ${orderId}:`, error);
      return [];
    }
  }
};
