export interface User {
  id: string;
  name: string;
  email: string;
  type: 'user' | 'provider';
  created_at: string;
  avatar_url?: string;
  stripe_customer_id?: string;
}

export interface Provider {
  id: string;
  user_id: string;
  business_name: string;
  provider_type: ProviderType;
  phone: string;
  location_city: string;
  location_province: string;
  location_lat?: number;
  location_lng?: number;
  description: string;
  tags: string[];
  logo_url?: string;
  sample_images: string[];
  is_active: boolean;
  subscription_status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  event_type: string;
  prompt: string;
  created_at: string;
  checklist_json: any;
  steps: string[];
}

export interface Task {
  id: string;
  event_id: string;
  step_title: string;
  description: string;
  order: number;
  refinement_prompt?: string;
  matching_provider_ids: string[];
}

export interface Lead {
  id: string;
  provider_id: string;
  event_id: string;
  user_id: string;
  step_id: string;
  message: string;
  status: 'new' | 'contacted' | 'booked';
  created_at: string;
}

export type ProviderType = 
  | 'venue'
  | 'catering'
  | 'photographer'
  | 'videographer'
  | 'florist'
  | 'decorator'
  | 'music'
  | 'transportation'
  | 'makeup'
  | 'clothing'
  | 'jewelry'
  | 'invitations'
  | 'other';

export type SubscriptionStatus = 
  | 'active'
  | 'inactive'
  | 'cancelled'
  | 'past_due';