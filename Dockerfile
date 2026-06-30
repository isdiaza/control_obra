# ── Build stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Remove nested sub-project from root build
RUN rm -rf control-gastos-ia

# Declare build-time args (set these in Dokploy → Environment or Build Args)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Also accept them as plain ENV vars (Dokploy "Environment" tab sets these)
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

# Write .env so Vite ALWAYS finds the variables, regardless of how
# Dokploy injects them (ARG vs ENV).  Vite reads .env at build time.
RUN echo "VITE_SUPABASE_URL=${VITE_SUPABASE_URL}" > .env && \
    echo "VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}" >> .env && \
    echo "=== .env written ===" && cat .env

RUN npm run build

# ── Production stage ────────────────────────────────────────────────────────
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

