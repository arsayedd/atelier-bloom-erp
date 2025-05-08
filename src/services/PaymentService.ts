
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
    total_amount: number;
    paid_amount: number;
    client?: {
      full_name: string;
      phone: string;
    }
  };
}

export const PaymentService = {
  async getPayments(): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, order:order_id(client_id, total_amount, paid_amount, client:client_id(full_name, phone))')
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  },
  
  async getPaymentById(id: string): Promise<Payment | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, order:order_id(client_id, total_amount, paid_amount, client:client_id(full_name, phone))')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching payment ${id}:`, error);
      return null;
    }
  },
  
  async getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .order('payment_date');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching payments for order ${orderId}:`, error);
      return [];
    }
  },
  
  async createPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<string | null> {
    try {
      // First get the current order to update paid_amount
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('paid_amount')
        .eq('id', payment.order_id)
        .single();
      
      if (orderError) throw orderError;
      
      if (!orderData) {
        throw new Error('Order not found');
      }
      
      // Create payment
      const { data, error } = await supabase
        .from('payments')
        .insert([payment])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        // Update order paid_amount
        const newPaidAmount = parseFloat(String(orderData.paid_amount)) + payment.amount;
        
        const { error: updateError } = await supabase
          .from('orders')
          .update({ paid_amount: newPaidAmount })
          .eq('id', payment.order_id);
        
        if (updateError) {
          console.error('Failed to update order paid amount:', updateError);
        }
        
        return data[0].id;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating payment:', error);
      return null;
    }
  },
  
  async deletePayment(id: string): Promise<boolean> {
    try {
      // First get the payment and order to adjust the paid_amount
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('order_id, amount')
        .eq('id', id)
        .single();
      
      if (paymentError) throw paymentError;
      
      if (!payment) {
        throw new Error('Payment not found');
      }
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('paid_amount')
        .eq('id', payment.order_id)
        .single();
      
      if (orderError) throw orderError;
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Delete the payment
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update order paid_amount
      const newPaidAmount = Math.max(0, parseFloat(String(order.paid_amount)) - parseFloat(String(payment.amount)));
      
      const { error: updateError } = await supabase
        .from('orders')
        .update({ paid_amount: newPaidAmount })
        .eq('id', payment.order_id);
      
      if (updateError) {
        console.error('Failed to update order paid amount:', updateError);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting payment ${id}:`, error);
      return false;
    }
  },
  
  async getPendingPaymentsByType(type?: string): Promise<Payment[]> {
    try {
      // Get orders with outstanding balances
      let query = supabase
        .from('orders')
        .select('id, client_id, total_amount, paid_amount, client:client_id(full_name, phone), order_items!inner(item_type)')
        .lt('paid_amount', 'total_amount');
      
      // Apply filter by type if specified
      if (type) {
        query = query.like('order_items.item_type', `%${type}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data || data.length === 0) return [];
      
      // Transform to Payment objects
      return data.map(order => ({
        id: `pending_${order.id}`,
        order_id: order.id,
        amount: parseFloat(String(order.total_amount)) - parseFloat(String(order.paid_amount)),
        payment_date: new Date().toISOString(),
        payment_method: 'pending',
        created_at: new Date().toISOString(),
        order: {
          client_id: order.client_id,
          total_amount: parseFloat(String(order.total_amount)),
          paid_amount: parseFloat(String(order.paid_amount)),
          client: order.client
        }
      }));
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      return [];
    }
  }
};
