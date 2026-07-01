export interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_superuser: boolean;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
}

export interface Agent {
  id: string;
  slug: string;
  name: string;
  description: string;
  long_description: string;
  category: string;
  icon: string;
  price_monthly: number;
  price_onetime: number;
  features: string[];
  tags: string[];
  rating: number;
  reviews_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  plan: "starter" | "pro" | "enterprise";
  status: "active" | "trialing" | "past_due" | "canceled" | "unpaid";
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export interface UsageStats {
  request_count: number;
  limit: number;
  plan: string;
}

export interface AgentRunResponse {
  response: string;
  input_tokens: number;
  output_tokens: number;
  agent_name: string;
}

export interface AdminStats {
  total_users: number;
  active_subscriptions: number;
  total_requests_today: number;
  total_revenue_estimate: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export interface ApiKeyCreated extends ApiKey {
  full_key: string;
}
