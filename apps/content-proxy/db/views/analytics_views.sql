-- Materialized views for analytics and dashboard data

-- Daily earnings history by publisher
CREATE MATERIALIZED VIEW IF NOT EXISTS content_proxy.publisher_daily_earnings AS
SELECT 
  p.id as publisher_id,
  p.name as publisher_name,
  DATE(ut.transaction_time) as date,
  COUNT(ut.id) as daily_requests,
  SUM(ut.monetary_cost_calculated) as daily_earnings,
  SUM(ut.bytes_transferred) as daily_bytes
FROM content_proxy.usage_transactions ut
JOIN content_proxy.licensing_agreements la ON ut.licensing_agreement_id = la.id
JOIN content_proxy.publishers p ON la.publisher_id = p.id
GROUP BY p.id, p.name, DATE(ut.transaction_time)
ORDER BY p.id, DATE(ut.transaction_time) DESC;

-- Usage by app/consumer (based on profile type)
CREATE MATERIALIZED VIEW IF NOT EXISTS content_proxy.usage_by_app AS
SELECT 
  p.id as publisher_id,
  p.name as publisher_name,
  pr.type as app_type,
  COUNT(ut.id) as total_requests,
  SUM(ut.monetary_cost_calculated) as total_earnings,
  SUM(ut.bytes_transferred) as total_bytes
FROM content_proxy.usage_transactions ut
JOIN content_proxy.licensing_agreements la ON ut.licensing_agreement_id = la.id
JOIN content_proxy.publishers p ON la.publisher_id = p.id
JOIN content_proxy.profiles pr ON ut.profile_id = pr.id
GROUP BY p.id, p.name, pr.type
ORDER BY p.id, total_earnings DESC;

-- Recent transactions for dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS content_proxy.recent_transactions AS
SELECT 
  ut.id,
  ut.transaction_time,
  p.name as publisher_name,
  ci.name as content_name,
  pr.type as app_type,
  ut.tokens_charged,
  ut.bytes_transferred,
  ut.monetary_cost_calculated
FROM content_proxy.usage_transactions ut
JOIN content_proxy.licensing_agreements la ON ut.licensing_agreement_id = la.id
JOIN content_proxy.publishers p ON la.publisher_id = p.id
JOIN content_proxy.content_items ci ON ut.content_item_id = ci.id
JOIN content_proxy.profiles pr ON ut.profile_id = pr.id
ORDER BY ut.transaction_time DESC
LIMIT 100;

-- Content performance stats
CREATE MATERIALIZED VIEW IF NOT EXISTS content_proxy.content_performance AS
SELECT 
  ci.id as content_id,
  ci.name as content_name,
  p.id as publisher_id,
  p.name as publisher_name,
  cp.pricing_model,
  COUNT(ut.id) as total_requests,
  SUM(ut.monetary_cost_calculated) as total_earnings,
  SUM(ut.bytes_transferred) as total_bytes,
  AVG(ut.monetary_cost_calculated) as avg_cost_per_request
FROM content_proxy.content_items ci
JOIN content_proxy.publishers p ON ci.publisher_id = p.id
LEFT JOIN content_proxy.content_pricing cp ON ci.id = cp.content_item_id
LEFT JOIN content_proxy.usage_transactions ut ON ci.id = ut.content_item_id
GROUP BY ci.id, ci.name, p.id, p.name, cp.pricing_model
ORDER BY total_earnings DESC;

-- Refresh function for materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW content_proxy.publisher_daily_earnings;
  REFRESH MATERIALIZED VIEW content_proxy.usage_by_app;
  REFRESH MATERIALIZED VIEW content_proxy.recent_transactions;
  REFRESH MATERIALIZED VIEW content_proxy.content_performance;
END;
$$ LANGUAGE plpgsql;
