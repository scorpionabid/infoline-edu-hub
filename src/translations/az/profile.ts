
// Profile translation module
export const profile = {
  // Basic terms
  profile: 'Profil',
  my_profile: 'Mənim profilim',
  
  // Actions
  edit_profile: 'Profili redaktə et',
  save_profile: 'Profili saxla',
  
  // Fields
  name: 'Ad',
  email: 'E-poçt',
  phone: 'Telefon'
} as const;

export type Profile = typeof profile;
export default profile;
