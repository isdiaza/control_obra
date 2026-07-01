#!/bin/sh
# migrate.sh — runs inside the Docker build context on the server
# The build server CAN reach Supabase internally via its sslip.io URL
# Uses PostgREST RPC with anon key to call a setup function,
# or falls back to direct HTTP to the Supabase meta service

SUPABASE_URL="http://control-obras-supabase-079695-76-13-101-174.sslip.io"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODIxNTg4MzIsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6ImFub24iLCJpc3MiOiJzdXBhYmFzZSJ9.89ESaDvmgM4qYvyBUl_4PyJcJiKk1Dubik0YyJr_Wxg"

echo "=== Checking Supabase connectivity from build context ==="
curl -sf "${SUPABASE_URL}/rest/v1/workers?limit=1" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -o /dev/null && echo "Supabase reachable" || echo "Supabase not reachable from build"

echo "=== Checking if destajo_contratos exists ==="
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  "${SUPABASE_URL}/rest/v1/destajo_contratos?limit=1" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")

echo "destajo_contratos status: $STATUS"

if [ "$STATUS" = "200" ]; then
  echo "Tables already exist - no migration needed"
else
  echo "Tables missing (status $STATUS) - will try to create via meta API"
  # Try meta service with service_role if available
  if [ -n "$SERVICE_ROLE_KEY" ]; then
    echo "Using SERVICE_ROLE_KEY to create tables..."
    curl -sf "${SUPABASE_URL}/meta/v1/query" \
      -H "apikey: ${SERVICE_ROLE_KEY}" \
      -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
      -H "Content-Type: application/json" \
      -d '{"query":"CREATE TABLE IF NOT EXISTS destajo_contratos (id TEXT PRIMARY KEY, obra TEXT NOT NULL, concepto TEXT NOT NULL, contratista TEXT NOT NULL, unidad TEXT NOT NULL DEFAULT '\''m2'\'', cantidad_total NUMERIC NOT NULL DEFAULT 0, precio_unitario NUMERIC NOT NULL DEFAULT 0, cantidad_avance NUMERIC NOT NULL DEFAULT 0, fecha_inicio TEXT, status TEXT NOT NULL DEFAULT '\''Activo'\'', created_at TIMESTAMPTZ DEFAULT NOW())"}' \
      && echo "destajo_contratos created" \
      || echo "Failed to create destajo_contratos"

    curl -sf "${SUPABASE_URL}/meta/v1/query" \
      -H "apikey: ${SERVICE_ROLE_KEY}" \
      -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
      -H "Content-Type: application/json" \
      -d '{"query":"CREATE TABLE IF NOT EXISTS destajo_pagos (id TEXT PRIMARY KEY, contrato_id TEXT NOT NULL, fecha TEXT NOT NULL, monto NUMERIC NOT NULL, descripcion TEXT, created_at TIMESTAMPTZ DEFAULT NOW())"}' \
      && echo "destajo_pagos created" \
      || echo "Failed to create destajo_pagos"

    curl -sf "${SUPABASE_URL}/meta/v1/query" \
      -H "apikey: ${SERVICE_ROLE_KEY}" \
      -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
      -H "Content-Type: application/json" \
      -d '{"query":"GRANT ALL ON destajo_contratos TO anon, authenticated; GRANT ALL ON destajo_pagos TO anon, authenticated;"}' \
      && echo "Grants applied" \
      || echo "Failed to apply grants"
  else
    echo "No SERVICE_ROLE_KEY available - tables will be created on first app startup via localStorage fallback"
  fi
fi
echo "=== Migration script complete ==="
