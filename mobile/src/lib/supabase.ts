import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Re-using the same keys as the web app for now. 
// In a real production app, use process.env and secure storage.
const supabaseUrl = 'https://wanofaseebdkiaxszhsf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhbm9mYXNlZWJka2lheHN6aHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NTMwMjUsImV4cCI6MjEwMDEyOTAyNX0.WN_jFlUephJYkhdLClThDMVT_NEUx9HmcwF3zlzaDKs';

export const supabase = createClient(supabaseUrl, supabaseKey);
