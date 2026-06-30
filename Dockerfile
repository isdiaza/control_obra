# ── Build stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Remove nested sub-project from root build
RUN rm -rf control-gastos-ia

# Write Supabase credentials to .env so Vite picks them up at build time.
RUN echo "VITE_SUPABASE_URL=http://control-obras-supabase-079695-76-13-101-174.sslip.io" > .env && \
    echo "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODIxNTg4MzIsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6ImFub24iLCJpc3MiOiJzdXBhYmFzZSJ9.89ESaDvmgM4qYvyBUl_4PyJcJiKk1Dubik0YyJr_Wxg" >> .env

RUN npm run build

# ── Production stage ────────────────────────────────────────────────────────
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

