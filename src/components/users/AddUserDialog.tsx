
// shouldCreateSession xəta düzəltməsi

// Bu əvəzinə:
const { error } = await supabase.auth.signUp({
  email,
  password,
  shouldCreateSession: false,
});

// Bunu istifadə edək:
const { error } = await supabase.auth.signUp({
  email,
  password,
  // shouldCreateSession xüsusiyyəti silindi
});
