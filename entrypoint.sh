#!/bin/sh
set -e

SUPABASE_URL="http://control-obras-supabase-079695-76-13-101-174.sslip.io"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODIxNTg4MzIsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6ImFub24iLCJpc3MiOiJzdXBhYmFzZSJ9.89ESaDvmgM4qYvyBUl_4PyJcJiKk1Dubik0YyJr_Wxg"

echo "[entrypoint] Checking destajo_contratos table..."

# Check table existence
HTTP_STATUS=$(wget -q -S --header="apikey: ${ANON_KEY}" \
  --header="Authorization: Bearer ${ANON_KEY}" \
  "${SUPABASE_URL}/rest/v1/destajo_contratos?limit=1" \
  -O /dev/null 2>&1 | grep "HTTP/" | awk '{print $2}' | head -1)

echo "[entrypoint] destajo_contratos HTTP status: ${HTTP_STATUS}"

if [ "${HTTP_STATUS}" = "200" ]; then
  echo "[entrypoint] Tables OK - starting nginx"
else
  echo "[entrypoint] Tables missing - attempting migration via meta API..."
  
  # Try with SERVICE_ROLE_KEY env var (set this in Dokploy env)
  SRK="${SERVICE_ROLE_KEY:-}"
  
  if [ -n "$SRK" ]; then
    SQL1='CREATE TABLE IF NOT EXISTS destajo_contratos (id TEXT PRIMARY KEY, obra TEXT NOT NULL, concepto TEXT NOT NULL, contratista TEXT NOT NULL, unidad TEXT NOT NULL DEFAULT '"'"'m2'"'"', cantidad_total NUMERIC NOT NULL DEFAULT 0, precio_unitario NUMERIC NOT NULL DEFAULT 0, cantidad_avance NUMERIC NOT NULL DEFAULT 0, fecha_inicio TEXT, status TEXT NOT NULL DEFAULT '"'"'Activo'"'"', created_at TIMESTAMPTZ DEFAULT NOW())'
    SQL2='CREATE TABLE IF NOT EXISTS destajo_pagos (id TEXT PRIMARY KEY, contrato_id TEXT NOT NULL, fecha TEXT NOT NULL, monto NUMERIC NOT NULL, descripcion TEXT, created_at TIMESTAMPTZ DEFAULT NOW())'
    SQL3='GRANT ALL ON destajo_contratos TO anon, authenticated; GRANT ALL ON destajo_pagos TO anon, authenticated'

    for SQL in "$SQL1" "$SQL2" "$SQL3"; do
      wget -q --method=POST \
        --header="apikey: ${SRK}" \
        --header="Authorization: Bearer ${SRK}" \
        --header="Content-Type: application/json" \
        --body-data="{\"query\":\"${SQL}\"}" \
        "${SUPABASE_URL}/meta/v1/query" \
        -O /tmp/sql_result 2>/dev/null && cat /tmp/sql_result || echo "query attempt done"
    done
    echo "[entrypoint] Migration complete"
  else
    echo "[entrypoint] SERVICE_ROLE_KEY not set - skipping DDL migration"
    echo "[entrypoint] App will use localStorage fallback for destajo data"
  fi
fi

echo "[entrypoint] Starting nginx..."
exec nginx -g "daemon off;"
