import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SwotData = {
  strengths: Array<{ id: string; description: string }>;
  weaknesses: Array<{ id: string; description: string }>;
  opportunities: Array<{ id: string; description: string }>;
  threats: Array<{ id: string; description: string }>;
};

export type MatrixData = {
  ifeFactors: Array<{ id: string; description: string; weight: number; rating: number }>;
  efeFactors: Array<{ id: string; description: string; weight: number; rating: number }>;
};

export type KsfData = {
  ksfItems: Array<{ id: string; description: string; target: string; measure: string }>;
}; 