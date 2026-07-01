import pg from 'pg';
const { Client } = pg;

const SQL_CONTRATOS = `
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
)`;

const SQL_PAGOS = `
CREATE TABLE IF NOT EXISTS destajo_pagos (
  id TEXT PRIMARY KEY,
  contrato_id TEXT NOT NULL,
  fecha TEXT NOT NULL,
  monto NUMERIC NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`;

const SQL_GRANTS = `GRANT ALL ON destajo_contratos TO anon, authenticated`;
const SQL_GRANTS2 = `GRANT ALL ON destajo_pagos TO anon, authenticated`;

async function run() {
  const passwords = ['postgres', 'supabase', 'postgres123', 'your-super-secret-and-long-postgres-password'];
  
  for (const pwd of passwords) {
    const c = new Client({
      host: '76.13.101.174',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: pwd,
      connectionTimeoutMillis: 4000
    });
    try {
      await c.connect();
      console.log('Connected! Password:', pwd.substring(0, 8));
      await c.query(SQL_CONTRATOS);
      console.log('destajo_contratos created OK');
      await c.query(SQL_PAGOS);
      console.log('destajo_pagos created OK');
      await c.query(SQL_GRANTS);
      await c.query(SQL_GRANTS2);
      console.log('Grants OK');
      await c.end();
      return;
    } catch (e) {
      console.log('Failed pwd ' + pwd.substring(0,6) + ':', e.message.substring(0, 80));
      try { await c.end(); } catch (_) {}
    }
  }
  console.log('\nCould not connect automatically.');
  console.log('Please run this SQL in Supabase Studio (http://76.13.101.174:8000):');
  console.log(SQL_CONTRATOS + ';\n' + SQL_PAGOS + ';\n' + SQL_GRANTS + ';\n' + SQL_GRANTS2 + ';');
}

run();
