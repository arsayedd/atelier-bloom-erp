import { supabase } from '@/integrations/supabase/client';

export interface Order {
  id: string;
  client_id: string;
  order_date: string;
  delivery_date?: string;
  total_amount: number;
  paid_amount: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  client?: {
    full_name: string;
    phone: string;
  };
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_type: string;
  dress_id?: string;
  price: number;
  quantity: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Order categories
export const orderCategories = {
  makeup: {
    name: 'ميكب',
    types: [
      { id: 'wedding_full_hijab', name: 'زفاف حجاب كامل' },
      { id: 'wedding_half_hijab', name: 'زفاف نصف حجاب' },
      { id: 'wedding_hair_forma', name: 'زفاف فورمة شعر' },
      { id: 'occasion_henna', name: 'حنة' },
      { id: 'occasion_engagement', name: 'خطوبة' },
      { id: 'occasion_katb', name: 'كتب كتاب' },
      { id: 'soiree_normal', name: 'سواريه عادي' },
      { id: 'soiree_high', name: 'هاي سواريه' },
    ]
  },
  skincare: {
    name: 'تنظيف بشرة',
    types: [
      { id: 'skincare_surface', name: 'سطحي' },
      { id: 'skincare_deep', name: 'عميق' },
      { id: 'skincare_vip', name: 'VIP' },
    ]
  },
  atelier: {
    name: 'أتيليه',
    types: [
      { id: 'atelier_wedding_sale', name: 'زفاف - بيع' },
      { id: 'atelier_wedding_rent', name: 'زفاف - إيجار' },
      { id: 'atelier_engagement_sale', name: 'خطوبة - بيع' },
      { id: 'atelier_engagement_rent', name: 'خطوبة - إيجار' },
      { id: 'atelier_katb_sale', name: 'كتب كتاب - بيع' },
      { id: 'atelier_katb_rent', name: 'كتب كتاب - إيجار' },
      { id: 'atelier_soiree_sale', name: 'سواريه - بيع' },
      { id: 'atelier_soiree_rent', name: 'سواريه - إيجار' },
    ]
  }
};

export const OrderService = {
  async getOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, client:client_id(full_name, phone)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },
  
  async getOrderById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, client:client_id(full_name, phone)')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      return null;
    }
  },
  
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching items for order ${orderId}:`, error);
      return [];
    }
  },
  
  async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>, items: Omit<OrderItem, 'id' | 'created_at' | 'updated_at'>[]): Promise<string | null> {
    try {
      // Create order
      const { data, error } = await supabase
        .from('orders')
        .insert([order])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        const orderId = data[0].id;
        
        // Create order items
        const orderItems = items.map(item => ({
          ...item,
          order_id: orderId
        }));
        
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);
        
        if (itemsError) throw itemsError;
        
        // If order includes atelier items with sale, update inventory
        const atelierSaleItems = items.filter(item => 
          item.item_type.includes('atelier') && 
          item.item_type.includes('sale') &&
          item.dress_id
        );
        
        if (atelierSaleItems.length > 0) {
          for (const item of atelierSaleItems) {
            if (item.dress_id) {
              const { error: dressError } = await supabase
                .from('dresses')
                .update({ is_available: false })
                .eq('id', item.dress_id);
              
              if (dressError) console.error(`Failed to update dress ${item.dress_id} availability:`, dressError);
            }
          }
        }
        
        return orderId;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  },
  
  async updateOrder(id: string, updates: Partial<Order>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error updating order ${id}:`, error);
      return false;
    }
  },
  
  async deleteOrder(id: string): Promise<boolean> {
    try {
      // Delete order items first (foreign key constraint)
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);
      
      if (itemsError) throw itemsError;
      
      // Then delete the order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting order ${id}:`, error);
      return false;
    }
  },
  
  async getOrdersByDate(date: Date): Promise<Order[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const { data, error } = await supabase
        .from('orders')
        .select('*, client:client_id(full_name, phone)')
        .gte('order_date', startOfDay.toISOString())
        .lte('order_date', endOfDay.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching orders by date:', error);
      return [];
    }
  },
  
  async getConfirmedAppointments(): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, client:client_id(full_name)')
        .eq('status', 'confirmed')
        .order('date');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching confirmed appointments:', error);
      return [];
    }
  }
};

// Reuse the Appointment interface from DashboardService
interface Appointment {
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
