
import { supabase } from '@/integrations/supabase/client';

export interface CommissionRates {
  newBookings: number;
  additions: number;
  cleaning: number;
  outdoor: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  commission_rates: CommissionRates;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const EmployeeService = {
  async getEmployees(): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Properly parse the JSON field and cast to our expected type
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        role: item.role,
        phone: item.phone,
        commission_rates: typeof item.commission_rates === 'object' 
          ? item.commission_rates as CommissionRates
          : JSON.parse(item.commission_rates as string) as CommissionRates,
        active: item.active,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  },
  
  async createEmployee(employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert(employee)
        .select();
      
      if (error) throw error;
      return data && data[0] ? data[0].id : null;
    } catch (error) {
      console.error('Error creating employee:', error);
      return null;
    }
  },
  
  async updateEmployee(id: string, updates: Partial<Employee>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error updating employee ${id}:`, error);
      return false;
    }
  },
  
  async deleteEmployee(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting employee ${id}:`, error);
      return false;
    }
  },
  
  async toggleEmployeeStatus(id: string, active: boolean): Promise<boolean> {
    return this.updateEmployee(id, { active });
  }
};
