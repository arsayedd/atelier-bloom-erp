
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize with Hebaouf as the company name
import { supabase } from '@/integrations/supabase/client';
const initializeSettings = async () => {
  // Check if company name exists and update it if needed
  const { data } = await supabase
    .from('system_settings')
    .select('*')
    .eq('key', 'company_name')
    .single();
  
  if (data) {
    await supabase
      .from('system_settings')
      .update({ value: 'Hebaouf' })
      .eq('key', 'company_name');
  }
};

initializeSettings().catch(console.error);

createRoot(document.getElementById("root")!).render(<App />);
