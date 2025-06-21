// Debug script for select options issue
// Bu fayl problemi debug etmək üçün yaradılıb

console.log('=== OPTIONS DEBUG SCRIPT ===');

// 1. DB-dən gələn raw data nümunəsi (Supabase-dən)
const rawDBColumn = {
  id: "0c5f2a7f-7ddb-404c-82e7-e73f7361871a",
  name: "Binanin vaziyyəti (ala, yaxşı, təmirə ehtiyacı var)",
  type: "select",
  options: `[{"label":"Yola bilər","value":"yola_biler"},{"label":"Yoluna","value":"yoluna"}]`
  // Bu string formatında gəlir
};

console.log('1. Raw DB data:');
console.log('  options type:', typeof rawDBColumn.options);
console.log('  options value:', rawDBColumn.options);

// 2. useColumnsQuery-də parse
try {
  const parsedInUseColumnsQuery = typeof rawDBColumn.options === 'string' 
    ? JSON.parse(rawDBColumn.options) 
    : (rawDBColumn.options || []);
  
  console.log('2. useColumnsQuery parse result:');
  console.log('  parsed type:', typeof parsedInUseColumnsQuery);
  console.log('  parsed value:', parsedInUseColumnsQuery);
  console.log('  is array:', Array.isArray(parsedInUseColumnsQuery));
} catch (error) {
  console.log('2. useColumnsQuery parse ERROR:', error);
}

// 3. useUnifiedDataEntry-də transform
const transformOptionsInUnified = (col) => {
  const options = Array.isArray(col.options) ? col.options.map((opt) => {
    if (typeof opt === 'string') {
      return { id: opt, label: opt, value: opt };
    }
    return opt;
  }) : [];
  
  return options;
};

console.log('3. useUnifiedDataEntry transform:');
const transformedOptions = transformOptionsInUnified({
  options: typeof rawDBColumn.options === 'string' 
    ? JSON.parse(rawDBColumn.options) 
    : (rawDBColumn.options || [])
});
console.log('  transformed:', transformedOptions);

// 4. FormFieldComponent beklediyi format
console.log('4. FormFieldComponent expects:');
console.log('  column.options?.map((option) => ...)');
console.log('  option.value and option.label should exist');

// 5. Problem analizi
console.log('5. PROBLEM ANALYSIS:');

const realDBData = `[{"label":"Yola bilər","value":"yola_biler"},{"label":"Yoluna","value":"yoluna"}]`;
const parsed = JSON.parse(realDBData);
console.log('  Real parsed options:', parsed);
console.log('  First option:', parsed[0]);
console.log('  Has value?', 'value' in parsed[0]);
console.log('  Has label?', 'label' in parsed[0]);

// 6. Test FormFieldComponent logic
const testColumn = {
  id: "test",
  name: "Test Select",
  type: "select",
  options: parsed
};

console.log('6. TEST FormFieldComponent:');
console.log('  Column for render:', testColumn);
console.log('  Options map test:');
testColumn.options?.forEach((option, index) => {
  console.log(`    [${index}] key: ${option.value}, value: ${option.value}, label: ${option.label}`);
});

// 7. SUSPICIONS (şübhələr)
console.log('7. POSSIBLE ISSUES:');
console.log('  A) JSON parse uğursuz?');
console.log('  B) Transform uğursuz?');
console.log('  C) FormFieldComponent düzgün render etmir?');
console.log('  D) Different hook used in different components?');
console.log('  E) React key/render issue?');

// 8. Network request test
console.log('8. NETWORK DEBUG:');
console.log('  Check browser Network tab for:');
console.log('  - /rest/v1/columns?category_id=...');
console.log('  - Response body options field');
console.log('  - Whether string or already parsed JSON');

console.log('=== DEBUG SCRIPT END ===');
