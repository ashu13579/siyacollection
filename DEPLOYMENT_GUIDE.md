# Siya Collection - Independent Deployment Guide

> Complete guide to deploy this project outside of Lovable.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Export](#2-project-export)
3. [Environment Variables](#3-environment-variables)
4. [Supabase Setup](#4-supabase-setup)
5. [Edge Functions Deployment](#5-edge-functions-deployment)
6. [Frontend Deployment](#6-frontend-deployment)
7. [DNS & Custom Domain](#7-dns--custom-domain)
8. [Post-Deployment Checklist](#8-post-deployment-checklist)
9. [Ongoing Maintenance](#9-ongoing-maintenance)

---

## 1. Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | v18+ | Build frontend |
| npm / bun | Latest | Package manager |
| Supabase CLI | v1.100+ | Manage database & edge functions |
| Git | Latest | Version control |
| A hosting provider | Vercel / Netlify / Cloudflare Pages | Host the frontend |

Install Supabase CLI:
```bash
npm install -g supabase
```

---

## 2. Project Export

### From Lovable
1. Go to **Settings → GitHub** and connect your GitHub account.
2. Push the project to a GitHub repository.
3. Clone the repo locally:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
npm install
```

### Verify Local Build
```bash
npm run build
npm run preview
```

---

## 3. Environment Variables

Create a `.env` file in the project root with these variables:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### Where to find these values:
- Go to your Supabase Dashboard → **Settings → API**
- `VITE_SUPABASE_URL` = Project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` = `anon` / `public` key (safe to expose)
- `VITE_SUPABASE_PROJECT_ID` = Your project reference ID

### ⚠️ Important
- **NEVER** expose `service_role` key in frontend code.
- The `anon` key is safe for client-side use (it's protected by RLS policies).
- On your hosting provider, set these as environment variables in the dashboard (Vercel → Settings → Environment Variables, etc.).

---

## 4. Supabase Setup

### Option A: Continue with Lovable Cloud's Supabase (Recommended Initially)
Your current Supabase project will continue to work. No changes needed — just keep using the same URL and keys.

### Option B: Migrate to Your Own Supabase Project

#### 4.1 Create a new Supabase project
1. Go to [supabase.com](https://supabase.com) and create an account.
2. Create a new project (choose a region close to your users — Asia South for India).
3. Note down the **Project URL**, **anon key**, and **service_role key**.

#### 4.2 Run Database Migrations
All migration files are in `supabase/migrations/`. Run them in order:

```bash
# Link to your new Supabase project
supabase link --project-ref YOUR_NEW_PROJECT_ID

# Push all migrations
supabase db push
```

This will create all tables: `products`, `categories`, `banners`, `orders`, `profiles`, `user_roles`, `app_settings`.

#### 4.3 Create Storage Buckets
In Supabase Dashboard → **Storage**, create these public buckets:
- `product-images`
- `category-images`
- `banner-images`

Or via SQL:
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('category-images', 'category-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('banner-images', 'banner-images', true);

-- Storage policies for public read access
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id IN ('product-images', 'category-images', 'banner-images'));

-- Admin upload access
CREATE POLICY "Admin upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('product-images', 'category-images', 'banner-images'));
CREATE POLICY "Admin update" ON storage.objects FOR UPDATE USING (bucket_id IN ('product-images', 'category-images', 'banner-images'));
CREATE POLICY "Admin delete" ON storage.objects FOR DELETE USING (bucket_id IN ('product-images', 'category-images', 'banner-images'));
```

#### 4.4 Set Up Auth
In Supabase Dashboard → **Authentication → Settings**:
- Enable **Email** provider
- Set **Site URL** to your production domain (e.g., `https://siyacollection.com`)
- Add **Redirect URLs**:
  - `https://siyacollection.com`
  - `https://siyacollection.com/reset-password`
  - `https://siyacollection.com/auth`

#### 4.5 Create Admin User
1. Sign up through your app's `/auth` page.
2. Then manually add the admin role:
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_UUID', 'admin');
```

#### 4.6 Seed App Settings
```sql
INSERT INTO public.app_settings (key, value, label, is_secret) VALUES
  ('razorpay_key_id', '', 'Razorpay Key ID', false),
  ('razorpay_key_secret', '', 'Razorpay Key Secret', true),
  ('delhivery_api_key', '', 'Delhivery API Key', true),
  ('delhivery_api_base', 'https://track.delhivery.com', 'Delhivery API Base URL', false);
```

#### 4.7 Export Existing Data (Optional)
If you want to migrate existing products/categories/orders from Lovable Cloud:
```bash
# Export data from old project
supabase db dump --data-only -f data_dump.sql

# Import into new project
psql YOUR_NEW_DB_URL < data_dump.sql
```

---

## 5. Edge Functions Deployment

The project has 3 edge functions that need to be deployed:

### 5.1 Deploy via Supabase CLI
```bash
# Login to Supabase
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy all edge functions
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
supabase functions deploy check-pincode
```

### 5.2 Edge Function Secrets
These are automatically available in edge functions (set by Supabase):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

No additional secrets need to be added — all API keys (Razorpay, Delhivery) are stored in the `app_settings` table and read at runtime.

### 5.3 Function Details

| Function | Purpose | Endpoint |
|----------|---------|----------|
| `create-razorpay-order` | Creates a Razorpay payment order | `POST /functions/v1/create-razorpay-order` |
| `verify-razorpay-payment` | Verifies payment signature & updates order | `POST /functions/v1/verify-razorpay-payment` |
| `check-pincode` | Checks delivery serviceability via Delhivery | `POST /functions/v1/check-pincode` |

---

## 6. Frontend Deployment

### Option A: Vercel (Recommended)
```bash
npm install -g vercel
vercel
```
- Set environment variables in Vercel Dashboard.
- Set **Build Command**: `npm run build`
- Set **Output Directory**: `dist`
- Set **Framework Preset**: Vite

### Option B: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```
Add a `netlify.toml` file:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option C: Cloudflare Pages
1. Connect your GitHub repo in Cloudflare Dashboard.
2. Set **Build command**: `npm run build`
3. Set **Build output**: `dist`
4. Add environment variables.

### Option D: Traditional VPS (DigitalOcean, AWS EC2)
```bash
npm run build
# Serve the dist/ folder with Nginx or Apache

# Example Nginx config:
server {
    listen 80;
    server_name siyacollection.com;
    root /var/www/siya-collection/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
```

### ⚠️ SPA Routing
Since this is a Single Page Application (React Router), you **must** configure your server to redirect all routes to `index.html`. Without this, refreshing any page other than `/` will return a 404.

---

## 7. DNS & Custom Domain

### Point your domain to your hosting provider:
- **Vercel**: Add domain in Vercel Dashboard → it gives you DNS records.
- **Netlify**: Add domain in Site Settings → Domain Management.
- **VPS**: Create A record pointing to your server IP.

### SSL Certificate
- Vercel/Netlify/Cloudflare: Automatic SSL ✅
- VPS: Use [Let's Encrypt](https://letsencrypt.org/) with Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d siyacollection.com -d www.siyacollection.com
```

---

## 8. Post-Deployment Checklist

### Critical
- [ ] Environment variables set on hosting provider
- [ ] Supabase Auth redirect URLs updated to production domain
- [ ] Edge functions deployed and accessible
- [ ] Razorpay keys added in Admin → Settings
- [ ] Admin user created with `admin` role
- [ ] SSL certificate active (https://)
- [ ] SPA routing configured (all routes → index.html)

### Recommended
- [ ] Test signup + email verification flow
- [ ] Test password reset flow
- [ ] Test product CRUD in admin panel
- [ ] Test checkout flow (COD + Razorpay)
- [ ] Test pincode serviceability check
- [ ] Verify image uploads work (products, categories, banners)
- [ ] Check mobile responsiveness
- [ ] Set up Google Analytics or similar

### SEO
- [ ] Update `<title>` and `<meta>` tags in `index.html`
- [ ] Add `sitemap.xml` and submit to Google Search Console
- [ ] Add `robots.txt` rules if needed
- [ ] Set up Open Graph images for social sharing

---

## 9. Ongoing Maintenance

### Database Backups
- Supabase provides automatic daily backups on Pro plan.
- For manual backups:
```bash
supabase db dump -f backup_$(date +%Y%m%d).sql
```

### Monitoring
- Use Supabase Dashboard → **Logs** for edge function errors.
- Set up uptime monitoring (UptimeRobot, Better Uptime).
- Monitor Razorpay webhook delivery in Razorpay Dashboard.

### Updating the App
```bash
git pull origin main
npm install
npm run build
# Deploy to your hosting provider
```

### Supabase Migrations
When you need to change the database schema:
```bash
# Create a new migration
supabase migration new my_change_name

# Edit the migration file in supabase/migrations/
# Then push to your project
supabase db push
```

---

## File Reference

| File/Folder | Purpose | Change Needed? |
|-------------|---------|----------------|
| `.env` | Environment variables | ✅ Update with your Supabase keys |
| `src/integrations/supabase/client.ts` | Supabase client init | ❌ Reads from .env automatically |
| `supabase/migrations/` | Database schema | ❌ Run as-is with `supabase db push` |
| `supabase/functions/` | Edge functions | ❌ Deploy with `supabase functions deploy` |
| `index.html` | Entry point + Razorpay script | ❌ No changes needed |
| `src/pages/Auth.tsx` | Login/Signup | ❌ Works as-is |
| `src/pages/Checkout.tsx` | Payment flow | ❌ Works as-is |
| `src/hooks/useAuth.tsx` | Auth context | ❌ Works as-is |
| `src/pages/admin/*` | Admin panel | ❌ Works as-is |

---

## Support & Resources

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Razorpay Docs**: [razorpay.com/docs](https://razorpay.com/docs)
- **Delhivery API**: [delhivery.com/developers](https://www.delhivery.com/developers)
- **Vite Docs**: [vitejs.dev](https://vitejs.dev)
- **React Router**: [reactrouter.com](https://reactrouter.com)

---

*Last updated: March 2026*
