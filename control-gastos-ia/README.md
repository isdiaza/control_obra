# Gastos.IA - Control de Gastos en Software y IA 🚀

Una aplicación web moderna y premium diseñada para centralizar, rastrear y optimizar tus egresos mensuales en herramientas SaaS y de Inteligencia Artificial (como ChatGPT, Midjourney, Cursor, Copilot, Vercel, etc.).

## Características principales ✨

- **Autenticación Completa**: Inicio de sesión y registro de usuarios robusto utilizando **Supabase Auth**.
- **Panel de Control (Dashboard)**: Visualización en tiempo real de tus gastos con tarjetas de métricas clave (KPIs) y gráficos interactivos (**Recharts**).
  - Gastos mensuales y anuales unificados en pesos mexicanos (MXN).
  - Gráfico de distribución de gastos por categoría (Texto, Imágenes, Asistentes de Código, Hosting, etc.).
  - Gráfico de barra de las 5 herramientas más costosas.
- **CRUD de Suscripciones**: Registro, visualización, edición y eliminación (CRUD) de herramientas.
- **Filtros Avanzados**: Búsqueda por texto y filtrado simultáneo por categoría, estado de suscripción (Activa, Pausada, Cancelada) y ciclo de facturación (Semanal, Mensual, Anual, Pago Único).
- **Base de Datos Híbrida**: Si no configuras las credenciales de Supabase, la app cuenta con un fallback inteligente que usa **LocalStorage** y siembra datos de ejemplo automáticamente (ChatGPT, Midjourney, Cursor, Vercel) para que puedas probarla inmediatamente.
- **Listo para Producción (VPS & Dokploy)**: Configurado con soporte nativo de Docker para despliegues atómicos y automáticos.

---

## Tecnologías Utilizadas 🛠️

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) con TypeScript.
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/) para una interfaz moderna, limpia y glassmorphic.
- **Base de Datos & Auth**: [Supabase](https://supabase.com/).
- **Gráficos**: [Recharts](https://recharts.org/).
- **Iconografía**: [Lucide React](https://lucide.dev/).
- **Docker**: Dockerfile optimizado para Next.js en modo `standalone`.

---

## Estructura del Proyecto 📁

```text
control-gastos-ia/
├── Dockerfile                  # Construcción optimizada para producción
├── docker-compose.yml          # Orquestación de contenedores Docker
├── supabase_schema.sql         # Esquema de base de datos listo para el SQL Editor de Supabase
├── src/
│   ├── app/                    # Rutas de la aplicación (Home, Login, Register, Dashboard)
│   ├── components/
│   │   └── dashboard/          # Componentes visuales (Gráficos, KPIs, Tabla, Filtros, Formulario)
│   ├── context/                # AuthContext para gestionar sesión e inicio
│   ├── hooks/                  # useSubscriptions para cálculos y comunicación con la DB
│   ├── lib/                    # supabase.ts (cliente) y dbService.ts (capa lógica unificada)
│   └── types/                  # Modelos e interfaces TypeScript
```

---

## Configuración y Ejecución Local ⚙️

### 1. Iniciar con Base de Datos Local (Instantáneo)
Si solo quieres probar la app localmente sin configurar Supabase:
1. Asegúrate de estar en el directorio `control-gastos-ia`.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Levanta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador. La app detectará que no hay variables de Supabase y cargará automáticamente la base de datos simulada en `LocalStorage` con datos semilla listos para usar.

### 2. Conectar a tu cuenta de Supabase
Para usar la aplicación en un entorno real con persistencia en la nube:
1. Crea un proyecto en el panel de [Supabase](https://supabase.com/).
2. Ve al panel **SQL Editor** del proyecto y ejecuta el contenido del archivo `supabase_schema.sql`. Esto creará las tablas `profiles` y `subscriptions`, los índices, los triggers de automatización y las políticas de seguridad RLS.
3. Crea un archivo `.env.local` en la raíz de `control-gastos-ia` basado en la plantilla existente con tus credenciales:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-jwt
   ```
4. Reinicia tu servidor local (`npm run dev`) y la app ahora persistirá los registros de forma segura en tu base de datos Supabase.

---

## Despliegue en VPS (Dokploy / Docker) 🐳

El proyecto incluye soporte listo para desplegarse mediante Docker, ideal para plataformas como **Dokploy**, **Coolify** o despliegue manual en VPS.

### Despliegue con Docker Compose
1. Clona el repositorio en tu servidor VPS.
2. Crea el archivo `.env.local` con las variables de Supabase correspondientes.
3. Ejecuta el comando:
   ```bash
   docker compose up -d --build
   ```
4. Tu aplicación estará disponible en el puerto `3000` de tu servidor. Puedes configurar un proxy inverso (Nginx, Caddy o el provisto por Dokploy) para asignarle un dominio SSL.
