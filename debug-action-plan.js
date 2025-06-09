// Deep Debug Plan for Select Options Issue
// Məqsəd: Select tipli sütunların options-larının UI-da görünməməsinin səbəbini tapmaq

export const debugOptionsIssue = () => {
  console.group('🔍 SELECT OPTIONS DEBUG PLAN');
  
  // PHASE 1: DATA TRACING
  console.group('📊 Phase 1: Data Flow Tracing');
  console.log('1.1 Supabase DB → Raw response');
  console.log('1.2 useColumnsQuery → Parse & transform');
  console.log('1.3 useUnifiedDataEntry → Re-transform');
  console.log('1.4 SchoolDataEntryManager → Manual select render');
  console.log('1.5 FormFieldComponent → shadcn/ui Select');
  console.groupEnd();

  // PHASE 2: POTENTIAL ISSUES
  console.group('⚠️ Phase 2: Potential Issues');
  console.log('2.1 JSON Parse error silently failing');
  console.log('2.2 Multiple transformations corrupting data');
  console.log('2.3 Different hooks used in different places');
  console.log('2.4 React rendering not updating with new data');
  console.log('2.5 Shadcn Select component not receiving proper props');
  console.groupEnd();

  // PHASE 3: DEBUG STRATEGY
  console.group('🛠️ Phase 3: Debug Strategy');
  console.log('3.1 Add console.logs at each transformation step');
  console.log('3.2 Check network tab for raw Supabase response');
  console.log('3.3 Verify data consistency across hooks');
  console.log('3.4 Test with minimal isolated component');
  console.log('3.5 Compare working vs non-working paths');
  console.groupEnd();

  console.groupEnd();
};

// DETAILED ACTION PLAN
export const debugActionPlan = {
  immediate: [
    '1. Add debug logs to useColumnsQuery options parse',
    '2. Add debug logs to useUnifiedDataEntry options transform', 
    '3. Add debug logs to FormFieldComponent options render',
    '4. Check browser Network tab for raw response',
    '5. Compare SchoolDataEntryManager manual vs FormFieldComponent'
  ],
  investigation: [
    '1. Verify which components use which hooks',
    '2. Check if multiple transforms corrupt data',
    '3. Test isolated select component with known good data',
    '4. Verify ColumnOption interface compatibility',
    '5. Check React dev tools for prop values'
  ],
  solutions: [
    '1. Fix JSON parse error handling',
    '2. Standardize options transformation',
    '3. Remove duplicate/conflicting transforms',
    '4. Create consistent options parsing utility',
    '5. Fix React key/render issues'
  ]
};

// HYPOTHESIS RANKING (most likely to least)
export const problemHypotheses = [
  {
    rank: 1,
    issue: 'JSON parse error or null options',
    likelihood: 'HIGH',
    evidence: 'Common with JSONB fields from Supabase',
    test: 'Add try-catch around JSON.parse with fallback'
  },
  {
    rank: 2, 
    issue: 'Multiple hook transforms corrupting data',
    likelihood: 'HIGH',
    evidence: 'Two different transformation chains seen',
    test: 'Compare useColumnsQuery vs useUnifiedDataEntry output'
  },
  {
    rank: 3,
    issue: 'SchoolDataEntryManager using manual select instead of FormFieldComponent',
    likelihood: 'MEDIUM',
    evidence: 'Code shows manual select rendering',
    test: 'Switch to FormFieldComponent and test'
  },
  {
    rank: 4,
    issue: 'React not re-rendering after data load',
    likelihood: 'MEDIUM', 
    evidence: 'Async data loading timing issue',
    test: 'Check React dev tools for prop updates'
  },
  {
    rank: 5,
    issue: 'Shadcn Select component prop issue',
    likelihood: 'LOW',
    evidence: 'Component works elsewhere in codebase',
    test: 'Test with plain HTML select'
  }
];

export default {
  debugOptionsIssue,
  debugActionPlan,
  problemHypotheses
};
