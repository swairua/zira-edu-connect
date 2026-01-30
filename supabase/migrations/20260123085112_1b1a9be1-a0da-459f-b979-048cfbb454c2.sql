-- Create function to generate admission numbers
CREATE OR REPLACE FUNCTION public.generate_admission_number(
  _institution_id uuid
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _institution RECORD;
  _config JSONB;
  _next_seq INTEGER;
  _prefix TEXT;
  _year TEXT;
  _separator TEXT;
  _padding INTEGER;
  _result TEXT;
BEGIN
  -- Get institution and settings
  SELECT code, settings INTO _institution
  FROM institutions WHERE id = _institution_id;
  
  _config := COALESCE(_institution.settings->'admission_number_config', '{}'::jsonb);
  
  -- Get or initialize sequence
  _next_seq := COALESCE((_config->>'next_sequence')::integer, 1);
  
  -- Build components
  _prefix := COALESCE(NULLIF(_config->>'prefix', ''), _institution.code, 'STU');
  _separator := COALESCE(_config->>'separator', '/');
  _padding := COALESCE((_config->>'sequence_padding')::integer, 3);
  
  -- Year handling
  IF COALESCE((_config->>'include_year')::boolean, true) THEN
    IF _config->>'year_format' = 'short' THEN
      _year := TO_CHAR(CURRENT_DATE, 'YY');
    ELSE
      _year := TO_CHAR(CURRENT_DATE, 'YYYY');
    END IF;
  END IF;
  
  -- Build admission number based on format
  CASE _config->>'format'
    WHEN 'year_prefix_seq' THEN
      _result := _year || _separator || _prefix || _separator || LPAD(_next_seq::text, _padding, '0');
    WHEN 'prefix_seq' THEN
      _result := _prefix || _separator || LPAD(_next_seq::text, _padding, '0');
    ELSE -- 'prefix_year_seq' (default)
      IF _year IS NOT NULL THEN
        _result := _prefix || _separator || _year || _separator || LPAD(_next_seq::text, _padding, '0');
      ELSE
        _result := _prefix || _separator || LPAD(_next_seq::text, _padding, '0');
      END IF;
  END CASE;
  
  -- Increment sequence
  UPDATE institutions
  SET settings = jsonb_set(
    COALESCE(settings, '{}'::jsonb),
    '{admission_number_config,next_sequence}',
    to_jsonb(_next_seq + 1)
  )
  WHERE id = _institution_id;
  
  RETURN _result;
END;
$$;

-- Create function to preview admission number (without incrementing)
CREATE OR REPLACE FUNCTION public.preview_admission_number(
  _institution_id uuid
) RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _institution RECORD;
  _config JSONB;
  _next_seq INTEGER;
  _prefix TEXT;
  _year TEXT;
  _separator TEXT;
  _padding INTEGER;
  _result TEXT;
BEGIN
  -- Get institution and settings
  SELECT code, settings INTO _institution
  FROM institutions WHERE id = _institution_id;
  
  _config := COALESCE(_institution.settings->'admission_number_config', '{}'::jsonb);
  
  -- Get current sequence
  _next_seq := COALESCE((_config->>'next_sequence')::integer, 1);
  
  -- Build components
  _prefix := COALESCE(NULLIF(_config->>'prefix', ''), _institution.code, 'STU');
  _separator := COALESCE(_config->>'separator', '/');
  _padding := COALESCE((_config->>'sequence_padding')::integer, 3);
  
  -- Year handling
  IF COALESCE((_config->>'include_year')::boolean, true) THEN
    IF _config->>'year_format' = 'short' THEN
      _year := TO_CHAR(CURRENT_DATE, 'YY');
    ELSE
      _year := TO_CHAR(CURRENT_DATE, 'YYYY');
    END IF;
  END IF;
  
  -- Build admission number based on format
  CASE _config->>'format'
    WHEN 'year_prefix_seq' THEN
      _result := _year || _separator || _prefix || _separator || LPAD(_next_seq::text, _padding, '0');
    WHEN 'prefix_seq' THEN
      _result := _prefix || _separator || LPAD(_next_seq::text, _padding, '0');
    ELSE -- 'prefix_year_seq' (default)
      IF _year IS NOT NULL THEN
        _result := _prefix || _separator || _year || _separator || LPAD(_next_seq::text, _padding, '0');
      ELSE
        _result := _prefix || _separator || LPAD(_next_seq::text, _padding, '0');
      END IF;
  END CASE;
  
  RETURN _result;
END;
$$;