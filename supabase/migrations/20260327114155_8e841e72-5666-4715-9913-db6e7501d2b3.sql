
-- Allow super admins to delete stores
CREATE POLICY "Super admins can delete stores"
ON public.stores FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- Allow super admins to insert stores on behalf of users
CREATE POLICY "Super admins can insert stores"
ON public.stores FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR auth.uid() = owner_id);

-- Function to delete a user (super admin only)
CREATE OR REPLACE FUNCTION public.delete_auth_user(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  -- Delete store data first (cascade handles products etc via store_id FK)
  DELETE FROM public.stores WHERE owner_id = _user_id;
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  -- Delete the auth user
  DELETE FROM auth.users WHERE id = _user_id;
END;
$$;
