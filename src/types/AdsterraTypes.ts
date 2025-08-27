export interface AdsterraCamera {
  id: string;
  name: string;
  url: string;
  cpm: number;
  country: string;
  device: 'mobile' | 'desktop' | 'all';
  category: string;
  status: 'active' | 'paused' | 'expired';
  impressions: number;
  clicks: number;
  revenue: number;
  createdAt: string;
}

export interface PopunderConfig {
  triggerType: 'click' | 'time' | 'scroll';
  delay: number;
  frequency: 'once' | 'session' | 'always';
  geoTargeting: string[];
  deviceTargeting: string[];
  minCpm: number;
  testMode: boolean;
}

export interface ApiCredentials {
  apiKey: string;
  publisherId: string;
  endpoint: string;
}

export interface GeneratedScript {
  id: string;
  name: string;
  code: string;
  config: PopunderConfig;
  campaigns: AdsterraCamera[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
