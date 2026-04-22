
-- translations
CREATE TABLE public.translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  input_type TEXT NOT NULL DEFAULT 'text',
  tone_detected TEXT,
  intent_detected TEXT,
  register_detected TEXT,
  confidence_score INTEGER,
  formality_level INTEGER,
  domain TEXT DEFAULT 'general',
  is_saved BOOLEAN DEFAULT false,
  source_file_name TEXT,
  translator_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own translations"
  ON public.translations FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone insert translations"
  ON public.translations FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users update own translations"
  ON public.translations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own translations"
  ON public.translations FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX translations_user_created_idx ON public.translations(user_id, created_at DESC);
CREATE INDEX translations_session_idx ON public.translations(session_id, created_at DESC);

-- user_settings
CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_source_lang TEXT DEFAULT 'en',
  default_target_lang TEXT DEFAULT 'hi',
  default_formality INTEGER DEFAULT 50,
  default_domain TEXT DEFAULT 'general',
  llm_provider TEXT DEFAULT 'lovable',
  api_key_encrypted TEXT,
  theme TEXT DEFAULT 'dark',
  font_size TEXT DEFAULT 'medium',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own settings"
  ON public.user_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- glossary_terms
CREATE TABLE public.glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_term TEXT NOT NULL,
  target_term TEXT NOT NULL,
  language_pair TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own glossary"
  ON public.glossary_terms FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
