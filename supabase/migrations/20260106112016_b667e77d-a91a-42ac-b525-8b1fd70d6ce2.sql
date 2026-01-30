-- Update handle_new_user() to accept institution_id from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, institution_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'institution_id' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'institution_id')::uuid 
      ELSE NULL 
    END
  );
  RETURN NEW;
END;
$$;