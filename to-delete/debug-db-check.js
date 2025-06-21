// Debug Script - Supabase DB məlumatlarını yoxlamaq üçün
// Browser console-da işləməyə nəzərdə tutulmuşdur

// Test 1: Schools cədvəlini yoxlayaq
console.log('=== DB DEBUG CHECK ===');

async function checkDatabase() {
  try {
    console.log('1. Checking schools table...');
    
    // Schools cədvəlindəki bütün məlumatları əldə et
    const { data: allSchools, error: schoolsError } = await supabase
      .from('schools')
      .select('*');
    
    console.log('Schools query result:', { 
      data: allSchools, 
      error: schoolsError,
      count: allSchools?.length || 0 
    });
    
    if (allSchools && allSchools.length > 0) {
      console.log('Sample school:', allSchools[0]);
    }
    
    console.log('2. Checking sectors table...');
    
    // Sectors cədvəlini yoxlayaq
    const { data: allSectors, error: sectorsError } = await supabase
      .from('sectors')
      .select('*');
    
    console.log('Sectors query result:', { 
      data: allSectors, 
      error: sectorsError,
      count: allSectors?.length || 0 
    });
    
    console.log('3. Checking regions table...');
    
    // Regions cədvəlini yoxlayaq
    const { data: allRegions, error: regionsError } = await supabase
      .from('regions')
      .select('*');
    
    console.log('Regions query result:', { 
      data: allRegions, 
      error: regionsError,
      count: allRegions?.length || 0 
    });
    
    console.log('4. Checking user roles...');
    
    // User roles-u yoxlayaq
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');
    
    console.log('User roles query result:', { 
      data: userRoles, 
      error: rolesError,
      count: userRoles?.length || 0 
    });
    
    // Cari istifadəçinin məlumatlarını əldə et
    console.log('5. Checking current user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Current auth user:', { user, error: userError });
    
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            role,
            region_id,
            sector_id,
            school_id
          )
        `)
        .eq('id', user.id)
        .single();
      
      console.log('Current user profile:', { profile, error: profileError });
    }
    
  } catch (error) {
    console.error('Debug check error:', error);
  }
}

// Insert test data function
async function insertTestData() {
  try {
    console.log('=== INSERTING TEST DATA ===');
    
    // 1. Region əlavə et (əgər yoxdursa)
    const { data: existingRegions } = await supabase
      .from('regions')
      .select('*')
      .limit(1);
    
    let regionId;
    if (!existingRegions || existingRegions.length === 0) {
      console.log('Creating test region...');
      const { data: newRegion, error: regionError } = await supabase
        .from('regions')
        .insert({
          name: 'Test Region',
          description: 'Test region for development',
          status: 'active'
        })
        .select()
        .single();
      
      if (regionError) throw regionError;
      regionId = newRegion.id;
      console.log('Created region:', newRegion);
    } else {
      regionId = existingRegions[0].id;
      console.log('Using existing region:', existingRegions[0]);
    }
    
    // 2. Sector əlavə et (əgər yoxdursa)
    const { data: existingSectors } = await supabase
      .from('sectors')
      .select('*')
      .eq('region_id', regionId)
      .limit(1);
    
    let sectorId;
    if (!existingSectors || existingSectors.length === 0) {
      console.log('Creating test sector...');
      const { data: newSector, error: sectorError } = await supabase
        .from('sectors')
        .insert({
          name: 'Test Sector',
          description: 'Test sector for development',
          region_id: regionId,
          status: 'active'
        })
        .select()
        .single();
      
      if (sectorError) throw sectorError;
      sectorId = newSector.id;
      console.log('Created sector:', newSector);
    } else {
      sectorId = existingSectors[0].id;
      console.log('Using existing sector:', existingSectors[0]);
    }
    
    // 3. Test schools əlavə et
    const { data: existingSchools } = await supabase
      .from('schools')
      .select('*')
      .eq('sector_id', sectorId);
    
    if (!existingSchools || existingSchools.length === 0) {
      console.log('Creating test schools...');
      
      const testSchools = [
        {
          name: 'Test Məktəb 1',
          region_id: regionId,
          sector_id: sectorId,
          principal_name: 'Test Direktor 1',
          address: 'Test ünvan 1',
          phone: '+994501234567',
          email: 'school1@test.com',
          student_count: 250,
          teacher_count: 25,
          status: 'active',
          type: 'tam orta',
          language: 'Azərbaycan',
          completion_rate: 45
        },
        {
          name: 'Test Məktəb 2',
          region_id: regionId,
          sector_id: sectorId,
          principal_name: 'Test Direktor 2',
          address: 'Test ünvan 2',
          phone: '+994501234568',
          email: 'school2@test.com',
          student_count: 180,
          teacher_count: 18,
          status: 'active',
          type: 'tam orta',
          language: 'Azərbaycan',
          completion_rate: 72
        },
        {
          name: 'Test Məktəb 3',
          region_id: regionId,
          sector_id: sectorId,
          principal_name: 'Test Direktor 3',
          address: 'Test ünvan 3',
          phone: '+994501234569',
          email: 'school3@test.com',
          student_count: 320,
          teacher_count: 32,
          status: 'active',
          type: 'tam orta',
          language: 'Azərbaycan',
          completion_rate: 88
        }
      ];
      
      const { data: newSchools, error: schoolsError } = await supabase
        .from('schools')
        .insert(testSchools)
        .select();
      
      if (schoolsError) throw schoolsError;
      console.log('Created schools:', newSchools);
    } else {
      console.log('Schools already exist:', existingSchools);
    }
    
    // 4. Current user-a sector admin rolu ver (əgər yoxdursa)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (!existingRole) {
        console.log('Creating user role...');
        const { data: newRole, error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'sectoradmin',
            sector_id: sectorId,
            region_id: regionId
          })
          .select()
          .single();
        
        if (roleError) throw roleError;
        console.log('Created user role:', newRole);
      } else {
        console.log('User role already exists:', existingRole);
        
        // Əgər sector_id null-dursa, yenilə
        if (!existingRole.sector_id) {
          const { data: updatedRole, error: updateError } = await supabase
            .from('user_roles')
            .update({
              sector_id: sectorId,
              region_id: regionId
            })
            .eq('user_id', user.id)
            .select()
            .single();
          
          if (updateError) throw updateError;
          console.log('Updated user role:', updatedRole);
        }
      }
    }
    
    console.log('=== TEST DATA SETUP COMPLETE ===');
    
  } catch (error) {
    console.error('Insert test data error:', error);
  }
}

// Console-da çalışdırmaq üçün:
// 1. checkDatabase() - mövcud məlumatları yoxlamaq üçün
// 2. insertTestData() - test məlumatları əlavə etmək üçün

console.log('Available functions:');
console.log('- checkDatabase(): Check current database state');
console.log('- insertTestData(): Insert test data if missing');
console.log('Run these functions in browser console');

// Export functions to global scope
window.checkDatabase = checkDatabase;
window.insertTestData = insertTestData;
