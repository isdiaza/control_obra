-- ========================================================
-- SCHEMA DE BASE DE DATOS DIBERSA (NÓMINA Y OBRAS)
-- EJECUTAR ESTO PRIMERO EN EL SQL EDITOR DE SUPABASE
-- ========================================================

-- 1. Tabla: Obras
CREATE TABLE IF NOT EXISTS public.obras (
    id text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    location text,
    supervisor text,
    budget numeric(12,2) DEFAULT 0,
    start_date date,
    status text CHECK (status IN ('Activa', 'Finalizada', 'Pausada')) DEFAULT 'Activa',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla: Trabajadores
CREATE TABLE IF NOT EXISTS public.workers (
    id text PRIMARY KEY,
    name text NOT NULL,
    role text NOT NULL,
    obra text, -- Se almacena el nombre para mantener compatibilidad con LocalStorage
    sueldo_diario numeric(12,4) DEFAULT 0 NOT NULL,
    avatar_color text,
    photo text,
    blood_type text,
    allergies text,
    diseases text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workers_obra ON public.workers(obra);

-- 3. Tabla: Asistencias Semanales
CREATE TABLE IF NOT EXISTS public.attendance (
    worker_id text REFERENCES public.workers(id) ON UPDATE CASCADE ON DELETE CASCADE,
    week_id text NOT NULL,
    lunes boolean DEFAULT false,
    martes boolean DEFAULT false,
    miercoles boolean DEFAULT false,
    jueves boolean DEFAULT false,
    viernes boolean DEFAULT false,
    sabado boolean DEFAULT false,
    PRIMARY KEY (worker_id, week_id)
);

-- 4. Tabla: Proveedores
CREATE TABLE IF NOT EXISTS public.proveedores (
    id text PRIMARY KEY,
    name text NOT NULL,
    contact_name text,
    phone text,
    email text,
    address text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla: Clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    id text PRIMARY KEY,
    name text NOT NULL,
    contact_name text,
    phone text,
    email text,
    address text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabla: Transacciones Financieras
CREATE TABLE IF NOT EXISTS public.transactions (
    id text PRIMARY KEY,
    date date NOT NULL,
    description text,
    type text CHECK (type IN ('ingreso', 'gasto')) NOT NULL,
    category text NOT NULL,
    amount numeric(12,2) NOT NULL,
    obra text,
    week_id text NOT NULL,
    proveedor_id text REFERENCES public.proveedores(id) ON UPDATE CASCADE ON DELETE SET NULL,
    cliente_id text REFERENCES public.clientes(id) ON UPDATE CASCADE ON DELETE SET NULL,
    material_name text,
    quantity numeric(10,2),
    unit_price numeric(12,2),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_obra ON public.transactions(obra);

-- 7. Tabla: Datos de la Empresa
CREATE TABLE IF NOT EXISTS public.company_info (
    id integer PRIMARY KEY DEFAULT 1,
    name text NOT NULL,
    subtitle text,
    CONSTRAINT single_row CHECK (id = 1)
);
