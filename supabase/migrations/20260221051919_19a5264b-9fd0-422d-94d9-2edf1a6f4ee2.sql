
-- Create triage sessions table
CREATE TABLE public.triage_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_text TEXT NOT NULL,
  processed_symptoms JSONB,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('GREEN', 'YELLOW', 'RED')),
  confidence_score INTEGER NOT NULL DEFAULT 0,
  rules_triggered JSONB,
  recommendation TEXT,
  model_version TEXT DEFAULT 'rule_engine_v1',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.triage_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (no auth required for emergency triage)
CREATE POLICY "Anyone can create triage sessions" ON public.triage_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read own session" ON public.triage_sessions
  FOR SELECT USING (true);

-- Create accident risk sessions table
CREATE TABLE public.accident_risk_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  time_of_day TEXT,
  weather TEXT,
  traffic_density TEXT,
  risk_percentage INTEGER NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH')),
  factors JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.accident_risk_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create accident risk sessions" ON public.accident_risk_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read accident risk sessions" ON public.accident_risk_sessions
  FOR SELECT USING (true);

-- Create audit logs table (immutable)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  action_type TEXT NOT NULL CHECK (action_type IN ('TRIAGE', 'ACCIDENT_RISK', 'EMERGENCY_TRIGGER', 'OVERRIDE')),
  risk_level TEXT,
  decision_path JSONB,
  rule_triggered TEXT,
  override_flag BOOLEAN DEFAULT false,
  model_version TEXT DEFAULT 'rule_engine_v1',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read audit logs" ON public.audit_logs
  FOR SELECT USING (true);

-- Prevent updates and deletes on audit logs (immutable)
CREATE POLICY "No updates on audit logs" ON public.audit_logs
  FOR UPDATE USING (false);

CREATE POLICY "No deletes on audit logs" ON public.audit_logs
  FOR DELETE USING (false);
