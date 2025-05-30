
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize with Heba Ouf as the company name
import { supabase } from '@/integrations/supabase/client';
const initializeSettings = async () => {
  try {
    // Check if company name exists
    const { data: existingSettings } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', 'company_name')
      .single();
    
    if (existingSettings) {
      // Update the company name to Heba Ouf
      await supabase
        .from('system_settings')
        .update({ 
          value: 'Heba Ouf',
          updated_at: new Date().toISOString()
        })
        .eq('key', 'company_name');
      
      console.log('Company name updated to Heba Ouf');
    } else {
      // Create the setting if it doesn't exist
      await supabase
        .from('system_settings')
        .insert({
          key: 'company_name',
          value: 'Heba Ouf',
          type: 'string'
        });
      
      console.log('Company name setting created as Heba Ouf');
    }
  } catch (error) {
    console.error('Error initializing settings:', error);
  }
};

initializeSettings();

createRoot(document.getElementById("root")!).render(<App />);
