// ================================
// MINIGAME MAYHEM - ACCOUNTS
// ================================

// Supabase connection
const SUPABASE_URL = "https://pbvibpxgandnratdcxep.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_MIuMoqdA0X-1VGUMAvIROg_B6vIvI8t";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


// ================================
// HELPER FUNCTIONS
// ================================

function showMessage(message, isError = false) {
  const messageBox = document.getElementById("auth-message");

  if (!messageBox) return;

  messageBox.textContent = message;
  messageBox.style.color = isError ? "#d93025" : "#333";
}


// ================================
// SWITCH LOGIN / SIGNUP
// ================================

function showLogin() {
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("login-form").style.display = "block";
  showMessage("");
}

function showSignup() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("signup-form").style.display = "block";
  showMessage("");
}


// ================================
// CREATE ACCOUNT
// ================================

async function signUp() {
  const username = document.getElementById("signup-username").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  if (!username || !email || !password) {
    showMessage("Please fill out everything.", true);
    return;
  }

  if (username.length < 3) {
    showMessage("Username must be at least 3 characters.", true);
    return;
  }

  if (password.length < 6) {
    showMessage("Password must be at least 6 characters.", true);
    return;
  }

  showMessage("Creating your account...");

  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password
  });

  if (error) {
    showMessage(error.message, true);
    return;
  }

  // If email confirmation is disabled, we can create the profile immediately.
  if (data.session && data.user) {
    const { error: profileError } = await supabaseClient
      .from("players")
      .insert({
        id: data.user.id,
        username: username,
        coins: 500,
        xp: 0,
        level: 1,
        avatar: "default",
        title: "Newbie",
        name_effect: "none",
        owned_cosmetics: []
      });

    if (profileError) {
      showMessage("Account created, but profile setup failed: " + profileError.message, true);
      return;
    }

    showMessage("Account created! Loading your profile...");
    await loadProfile();
    return;
  }

  // If email confirmation is enabled.
  showMessage("Account created! Check your email to confirm your account, then log in.");
}


// ================================
// LOG IN
// ================================

async function logIn() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    showMessage("Please enter your email and password.", true);
    return;
  }

  showMessage("Logging in...");

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    showMessage(error.message, true);
    return;
  }

  if (!data.user) {
    showMessage("Login failed. Please try again.", true);
    return;
  }

  showMessage("Logged in! Loading your profile...");
  await loadProfile();
}


// ================================
// LOAD PLAYER PROFILE
// ================================

async function loadProfile() {
  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  if (!user) {
    return;
  }

  let { data: profile, error } = await supabaseClient
    .from("players")
    .select("*")
    .eq("id", user.id)
    .single();

  // If the account exists but the profile doesn't,
  // create the profile now.
  if (error || !profile) {
    const username =
      document.getElementById("signup-username")?.value.trim() ||
      "Player" + Math.floor(Math.random() * 10000);

    const { data: newProfile, error: createError } = await supabaseClient
      .from("players")
      .insert({
        id: user.id,
        username: username,
        coins: 500,
        xp: 0,
        level: 1,
        avatar: "default",
        title: "Newbie",
        name_effect: "none",
        owned_cosmetics: []
      })
      .select()
      .single();

    if (createError) {
      showMessage("Could not load your profile: " + createError.message, true);
      return;
    }

    profile = newProfile;
  }

  // Update the game hub.
  document.getElementById("player-name").textContent = profile.username;
  document.getElementById("player-title").textContent = profile.title;

  const coinDisplay = document.getElementById("coin-display");
  if (coinDisplay) {
    coinDisplay.textContent = profile.coins.toLocaleString();
  }

  const levelDisplay = document.getElementById("level-display");
  if (levelDisplay) {
    levelDisplay.textContent = "LVL " + profile.level;
  }

  // Hide login screen and show the game hub.
  document.getElementById("auth-screen").style.display = "none";
  document.getElementById("game-hub").style.display = "block";
}


// ================================
// CHECK IF ALREADY LOGGED IN
// ================================

async function checkLogin() {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session) {
    await loadProfile();
  }
}


// ================================
// STARTUP
// ================================

checkLogin();


// Keep the page updated if the login state changes.
supabaseClient.auth.onAuthStateChange(async (event, session) => {
  if (session) {
    await loadProfile();
  }
});
