import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Tipos para la base de datos
export interface Case {
  id: string;
  case_number: string;
  title: string;
  defendant: string;
  crime_type: string;
  status: 'active' | 'pending' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  created_at: string;
  updated_at: string;
  next_hearing?: string;
  investigator: string;
  evidence_count: number;
  witness_count: number;
  description?: string;
  user_id: string;
}

export interface Document {
  id: string;
  case_id: string;
  name: string;
  type: string;
  status: 'pending' | 'analyzing' | 'analyzed' | 'reviewed';
  confidence: number;
  summary?: string;
  key_points: string[];
  issues: string[];
  file_url: string;
  created_at: string;
  user_id: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    model_used?: string;
  }>;
  created_at: string;
  updated_at: string;
}