
import { createClient } from '@supabase/supabase-js';

// Supabase bağlantısı üçün mühit dəyişənləri
const supabaseUrl = "https://olbfnauhzpdskqnxtwav.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sYmZuYXVoenBkc2txbnh0d2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODQwNzksImV4cCI6MjA1ODM2MDA3OX0.OfoO5lPaFGPm0jMqAQzYCcCamSaSr6E1dF8i4rLcXj4";

// Verilənlər bazası ilə işləmək üçün tək supabase müştərisi yaradırıq
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
