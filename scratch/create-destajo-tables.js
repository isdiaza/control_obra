import { createClient } from '@supabase/supabase-js';
const sb = createClient(
  'http://control-obras-supabase-079695-76-13-101-174.sslip.io',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODIxNTg4MzIsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6ImFub24iLCJpc3MiOiJzdXBhYmFzZSJ9.89ESaDvmgM4qYvyBUl_4PyJcJiKk1Dubik0YyJr_Wxg'
);

async function run() {
  // Try direct insert to test if tables exist, create via rpc if not
  const sql1 = `
    CREATE TABLE IF NOT EXISTS destajo_contratos (
      id TEXT PRIMARY KEY,
      obra TEXT NOT NULL,
      concepto TEXT NOT NULL,
      contratista TEXT NOT NULL,
      unidad TEXT NOT NULL DEFAULT 'm2',
      cantidad_total NUMERIC NOT NULL DEFAULT 0,
      precio_unitario NUMERIC NOT NULL DEFAULT 0,
      cantidad_avance NUMERIC NOT NULL DEFAULT 0,
      fecha_inicio TEXT,
      status TEXT NOT NULL DEFAULT 'Activo',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  const sql2 = `
    CREATE TABLE IF NOT EXISTS destajo_pagos (
      id TEXT PRIMARY KEY,
      contrato_id TEXT NOT NULL,
      fecha TEXT NOT NULL,
      monto NUMERIC NOT NULL,
      descripcion TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  const r1 = await sb.rpc('exec_sql', { sql: sql1 });
  if (r1.error) {
    console.log('contratos error:', r1.error.message);
  } else {
    console.log('destajo_contratos OK');
  }

  const r2 = await sb.rpc('exec_sql', { sql: sql2 });
  if (r2.error) {
    console.log('pagos error:', r2.error.message);
  } else {
    console.log('destajo_pagos OK');
  }

  // Verify by trying to select
  const { data: c, error: ce } = await sb.from('destajo_contratos').select('id').limit(1);
  const { data: p, error: pe } = await sb.from('destajo_pagos').select('id').limit(1);
  console.log('destajo_contratos select:', ce ? 'ERROR: ' + ce.message : 'OK');
  console.log('destajo_pagos select:', pe ? 'ERROR: ' + pe.message : 'OK');
}

run().catch(console.error);

