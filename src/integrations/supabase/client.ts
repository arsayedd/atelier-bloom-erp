// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://meogjcapbqizdpfrlamq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lb2dqY2FwYnFpemRwZnJsYW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0OTgxNjMsImV4cCI6MjA2MjA3NDE2M30.Ez76dmt24H6MoObWw8kLPQRh-QMWMPhCJsxD1eG1oXE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);