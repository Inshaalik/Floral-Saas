import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://raztcxkznbhpbamjlqzr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhenRjeGt6bmJocGJhbWpscXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDc2MTgsImV4cCI6MjA3MTYyMzYxOH0.RWzLhd5nE8XADlBWf0QZDm5aP7iQLUVsvYfCQV0hW1I';


export const supabase = createClient(supabaseUrl, supabaseKey);
