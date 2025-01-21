import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ovcmxpjcvtjosivydhmz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92Y214cGpjdnRqb3NpdnlkaG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwODQwNTgsImV4cCI6MjA1MjY2MDA1OH0.lrgosBswhobQYxWw4vexjZelE8Dkgd1jRDugTzB_zG4";

export const supabase = createClient(supabaseUrl, supabaseKey);