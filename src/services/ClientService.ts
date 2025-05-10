
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface Client {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  address?: string;
  emergency_phone?: string;
  governorate?: string;
  city?: string;
  country?: string;
  reference_source?: string;
  client_code?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export const ClientService = {
  async getClients(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast.error(`فشل في الحصول على بيانات العملاء: ${error.message}`);
      return [];
    }
  },
  
  async getClient(id: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error(`Error fetching client ${id}:`, error);
      toast.error(`فشل في الحصول على بيانات العميل: ${error.message}`);
      return null;
    }
  },
  
  async createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('تم إضافة العميل بنجاح');
      return data;
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast.error(`فشل في إضافة العميل: ${error.message}`);
      return null;
    }
  },
  
  async updateClient(id: string, client: Partial<Client>): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(client)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('تم تحديث بيانات العميل بنجاح');
      return data;
    } catch (error: any) {
      console.error(`Error updating client ${id}:`, error);
      toast.error(`فشل في تحديث بيانات العميل: ${error.message}`);
      return null;
    }
  },
  
  async deleteClient(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('تم حذف العميل بنجاح');
      return true;
    } catch (error: any) {
      console.error(`Error deleting client ${id}:`, error);
      toast.error(`فشل في حذف العميل: ${error.message}`);
      return false;
    }
  }
};
