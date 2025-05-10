
import { supabase } from '@/integrations/supabase/client';

export interface Dress {
  id: string;
  name: string;
  category?: string;
  description?: string;
  color?: string;
  size?: string;
  condition?: string;
  rental_price: number;
  sale_price?: number;
  is_available: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DressHistory {
  dress_id: string;
  total_rentals: number;
  total_revenue: number;
  net_revenue: number;
}

export interface DressLaundryRecord {
  dress_id: string;
  dress_code: string;
  sent_date: string;
  return_date?: string;
  notes?: string;
  status: 'sent' | 'returned';
}

export const InventoryService = {
  async getDresses(filterAvailable: boolean = false): Promise<Dress[]> {
    try {
      let query = supabase
        .from('dresses')
        .select('*')
        .order('name');
        
      if (filterAvailable) {
        query = query.eq('is_available', true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching dresses:', error);
      return [];
    }
  },
  
  async getDressById(id: string): Promise<Dress | null> {
    try {
      const { data, error } = await supabase
        .from('dresses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching dress ${id}:`, error);
      return null;
    }
  },
  
  async createDress(dress: Omit<Dress, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('dresses')
        .insert([dress])
        .select();
      
      if (error) throw error;
      return data && data[0] ? data[0].id : null;
    } catch (error) {
      console.error('Error creating dress:', error);
      return null;
    }
  },
  
  async updateDress(id: string, updates: Partial<Dress>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('dresses')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error updating dress ${id}:`, error);
      return false;
    }
  },
  
  async deleteDress(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('dresses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting dress ${id}:`, error);
      return false;
    }
  },
  
  async getDressHistory(dressId: string): Promise<DressHistory | null> {
    try {
      // Fetch order items related to this dress
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*, order:order_id(total_amount, paid_amount)')
        .eq('dress_id', dressId);
      
      if (itemsError) throw itemsError;
      
      if (!orderItems || orderItems.length === 0) {
        return {
          dress_id: dressId,
          total_rentals: 0,
          total_revenue: 0,
          net_revenue: 0
        };
      }
      
      let totalRevenue = 0;
      let netRevenue = 0;
      
      orderItems.forEach(item => {
        totalRevenue += parseFloat(String(item.price)) * item.quantity;
        // Calculate net based on order paid percentage
        if (item.order) {
          const paidPercentage = parseFloat(String(item.order.paid_amount)) / parseFloat(String(item.order.total_amount));
          netRevenue += parseFloat(String(item.price)) * item.quantity * paidPercentage;
        }
      });
      
      return {
        dress_id: dressId,
        total_rentals: orderItems.length,
        total_revenue: totalRevenue,
        net_revenue: netRevenue
      };
    } catch (error) {
      console.error(`Error fetching history for dress ${dressId}:`, error);
      return null;
    }
  },
  
  async getDressInventoryReport(): Promise<{
    total: number;
    available: number;
    rented: number;
    maintenance: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('dresses')
        .select('is_available, condition');
      
      if (error) throw error;
      
      if (!data) {
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
      console.error('Error generating inventory report:', error);
      return { total: 0, available: 0, rented: 0, maintenance: 0 };
    }
  },
  
  async sendDressToMaintenance(dressId: string, notes: string): Promise<boolean> {
    try {
      // Update the dress status
      const { error } = await supabase
        .from('dresses')
        .update({
          is_available: false,
          condition: 'maintenance',
          description: notes
        })
        .eq('id', dressId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error sending dress ${dressId} to maintenance:`, error);
      return false; 
    }
  },
  
  async returnDressFromMaintenance(dressId: string): Promise<boolean> {
    try {
      // Update the dress status
      const { error } = await supabase
        .from('dresses')
        .update({
          is_available: true,
          condition: 'good'
        })
        .eq('id', dressId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error returning dress ${dressId} from maintenance:`, error);
      return false; 
    }
  }
};
