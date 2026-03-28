
-- Add super_admin management policies for user_roles
CREATE POLICY "Super admins can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- Allow super_admins to also view all stores
CREATE POLICY "Super admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

-- Drop the old select policy that only allowed admins
DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;

-- Create a function to list users (for super admin panel)
CREATE OR REPLACE FUNCTION public.list_auth_users()
RETURNS TABLE(id uuid, email text, created_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.id, au.email::text, au.created_at
  FROM auth.users au
  ORDER BY au.created_at DESC
$$;
