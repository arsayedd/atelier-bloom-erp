
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
      return data || [];
    } catch (error) {
      console.error('Error fetching settings:', error);
      return [];
    }
  },
  
  async updateSetting(key: string, value: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ value, updated_at: new Date().toISOString() })
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
          .update({ value, updated_at: new Date().toISOString() })
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
