// Test funksiyası - sector admin data-nı test etmək üçün
import { supabase } from '@/integrations/supabase/client';

export const testSectorAdminData = async (sectorId: string) => {
  console.log('🔍 Testing sector admin data for sector:', sectorId);
  
  try {
    // 1. Test schools in sector
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id, name, completion_rate, status')
      .eq('sector_id', sectorId);
    
    if (schoolsError) throw schoolsError;
    
    console.log('📚 Schools found:', schools?.length || 0);
    schools?.forEach(school => {
      console.log(`  - ${school.name}: ${school.completion_rate || 0}%`);
    });
    
    // 2. Test categories and columns
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        status,
        columns(id, name, is_required, status)
      `)
      .eq('status', 'active');
    
    if (categoriesError) throw categoriesError;
    
    console.log('📋 Active categories found:', categories?.length || 0);
    
    const totalRequiredColumns = categories?.reduce((total, category) => {
      const requiredColumns = category.columns?.filter(col => 
        col.is_required && col.status === 'active'
      ).length || 0;
      console.log(`  - ${category.name}: ${requiredColumns} required columns`);
      return total + requiredColumns;
    }, 0) || 0;
    
    console.log('📊 Total required columns:', totalRequiredColumns);
    
    // 3. Test data entries
    const schoolIds = schools?.map(s => s.id) || [];
    
    if (schoolIds.length > 0) {
      const { data: dataEntries, error: entriesError } = await supabase
        .from('data_entries')
        .select('school_id, status, column_id')
        .in('school_id', schoolIds);
      
      if (entriesError) throw entriesError;
      
      console.log('📝 Data entries found:', dataEntries?.length || 0);
      
      const statusCounts = {
        approved: dataEntries?.filter(e => e.status === 'approved').length || 0,
        pending: dataEntries?.filter(e => e.status === 'pending').length || 0,
        rejected: dataEntries?.filter(e => e.status === 'rejected').length || 0,
      };
      
      console.log('📈 Status breakdown:', statusCounts);
      
      // 4. Calculate completion rate
      const totalPossibleEntries = schoolIds.length * totalRequiredColumns;
      const completionRate = totalPossibleEntries > 0 
        ? Math.round((statusCounts.approved / totalPossibleEntries) * 100)
        : 0;
      
      console.log('🎯 Completion calculation:');
      console.log(`  Schools: ${schoolIds.length}`);
      console.log(`  Required columns per school: ${totalRequiredColumns}`);
      console.log(`  Total possible entries: ${totalPossibleEntries}`);
      console.log(`  Approved entries: ${statusCounts.approved}`);
      console.log(`  Completion rate: ${completionRate}%`);
      
      return {
        schools: schools?.length || 0,
        categories: categories?.length || 0,
        totalRequiredColumns,
        dataEntries: dataEntries?.length || 0,
        statusCounts,
        completionRate,
        totalPossibleEntries
      };
    } else {
      console.log('⚠️ No schools found for this sector');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error testing sector admin data:', error);
    throw error;
  }
};

// Browser console-da test etmək üçün
// Bu kodu browser developer tools console-da çalışdırın:
//
// import { testSectorAdminData } from './utils/testSectorData.ts';
// testSectorAdminData('YOUR_SECTOR_ID_HERE')
//   .then(result => console.log('Test result:', result))
//   .catch(error => console.error('Test failed:', error));
