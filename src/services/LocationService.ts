import { supabase } from '@/integrations/supabase/client';

export interface Location {
  id: string;
  name: string;
  type: 'governorate' | 'city';
  parent_id?: string;
  delivery_fee?: number;
  created_at: string;
  updated_at: string;
}

export const LocationService = {
  async getGovernorates(): Promise<Location[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('type', 'governorate')
        .order('name');
      
      if (error) throw error;
      
      // Filter out forbidden governorates (وجه قبلي)
      return (data || [])
        .filter(gov => {
          // Logic to exclude specific governorates
          const forbiddenGovernorates = [
            'أسوان', 'الأقصر', 'أسيوط', 'سوهاج', 'قنا', 'المنيا', 'بني سويف'
          ];
          
          return !forbiddenGovernorates.includes(gov.name);
        })
        .map(gov => ({
          ...gov,
          type: 'governorate' as 'governorate' // Type assertion to ensure it matches the Location interface
        }))
        .sort((a, b) => {
          // Custom sorting for specific governorates
          const preferredOrder = ['الدقهلية', 'الغربية', 'القليوبية', 'الشرقية'];
          
          const aIndex = preferredOrder.indexOf(a.name);
          const bIndex = preferredOrder.indexOf(b.name);
          
          // If both items are in the preferred list, sort by their position in that list
          if (aIndex >= 0 && bIndex >= 0) {
            return aIndex - bIndex;
          }
          
          // If only a is in the preferred list, it comes first
          if (aIndex >= 0) return -1;
          
          // If only b is in the preferred list, it comes first
          if (bIndex >= 0) return 1;
          
          // Otherwise, use alphabetical sorting
          return a.name.localeCompare(b.name);
        });
    } catch (error) {
      console.error('Error fetching governorates:', error);
      return [];
    }
  },
  
  async getCitiesByGovernorate(governorateId: string): Promise<Location[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('type', 'city')
        .eq('parent_id', governorateId)
        .order('name');
      
      if (error) throw error;
      
      // Ensure the type is correctly set to 'city'
      return (data || []).map(city => ({
        ...city,
        type: 'city' as 'city' // Type assertion to ensure it matches the Location interface
      }));
    } catch (error) {
      console.error(`Error fetching cities for governorate ${governorateId}:`, error);
      return [];
    }
  },
  
  async createGovernorate(governorate: Omit<Location, 'id' | 'type' | 'created_at' | 'updated_at'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert([{
          ...governorate,
          type: 'governorate'
        }])
        .select();
      
      if (error) throw error;
      return data && data[0] ? data[0].id : null;
    } catch (error) {
      console.error('Error creating governorate:', error);
      return null;
    }
  },
  
  async createCity(city: Omit<Location, 'id' | 'type' | 'created_at' | 'updated_at'>): Promise<string | null> {
    try {
      if (!city.parent_id) {
        throw new Error('Parent governorate ID is required for cities');
      }
      
      const { data, error } = await supabase
        .from('locations')
        .insert([{
          ...city,
          type: 'city'
        }])
        .select();
      
      if (error) throw error;
      return data && data[0] ? data[0].id : null;
    } catch (error) {
      console.error('Error creating city:', error);
      return null;
    }
  },
  
  async updateLocation(id: string, updates: Partial<Omit<Location, 'id' | 'type' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error updating location ${id}:`, error);
      return false;
    }
  },
  
  async deleteLocation(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting location ${id}:`, error);
      return false;
    }
  }
};
