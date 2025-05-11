
import { supabase } from '@/integrations/supabase/client';

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean';
  updated_at?: string;
}

export const SystemSettingsService = {
  async getSettings(): Promise<SystemSetting[]> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');
      
      if (error) throw error;
      
      // Make sure to cast the database type to our interface type
      return (data || []).map(item => ({
        id: item.id,
        key: item.key,
        value: item.value,
        type: item.type as 'string' | 'number' | 'boolean',
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error('Error fetching settings:', error);
      return [];
    }
  },
  
  async updateSetting(key: string, value: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          value: value, 
          updated_at: new Date().toISOString() 
        })
        .eq('key', key);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      return false;
    }
  },
  
  async updateMultipleSettings(settings: { key: string; value: string }[]): Promise<boolean> {
    try {
      // Use transaction to update multiple settings at once
      const updates = settings.map(setting => 
        supabase
          .from('system_settings')
          .update({ 
            value: setting.value, 
            updated_at: new Date().toISOString() 
          })
          .eq('key', setting.key)
      );
      
      await Promise.all(updates);
      return true;
    } catch (error) {
      console.error('Error updating multiple settings:', error);
      return false;
    }
  }
};
