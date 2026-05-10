-- Matches table (connections between profiles)
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('liked', 'matched', 'rejected', 'shortlisted')) DEFAULT 'liked',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, matched_user_id),
  CHECK (user_id != matched_user_id)
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view matches involving them"
  ON public.matches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users can create matches"
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches"
  ON public.matches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users can delete their own matches"
  ON public.matches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Horoscope details table
CREATE TABLE public.horoscope_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  rasi TEXT,
  nakshatram TEXT,
  padham TEXT,
  dosham TEXT,
  remedies TEXT,
  birth_time TIME,
  birth_location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.horoscope_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view horoscope details"
  ON public.horoscope_details FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR true);

CREATE POLICY "Users can insert own horoscope"
  ON public.horoscope_details FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own horoscope"
  ON public.horoscope_details FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own horoscope"
  ON public.horoscope_details FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_matches_user_id ON public.matches(user_id);
CREATE INDEX idx_matches_matched_user_id ON public.matches(matched_user_id);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_horoscope_user_id ON public.horoscope_details(user_id);

-- Updated_at trigger for matches
CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Updated_at trigger for horoscope_details
CREATE TRIGGER horoscope_details_updated_at
  BEFORE UPDATE ON public.horoscope_details
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
