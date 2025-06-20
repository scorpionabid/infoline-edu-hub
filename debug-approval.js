// Debug script for approval system
// Bu scripti brauzerdə console-da çalışdırın

async function debugApprovalSystem() {
  console.log('🔍 Debugging Approval System...');
  
  // Test data_entries cədvəlində məlumatları yoxla
  console.log('📊 Checking data_entries table...');
  
  const { data: entries, error } = await supabase
    .from('data_entries')
    .select(`
      id,
      school_id,
      category_id,
      status,
      created_at,
      schools(id, name),
      categories(id, name)
    `)
    .limit(5);
    
  if (error) {
    console.error('❌ Error fetching data entries:', error);
    return;
  }
  
  console.log('✅ Data entries sample:', entries);
  
  if (entries && entries.length > 0) {
    const sampleEntry = entries[0];
    console.log('🎯 Sample entry details:');
    console.log('- ID:', sampleEntry.id);
    console.log('- School ID:', sampleEntry.school_id, '(length:', sampleEntry.school_id?.length, ')');
    console.log('- Category ID:', sampleEntry.category_id, '(length:', sampleEntry.category_id?.length, ')');
    console.log('- Status:', sampleEntry.status);
    
    // Test entryId yaratma
    const testEntryId = `${sampleEntry.school_id}-${sampleEntry.category_id}`;
    console.log('🔗 Generated entryId:', testEntryId);
    
    // Test parse etmə
    const [schoolId, categoryId] = testEntryId.split('-');
    console.log('📝 Parsed IDs:');
    console.log('- School ID:', schoolId, '(length:', schoolId?.length, ')');
    console.log('- Category ID:', categoryId, '(length:', categoryId?.length, ')');
    
    // UUID validasiya test
    const isValidUUID = (str) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(str);
    };
    
    console.log('🎯 UUID Validation:');
    console.log('- School ID valid:', isValidUUID(schoolId));
    console.log('- Category ID valid:', isValidUUID(categoryId));
  }
  
  // Enhanced approval service test
  console.log('🧪 Testing Enhanced Approval Service...');
  
  try {
    // Import etməkdən əvvəl yoxla
    if (typeof EnhancedApprovalService !== 'undefined') {
      const result = await EnhancedApprovalService.getApprovalItems({ status: 'pending' });
      console.log('✅ Service test result:', result);
      
      if (result.success && result.data && result.data.length > 0) {
        const testItem = result.data[0];
        console.log('🎯 Test approval item:', testItem);
        console.log('- Entry ID:', testItem.id);
        console.log('- School ID:', testItem.schoolId);
        console.log('- Category ID:', testItem.categoryId);
      }
    } else {
      console.log('⚠️ EnhancedApprovalService not available in global scope');
    }
  } catch (error) {
    console.error('❌ Service test failed:', error);
  }
}

// Run debug function
debugApprovalSystem();
