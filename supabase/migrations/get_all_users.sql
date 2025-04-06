
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  raw_user_meta_data jsonb,
  is_admin boolean
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    au.created_at,
    au.raw_user_meta_data,
    EXISTS (
      SELECT 1 
      FROM auth.users_admin_roles 
      WHERE user_id = au.id
    ) as is_admin
  FROM auth.users au
  WHERE au.confirmed_at IS NOT NULL
  ORDER BY au.created_at DESC;
END;
$$;

-- Grant execute permissions to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_users() TO anon;
