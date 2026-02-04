-- Create voice_recordings table for storing user voice prompts
CREATE TABLE public.voice_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration_seconds NUMERIC,
  transcription TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'transcribed', 'sent', 'error')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_recordings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own voice recordings"
  ON public.voice_recordings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice recordings"
  ON public.voice_recordings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice recordings"
  ON public.voice_recordings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice recordings"
  ON public.voice_recordings FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for voice recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('voice-recordings', 'voice-recordings', false);

-- Storage policies for voice recordings
CREATE POLICY "Users can upload their own voice recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'voice-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own voice recordings"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'voice-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own voice recordings"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'voice-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);