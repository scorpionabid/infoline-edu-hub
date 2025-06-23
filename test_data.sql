-- Test data for InfoLine approval system
-- Bu skript test məlumatları əlavə edir ki, sistem düzgün işləsin

-- 1. Sample data entries əlavə et (əgər mövcud deyilsə)
INSERT INTO public.data_entries (
    id,
    school_id, 
    category_id,
    column_id,
    value,
    status,
    created_by,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid() as id,
    s.id as school_id,
    c.id as category_id,
    col.id as column_id,
    CASE 
        WHEN col.type = 'text' THEN 'Sample text value'
        WHEN col.type = 'number' THEN '100'
        WHEN col.type = 'date' THEN '2024-12-20'
        ELSE 'Sample value'
    END as value,
    'pending' as status,
    (SELECT id FROM auth.users LIMIT 1) as created_by,
    now() as created_at,
    now() as updated_at
FROM public.schools s
CROSS JOIN public.categories c  
CROSS JOIN public.columns col
WHERE s.status = 'active' 
  AND c.status = 'active' 
  AND col.status = 'active'
  AND col.category_id = c.id
  AND NOT EXISTS (
    SELECT 1 FROM public.data_entries de 
    WHERE de.school_id = s.id 
      AND de.category_id = c.id 
      AND de.column_id = col.id
  )
LIMIT 20; -- Add only 20 sample entries

-- 2. Update school completion rates
UPDATE public.schools 
SET completion_rate = (
    SELECT CASE 
        WHEN total_columns > 0 
        THEN (filled_columns::float / total_columns::float * 100)::integer
        ELSE 0 
    END
    FROM (
        SELECT 
            COUNT(DISTINCT col.id) as total_columns,
            COUNT(DISTINCT de.column_id) as filled_columns
        FROM public.columns col
        JOIN public.categories c ON col.category_id = c.id
        LEFT JOIN public.data_entries de ON de.column_id = col.id 
            AND de.school_id = schools.id
            AND de.value IS NOT NULL 
            AND de.value != ''
        WHERE c.status = 'active' AND col.status = 'active'
    ) calc
)
WHERE schools.status = 'active';

-- 3. Add sample status history entries
INSERT INTO public.status_transition_log (
    data_entry_id,
    old_status,
    new_status,
    comment,
    changed_by,
    changed_at
)
SELECT 
    CONCAT(school_id, '-', category_id) as data_entry_id,
    'draft' as old_status,
    'pending' as new_status,
    'Initial submission' as comment,
    created_by as changed_by,
    created_at as changed_at
FROM (
    SELECT DISTINCT 
        school_id, 
        category_id, 
        created_by, 
        created_at
    FROM public.data_entries
    WHERE status = 'pending'
    LIMIT 10
) de
WHERE NOT EXISTS (
    SELECT 1 FROM public.status_transition_log stl
    WHERE stl.data_entry_id = CONCAT(de.school_id, '-', de.category_id)
);

-- 4. Verify views work
SELECT COUNT(*) as status_history_count FROM public.status_history_view;
SELECT COUNT(*) as approval_data_count FROM public.approval_data_view;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Test data added successfully!';
    RAISE NOTICE 'You can now test the approval system';
END;
$$;
