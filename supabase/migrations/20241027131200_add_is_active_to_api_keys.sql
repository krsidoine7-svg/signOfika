-- Add is_active column to api_keys table
ALTER TABLE public.api_keys
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Update existing records to be active by default
UPDATE public.api_keys SET is_active = TRUE WHERE is_active IS NULL;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON public.api_keys (is_active);
