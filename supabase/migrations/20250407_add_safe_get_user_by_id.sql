
-- Bu funksiya istifadəçi id əsasında təhlükəsiz şəkildə auth.users tablosundan məlumat əldə edir
CREATE OR REPLACE FUNCTION public.safe_get_user_by_id(user_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_data json;
BEGIN
  SELECT 
    json_build_object(
      'id', u.id,
      'email', u.email,
      'role', u.role,
      'confirmed_at', u.confirmed_at,
      'created_at', u.created_at,
      'updated_at', u.updated_at
    ) INTO user_data
  FROM auth.users u
  WHERE u.id = user_id;
  
  RETURN user_data;
END;
$$;

-- İstifadəçi ID əsasında baza user_roles cədvəlindən rolu əldə etmək üçün funksiya
CREATE OR REPLACE FUNCTION public.get_user_role_by_id(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role::TEXT INTO user_role 
  FROM public.user_roles
  WHERE user_id = $1
  LIMIT 1;
  
  RETURN user_role;
END;
$$;
