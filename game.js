// supabase connection

const SUPABASE_URL = "https://pbvibpxgandnratdcxep.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_MIuMoqdA0X-1VGUMAvIROg_B6vIvI8t";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const testConnection = async () => {
  const { data, error } = await supabaseClient
    .from("players")
    .select("id")
    .limit(1);

  if (error) {
    alert("Supabase error: " + error.message);
    return;
  }

  alert("🎉 Supabase is connected! The players table is reachable.");
};

alert("JavaScript is running!");
