
import { supabase } from '@/integrations/supabase/client';

export interface Governorate {
  id: string;
  name: string;
  order_num: number;
  created_at?: string;
  updated_at?: string;
  cities?: City[];
}

export interface City {
  id: string;
  name: string;
  order_num: number;
  governorate_id: string;
  created_at?: string;
  updated_at?: string;
}

export const LocationSettingsService = {
  async getGovernorates(): Promise<Governorate[]> {
    try {
      const { data, error } = await supabase
        .from('governorates')
        .select('*, cities(*)')
        .order('order_num');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching governorates:', error);
      return [];
    }
  },
  
  async createGovernorate(governorate: { name: string; order_num: number }): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('governorates')
        .insert(governorate)
        .select();
      
      if (error) throw error;
      return data && data[0] ? data[0].id : null;
    } catch (error) {
      console.error('Error creating governorate:', error);
      return null;
    }
  },
  
  async updateGovernorate(id: string, updates: { name?: string; order_num?: number }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('governorates')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error updating governorate ${id}:`, error);
      return false;
    }
  },
  
  async deleteGovernorate(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('governorates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting governorate ${id}:`, error);
      return false;
    }
  },
  
  async createCity(city: { name: string; order_num: number; governorate_id: string }): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('cities')
        .insert(city)
        .select();
      
      if (error) throw error;
      return data && data[0] ? data[0].id : null;
    } catch (error) {
      console.error('Error creating city:', error);
      return null;
    }
  },
  
  async updateCity(id: string, updates: { name?: string; order_num?: number }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cities')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error updating city ${id}:`, error);
      return false;
    }
  },
  
  async deleteCity(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting city ${id}:`, error);
      return false;
    }
  }
};
