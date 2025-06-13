/**
 * UUID Validator Test Script
 * 
 * Bu fayl UUID validation funksiyalarını test etmək üçündür.
 * Konsola test nəticələrini çıxarır.
 */

import { isValidUUID, getSafeUUID, getUUIDOrDefault } from '../uuidValidator';

// Test valid UUIDs
const validUUIDs = [
  '123e4567-e89b-12d3-a456-426614174000',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '00000000-0000-4000-a000-000000000000'
];

// Test invalid UUIDs
const invalidUUIDs = [
  'system',                                  // String that caused our error
  '123456',                                  // Too short
  'not-a-uuid',                              // Wrong format
  '123e4567-e89b-12d3-a456-42661417400',     // Missing character
  '123e4567-e89b-12d3-a456-4266141740000',   // Extra character
  null,                                      // null
  undefined                                  // undefined
];

console.log('=== UUID Validator Test ===');

// Test isValidUUID function
console.log('\n1. Testing isValidUUID function:');
console.log('Valid UUIDs should return true:');
validUUIDs.forEach(uuid => {
  console.log(`  "${uuid}": ${isValidUUID(uuid)}`);
});

console.log('\nInvalid UUIDs should return false:');
invalidUUIDs.forEach(uuid => {
  // @ts-ignore - intentionally testing with null/undefined
  console.log(`  "${uuid}": ${isValidUUID(uuid)}`);
});

// Test getSafeUUID function
console.log('\n2. Testing getSafeUUID function:');
console.log('Valid UUIDs should return the same UUID:');
validUUIDs.forEach(uuid => {
  console.log(`  "${uuid}" => "${getSafeUUID(uuid)}"`);
});

console.log('\nInvalid UUIDs should return null:');
invalidUUIDs.forEach(uuid => {
  // @ts-ignore - intentionally testing with null/undefined
  console.log(`  "${uuid}" => "${getSafeUUID(uuid, false)}"`);
});

// Test getUUIDOrDefault function
console.log('\n3. Testing getUUIDOrDefault function:');
console.log('Valid UUIDs should return the same UUID:');
validUUIDs.forEach(uuid => {
  console.log(`  "${uuid}" => "${getUUIDOrDefault(uuid, 'default-value')}"`);
});

console.log('\nInvalid UUIDs should return the default value:');
invalidUUIDs.forEach(uuid => {
  // @ts-ignore - intentionally testing with null/undefined
  console.log(`  "${uuid}" => "${getUUIDOrDefault(uuid, 'default-value')}"`);
});

console.log('\n=== Test Complete ===');

// Export a dummy function to make TypeScript happy
export const runTests = () => {
  console.log('Running UUID validator tests...');
};
