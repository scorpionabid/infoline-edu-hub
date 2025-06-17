
// Organization translation module
export const organization = {
  // Basic terms
  organization: 'Təşkilat',
  organizations: 'Təşkilatlar',
  
  // Properties
  name: 'Ad',
  type: 'Tip',
  status: 'Status'
} as const;

export type Organization = typeof organization;
export default organization;
