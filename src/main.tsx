
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize with Hebaouf as the company name
import { supabase } from '@/integrations/supabase/client';
const initializeSettings = async () => {
  try {
    // Check if company name exists
    const { data } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', 'company_name')
      .single();
    
    if (data) {
      // Update the company name to Hebaouf
      await supabase
        .from('system_settings')
        .update({ value: 'Hebaouf' })
        .eq('key', 'company_name');
      
      console.log('Company name updated to Hebaouf');
    } else {
      // Create the setting if it doesn't exist
      await supabase
        .from('system_settings')
        .insert({
          key: 'company_name',
          value: 'Hebaouf',
          type: 'string'
        });
      
      console.log('Company name setting created as Hebaouf');
    }
  } catch (error) {
    console.error('Error initializing settings:', error);
  }
};

initializeSettings();

createRoot(document.getElementById("root")!).render(<App />);
