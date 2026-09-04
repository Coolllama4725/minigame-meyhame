// supabase connection

const SUPABASE_URL = "https://pbvibpxgandnratdcxep.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_MIuMoqdA0X-1VGUMAvIROg_B6vIvI8t";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
