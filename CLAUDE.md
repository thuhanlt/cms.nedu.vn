# CLAUDE.md — nedu-cms (cms.nedu.vn)

> **Document:** NL-CLAUDE-003 v1.0 · NhiLe Holdings · Nedu CMS
> **Repo:** `nedu-cms` · **Domain:** cms.nedu.vn
> **Stack:** Vite portal (React 19 + TypeScript) theo chuẩn NLH FE
> **Mode build hiện tại:** DATA GIẢ (MSW mock) — chưa nối backend thật. Schema + API contract dưới đây là hợp đồng cho IT nối sau.
>
> File này là source of truth cho Claude Code. Đọc hết trước khi build. Không tự thêm feature ngoài spec. Không đổi tech stack.

---

## 1. Mục đích

Nedu CMS là portal nội bộ (cần đăng nhập) cho team nội dung non-tech của Nedu tự soạn → xem trước (live preview) → xuất bản nội dung lên 4 site đầu ra: `nedu.vn`, `learn.nedu.vn`, `alumni.nedu.vn`, `test.nedu.vn`. Mục tiêu: team marketing không phụ thuộc dev cho mỗi thay đổi nội dung.

Hệ thống gồm 10 nhóm chức năng, nổi bật nhất là **Trình soạn Thử thách 7 phần với live preview desktop/mobile**.

---

## 2. Tech Stack (CỐ ĐỊNH — không đổi)

| Layer | Lựa chọn |
|---|---|
| Build/Framework | **Vite 8 + React 19** (SPA, client routing) |
| Language | **TypeScript strict** |
| Routing | **React Router v7** (`react-router-dom`, BrowserRouter) |
| Server state | **TanStack Query v5** |
| Client state | **Zustand v5** (chỉ cho auth + UI state như sidebar collapse) |
| Styling | **Tailwind v4** (`@tailwindcss/vite`) |
| Mock API | **MSW v2** (`VITE_ENABLE_MOCKING=true`) |
| Auth | **Central Auth qua IAM** = `iam.nedu.vn` (xem §13 — exception đặt tên) |
| Analytics | **GA4 + MS Clarity** (`src/shared/analytics/`) |
| Deploy | Vercel (preview, mock=on) + Cloudflare Workers (prod, mock=off) |
| Font | **Playfair Display** (headline) + **Inter** (body) |
| Icons | **lucide-react** (thay cho icon SVG nội tuyến trong mockup) |
| Rich text editor | **TipTap v2** — xem §13 (exception có chủ đích) |

**Cấm thêm:** Redux, Recoil, Jotai, SWR, Axios, Prisma client, styled-components, Emotion, MUI, Ant Design. Cần gì khác → hỏi trước.

### Kiến trúc 6 tầng (không bỏ tầng nào)
1. **Governance** — vai trò Biên tập viên / Quản trị viên, cấp quyền từ IAM. Test Config + Cài đặt site = admin-only.
2. **Data Model** — Supabase (single source of truth). Schema ở §4.
3. **API / Rules** — Express/NestJS contract ở §6 (`api.nedu.vn`). Bản này dùng MSW mock thay BE.
4. **AI Layer** — 2 tính năng AI (viết bài, tạo persona) = DEFERRED ("Sắp ra"). Spec ở §9.
5. **UI** — React portal, mô tả ở §7.
6. **Human Workflow** — vòng đời nội dung 5 bước: Soạn → Xem trước → Kiểm duyệt → Xuất bản → Hiển thị.

### 5 Core Data Principles — áp dụng ở đâu
- **P1: Person ≠ User Account.** Portal KHÔNG sở hữu bảng users. Identity + role lấy từ IAM qua JWT (`/auth/me`). Các cột `created_by` / `updated_by` chỉ lưu IAM user id (text), không join sang user table nội bộ.
- **P2: Mọi hành động là Event (INSERT-only).** Bảng `content_events` ghi lại mọi hành động publish/unpublish/create/update/delete. Không UPDATE/DELETE trên bảng này — chỉ INSERT. Lịch sử nội dung không bị mất.
- **P3: metadata JSONB là escape valve.** Body Thử thách có cấu trúc lồng sâu (outcomes, curriculum, instructor, reviews, faqs, plans) → lưu trong cột `content jsonb`. Field cần query/list thường xuyên (name, status, published, start_date, price_monthly) được **promote lên cột riêng**. SEO của bài viết cũng lưu JSONB.

---

## 3. File Structure

```
nedu-cms/
├── public/
│   └── mockServiceWorker.js              # npx msw init public/
├── src/
│   ├── main.tsx                          # await enableMocking() → analytics.init() → render <AppRouter/>
│   ├── index.css                         # Tailwind entry + CSS variables (Playfair/Inter, màu)
│   ├── routes/
│   │   ├── index.tsx                     # <AppRouter/> — QueryClientProvider + BrowserRouter + RouteTracker + AppInit + Routes
│   │   ├── ProtectedRoute.tsx            # check auth → <Outlet/> hoặc redirect /login
│   │   └── AdminRoute.tsx                # RoleGate cấp route: !admin → redirect /dashboard/overview
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── pages/ LoginPage.tsx, AuthCallbackPage.tsx
│   │   │   └── stores/ useAuthStore.ts   # Zustand: user, role, isLoading, initialize, loginWithGoogle, acceptTokens, logout
│   │   ├── overview/
│   │   │   └── pages/ OverviewPage.tsx
│   │   ├── challenges/
│   │   │   ├── hooks/ useChallenges.ts   # TanStack Query (list/get/create/update/delete)
│   │   │   ├── pages/ ChallengeListPage.tsx, ChallengeEditorPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── editor/ BannerSection.tsx, OutcomesSection.tsx, CurriculumSection.tsx,
│   │   │   │   │           InstructorSection.tsx, ReviewsSection.tsx, FaqSection.tsx, PriceSection.tsx
│   │   │   │   ├── ChallengeSectionNav.tsx
│   │   │   │   └── preview/ ChallengePreview.tsx   # render landing từ content (desktop/mobile)
│   │   │   └── types/ challenge.ts
│   │   ├── articles/
│   │   │   ├── hooks/ useArticles.ts
│   │   │   ├── pages/ ArticleListPage.tsx, ArticleEditorPage.tsx
│   │   │   ├── components/ RichTextEditor.tsx (TipTap), SeoFields.tsx
│   │   │   └── types/ article.ts
│   │   ├── lessons/
│   │   │   ├── hooks/ useLessons.ts
│   │   │   ├── pages/ LessonListPage.tsx
│   │   │   ├── components/ LessonFormModal.tsx
│   │   │   └── types/ lesson.ts
│   │   ├── test-config/                  # ADMIN ONLY
│   │   │   ├── hooks/ usePersonas.ts
│   │   │   ├── pages/ TestConfigPage.tsx  # 2 cột: danh sách persona | chi tiết + problems
│   │   │   └── types/ persona.ts
│   │   ├── alumni/
│   │   │   ├── hooks/ useAlumni.ts
│   │   │   ├── pages/ AlumniListPage.tsx
│   │   │   ├── components/ AlumniFormModal.tsx
│   │   │   └── types/ alumni.ts
│   │   ├── reviews/
│   │   │   ├── hooks/ useReviews.ts
│   │   │   ├── pages/ ReviewListPage.tsx
│   │   │   ├── components/ ReviewFormModal.tsx, StarRating.tsx
│   │   │   └── types/ review.ts
│   │   ├── faqs/
│   │   │   ├── hooks/ useFaqs.ts
│   │   │   ├── pages/ FaqListPage.tsx
│   │   │   ├── components/ FaqFormModal.tsx
│   │   │   └── types/ faq.ts
│   │   └── settings/                     # ADMIN ONLY
│   │       ├── hooks/ useSiteSettings.ts
│   │       ├── pages/ SettingsPage.tsx
│   │       └── types/ settings.ts
│   ├── shared/
│   │   ├── config/
│   │   │   ├── env.ts                     # wrap import.meta.env
│   │   │   ├── api-client.ts              # fetch wrapper + 401 refresh + envelope unwrap
│   │   │   ├── auth-central-client.ts     # redirectToGoogleLogin / refreshTokens / logout (→ iam.nedu.vn)
│   │   │   ├── token-storage.ts           # nlh_access_token / nlh_refresh_token
│   │   │   └── query-client.ts
│   │   ├── analytics/ ga4.ts, clarity.ts, RouteTracker.tsx, events.ts, index.ts
│   │   ├── components/                    # AppLayout, Sidebar, Topbar, DataTable, StatusPill,
│   │   │                                  # Modal, ConfirmDialog, ImageUpload, RepeaterList,
│   │   │                                  # SaveButton, Toast, EmptyState, Skeleton, RoleGate, SoonBadge
│   │   ├── stores/ useUiStore.ts          # sidebar mini, preview mode, fullscreen
│   │   └── types/ common.ts               # ContentStatus, Paginated<T>, ApiError…
│   └── mocks/
│       ├── init.ts                        # enableMocking()
│       ├── browser.ts, config.ts          # helpers: unauthorized/forbidden/notFound/badRequest
│       ├── handlers/                      # auth.ts, challenges.ts, articles.ts, lessons.ts,
│       │                                  # personas.ts, alumni.ts, reviews.ts, faqs.ts, settings.ts
│       └── data/                          # seed cho từng resource (lấy nguyên từ mockup nedu-cms.html)
├── .env.example
├── vercel.json
├── wrangler.jsonc
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── package.json
└── CLAUDE.md
```

**Nguyên tắc:** feature-first (chia theo domain, không theo loại file). Code dùng chéo ≥2 module → `shared/`. `shared/` chỉ chứa code domain-agnostic.

---

## 4. Database Schema (Supabase · PostgreSQL)

> snake_case, plural. `content` JSONB cho body lồng sâu (P3). `content_events` INSERT-only (P2). Không có bảng users — identity từ IAM (P1).

```sql
-- ENUM-like dùng text + CHECK cho linh hoạt (non-tech sửa qua CMS, không migrate DB)

-- ── CHALLENGES ───────────────────────────────────────────────
create table challenges (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique,                       -- nedu.vn/thu-thach/<slug>
  name          text not null,
  status        text not null default 'upcoming'   -- open | upcoming | closed
                check (status in ('open','upcoming','closed')),
  published     boolean not null default false,    -- false = Nháp (ẩn) ; true = Đã đăng
  start_date    date,                              -- ngày khai giảng (countdown)
  price_monthly text,                              -- promote để hiện ở list (P3)
  price_yearly  text,
  content       jsonb not null default '{}',       -- toàn bộ body editor (shape ở §5 ChallengeContent)
  created_by    text,                              -- IAM user id (P1)
  updated_by    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on challenges (status);
create index on challenges (published);

-- ── ARTICLES (Blog / Homepage) ───────────────────────────────
create table articles (
  id             uuid primary key default gen_random_uuid(),
  type           text not null default 'blog' check (type in ('blog','homepage')),
  title          text not null,
  slug           text,                              -- tự sinh từ title, sửa tay được
  excerpt        text,
  body           text,                              -- rich text HTML (TipTap output)
  cover_url      text,
  tags           text[] not null default '{}',
  published_date date,
  status         text not null default 'draft' check (status in ('published','draft')),
  seo            jsonb not null default '{}',       -- { seoTitle, seoDesc, ogTitle, ogDesc } (P3)
  created_by     text, updated_by text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index on articles (type);
create index on articles (status);

-- ── LESSONS (theo khoá học, cho learn.nedu.vn) ───────────────
create table lessons (
  id          uuid primary key default gen_random_uuid(),
  course      text not null,                        -- tên khoá (borrow ref, free text ở bản này)
  title       text not null,
  cohort      text,
  video_url   text,                                 -- rỗng → "Chưa có video"
  status      text not null default 'draft' check (status in ('published','draft')),
  order_index int not null default 0,
  created_by  text, updated_by text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index on lessons (course);

-- ── TEST CONFIG: personas + problems (ADMIN) ─────────────────
create table personas (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  icon        text,                                 -- emoji
  instruction text,
  status      text not null default 'draft' check (status in ('published','draft')),
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
-- App-side: tối đa 9 personas

create table persona_problems (
  id          uuid primary key default gen_random_uuid(),
  persona_id  uuid not null references personas(id) on delete cascade,
  title       text not null,
  description text,
  course_slug text,                                 -- ánh xạ tới khoá học (borrow ref)
  urgency     text,
  order_index int not null default 0,
  created_at  timestamptz not null default now()
);
-- App-side: tối đa 8 problems / persona

-- ── ALUMNI (alumni.nedu.vn) ──────────────────────────────────
create table alumni (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  quote      text,
  type       text not null default 'spotlight' check (type in ('spotlight','event','job')),
  status     text not null default 'draft' check (status in ('published','draft')),
  created_by text, updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── REVIEWS (đánh giá học viên) ──────────────────────────────
create table reviews (
  id         uuid primary key default gen_random_uuid(),
  student    text not null,
  cohort     text,
  course     text,
  rating     int not null default 5 check (rating between 1 and 5),
  month      text,                                  -- YYYY-MM
  featured   boolean not null default false,
  status     text not null default 'draft' check (status in ('published','draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── FAQS (theo danh mục) ─────────────────────────────────────
create table faqs (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,
  question    text not null,
  answer      text,
  status      text not null default 'draft' check (status in ('published','draft')),
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── SITE SETTINGS (singleton · ADMIN) ────────────────────────
create table site_settings (
  id           int primary key default 1 check (id = 1),  -- singleton row
  students     text, cohorts text, avg_rating text, course_types text,
  headline     text, subheadline text,
  cta_label    text, cta_url text, yt_playlist text,
  updated_by   text,
  updated_at   timestamptz not null default now()
);

-- ── CONTENT EVENTS (audit · INSERT-only · P2) ────────────────
create table content_events (
  id          uuid primary key default gen_random_uuid(),
  entity_type text not null,                         -- 'challenge'|'article'|'persona'|...
  entity_id   uuid,
  action      text not null,                         -- create|update|publish|unpublish|delete|publish_all
  actor       text,                                  -- IAM user id
  meta        jsonb default '{}',
  created_at  timestamptz not null default now()
);
-- KHÔNG cho UPDATE/DELETE (P2). RLS chỉ cho SELECT + INSERT.
```

### RLS policies (hợp đồng cho IT — enforcement chính ở API layer)

> Role lấy từ JWT claim `role` ('editor' | 'admin') do IAM cấp. Frontend bản mock không chạm Supabase trực tiếp; RLS là defense-in-depth khi BE thật lên.

```sql
-- Bật RLS mọi bảng
alter table challenges       enable row level security;
alter table articles         enable row level security;
alter table lessons          enable row level security;
alter table personas         enable row level security;
alter table persona_problems enable row level security;
alter table alumni           enable row level security;
alter table reviews          enable row level security;
alter table faqs             enable row level security;
alter table site_settings    enable row level security;
alter table content_events   enable row level security;

-- Helper: role từ JWT
-- auth.jwt() ->> 'role'  ∈ {'editor','admin'}

-- Editor + admin: full CRUD nội dung biên tập
create policy editor_rw_challenges on challenges for all
  using  (auth.jwt() ->> 'role' in ('editor','admin'))
  with check (auth.jwt() ->> 'role' in ('editor','admin'));
-- (lặp policy tương tự cho: articles, lessons, alumni, reviews, faqs)

-- ADMIN ONLY: personas, persona_problems, site_settings
create policy admin_rw_personas on personas for all
  using (auth.jwt() ->> 'role' = 'admin') with check (auth.jwt() ->> 'role' = 'admin');
create policy admin_rw_problems on persona_problems for all
  using (auth.jwt() ->> 'role' = 'admin') with check (auth.jwt() ->> 'role' = 'admin');
create policy admin_rw_settings on site_settings for all
  using (auth.jwt() ->> 'role' = 'admin') with check (auth.jwt() ->> 'role' = 'admin');

-- content_events: INSERT-only cho mọi role đã auth, SELECT cho admin (P2)
create policy events_insert on content_events for insert
  with check (auth.jwt() ->> 'role' in ('editor','admin'));
create policy events_select on content_events for select
  using (auth.jwt() ->> 'role' = 'admin');
-- KHÔNG tạo policy update/delete cho content_events.
```

---

## 5. Types (TypeScript interfaces)

```ts
// shared/types/common.ts
export type ContentStatus = 'published' | 'draft';
export interface Paginated<T> { data: T[]; meta: { page: number; limit: number; total: number } }
export interface AuthUser { id: string; name: string; email: string; avatarUrl?: string; role: 'editor' | 'admin' }

// modules/challenges/types/challenge.ts
export type ChallengeStatus = 'open' | 'upcoming' | 'closed';

export interface Outcome      { icon: string; title: string; desc: string }
export interface CurriculumWeek { title: string; topics: string[] }
export interface Instructor   { name: string; avatarLetter: string; avatarUrl: string; title: string; bio: string; tags: string[]; highlights: string[] }
export interface ChallengeReview { avatarLetter: string; avatarUrl: string; name: string; role: string; topic: string; text: string }
export interface ChallengeFaq { q: string; a: string }
export interface Plan         { price: string; saving?: string; note?: string; benefits: string[] }

export interface ChallengeContent {              // ← lưu trong cột content jsonb (P3)
  countdown: { enabled: boolean };
  heroImg: string; heroImgMobile: string;
  subs: { outcomes: string; curriculum: string; instructor: string };
  outcomes: Outcome[];
  curriculum: CurriculumWeek[];
  instructor: Instructor;
  reviews: ChallengeReview[];
  faqs: ChallengeFaq[];
  plans: { monthly: Plan; yearly: Plan };
}
export interface Challenge {
  id: string; slug?: string; name: string;
  status: ChallengeStatus; published: boolean;
  startDate?: string;                            // dd/mm/yyyy (giữ format mockup)
  priceMonthly?: string; priceYearly?: string;
  content: ChallengeContent;
  updatedAt: string;
}

// modules/articles/types/article.ts
export interface ArticleSeo { seoTitle?: string; seoDesc?: string; ogTitle?: string; ogDesc?: string }
export interface Article {
  id: string; type: 'blog' | 'homepage';
  title: string; slug?: string; excerpt?: string;
  body?: string; coverUrl?: string; tags: string[];
  publishedDate?: string; status: ContentStatus; seo: ArticleSeo; updatedAt: string;
}

// modules/lessons/types/lesson.ts
export interface Lesson { id: string; course: string; title: string; cohort?: string; videoUrl?: string; status: ContentStatus; orderIndex: number }

// modules/test-config/types/persona.ts
export interface PersonaProblem { id?: string; title: string; description?: string; courseSlug?: string; urgency?: string }
export interface Persona { id: string; name: string; icon?: string; instruction?: string; status: ContentStatus; problems: PersonaProblem[] }

// modules/alumni/types/alumni.ts
export interface Alumni { id: string; title: string; quote?: string; type: 'spotlight' | 'event' | 'job'; status: ContentStatus; updatedAt: string }

// modules/reviews/types/review.ts
export interface Review { id: string; student: string; cohort?: string; course?: string; rating: number; month?: string; featured: boolean; status: ContentStatus }

// modules/faqs/types/faq.ts
export interface Faq { id: string; category: string; question: string; answer?: string; status: ContentStatus; orderIndex: number }

// modules/settings/types/settings.ts
export interface SiteSettings { students: string; cohorts: string; avgRating: string; courseTypes: string; headline: string; subheadline: string; ctaLabel: string; ctaUrl: string; ytPlaylist: string; updatedAt: string }
```

---

## 6. API Contracts

> Base URL: `${VITE_API_URL}/api`. Auth: `Authorization: Bearer <access_token>`. Envelope: single → `{ data: T }`, list paginated → `{ data: T[], meta }`, error → `{ statusCode, message, error }`. Bản này dùng MSW mock 100%; endpoint là hợp đồng để IT build BE thật.

```
# Auth (proxy / verify qua IAM)
GET    /auth/me                         → { data: AuthUser }

# Challenges
GET    /challenges?status=&q=&page=&limit=   → { data: Challenge[], meta }   (list, search, filter)
GET    /challenges/:id                  → { data: Challenge }
POST   /challenges                      → { data: Challenge }   (tạo từ template mẫu — server seed default content)
PATCH  /challenges/:id                  → { data: Challenge }   (lưu toàn bộ: fields + content)
DELETE /challenges/:id                  → 204

# Articles
GET    /articles?type=&q=&page=&limit=  → { data: Article[], meta }
GET    /articles/:id                    → { data: Article }
POST   /articles                        → { data: Article }
PATCH  /articles/:id                    → { data: Article }
DELETE /articles/:id                    → 204

# Lessons
GET    /lessons?course=                 → { data: Lesson[], meta }   (FE gom nhóm theo course)
POST   /lessons                         → { data: Lesson }
PATCH  /lessons/:id                     → { data: Lesson }
DELETE /lessons/:id                     → 204

# Test Config — ADMIN ONLY (403 nếu role != admin)
GET    /personas                        → { data: Persona[] }       (kèm problems lồng)
POST   /personas                        → { data: Persona }
PATCH  /personas/:id                    → { data: Persona }         (cập nhật persona + problems)
DELETE /personas/:id                    → 204
POST   /personas/publish-all            → { data: { published: number } }   (đẩy hết → test.nedu.vn)

# Alumni
GET    /alumni                          → { data: Alumni[], meta }
POST   /alumni    PATCH /alumni/:id    DELETE /alumni/:id

# Reviews
GET    /reviews                         → { data: Review[], meta }
POST   /reviews   PATCH /reviews/:id    DELETE /reviews/:id

# FAQs
GET    /faqs                            → { data: Faq[], meta }
POST   /faqs      PATCH /faqs/:id       DELETE /faqs/:id

# Site settings (singleton · ADMIN ONLY cho PATCH)
GET    /site-settings                   → { data: SiteSettings }
PATCH  /site-settings                   → { data: SiteSettings }

# AI — DEFERRED ("Sắp ra", §9). Khai báo trước, chưa implement:
POST   /ai/article-draft                → { data: { body: string } }
POST   /ai/personas-generate            → { data: { problems: PersonaProblem[] } }
```

**Quy tắc API client (bắt buộc):** không gọi `fetch` trực tiếp trong component; mọi request qua `shared/config/api-client.ts`; 401 → refresh + retry 1 lần, fail → clear auth + redirect `/login`.

---

## 7. Pages / Components chi tiết

> **Mockup `nedu-cms.html` là source of truth về giao diện.** Mô tả sát theo mockup. Routes nằm dưới `/dashboard/*`, bọc trong `<AppLayout>` (sidebar trái + nội dung phải).

### 7.0 AppLayout + Sidebar (US-01, US-02)
- **Sidebar trái 272px, nền trắng** (giống website), logo "N" + "Nedu CMS / cms.nedu.vn".
- Nav items (đúng thứ tự, mỗi item icon + label): **Tổng quan**; nhóm **Chương trình** (bung/thu) chứa con: Khoá học, Thử thách, Workshop (`Sắp ra`); **Bài viết**; **Bài học**; **Test Config**; **Alumni**; **Đánh giá**; **FAQ**; **Cài đặt site**.
  - "Khoá học" và "Workshop" gắn `<SoonBadge>` "Sắp ra" / "Đang cập nhật" — disabled.
  - Item đang chọn được tô sáng (`.on`). Mục con Thử thách dùng accent vàng `#F5B419`.
- **Nút thu gọn** (`ti-chevrons-left`): sidebar về chế độ chỉ-icon (66px). Trạng thái lưu trong `useUiStore`, giữ trong phiên.
- Footer sidebar: avatar + tên user + role (đọc từ `useAuthStore`). Mockup hardcode "Dev / Admin" → thay bằng user thật từ IAM.
- **RoleGate:** "Test Config" và "Cài đặt site" chỉ hiện/ cho vào khi `role === 'admin'`. Editor click vào → redirect overview (qua `AdminRoute`).

### 7.1 Overview (`/dashboard/overview`)
- Trang tổng quan đơn giản: card thống kê số lượng từng loại nội dung (số thử thách, bài viết, bài học…), shortcut tới các module. Không có trong mockup chi tiết → giữ tối giản, không bịa feature.

### 7.2 Thử thách — Danh sách (`/dashboard/challenges`) (US-03→06)
- Header: tiêu đề "Thử thách", phụ đề `"{n} thử thách · nedu.vn/thu-thach"`. Nút **"Thử thách mới"** (icon plus).
- Tools row: ô **tìm kiếm** placeholder "Tìm thử thách..." (lọc theo tên, **realtime khi gõ**, không phân biệt hoa/thường); 4 **pill lọc**: Tất cả / Đang mở / Sắp mở / Đã đóng (pill chọn tô nổi bật; kết hợp được với search).
- **Bảng** cột: `Thử thách | Học phí | Khai giảng | Trạng thái | (Sửa)`.
  - Trạng thái = pill màu: Đang mở (xanh) / Sắp mở (vàng) / Đã đóng (xám).
  - Mỗi dòng nút **"Sửa"** → mở editor `/dashboard/challenges/:id/edit`.
- **"Thử thách mới"**: gọi `POST /challenges` (server trả content mẫu: tên, 6 outcomes, 4 tuần, instructor, reviews, faqs, plans — đúng seed trong mockup `blankData()`), rồi điều hướng thẳng vào editor.

### 7.3 Thử thách — Trình soạn thảo (`/dashboard/challenges/:id/edit`) ⭐ PHẦN PHỨC TẠP NHẤT (US-07→16)
Layout 3 phần: **section-nav (trái)** | **editor (giữa)** | **live preview (phải)**.

**Section nav** — 7 mục, click chuyển section, mục đang chọn tô sáng:
`Banner & Thông tin · Sau 30 ngày · Chương trình · Người đồng hành · Học viên nói gì · FAQ · Giá & Quyền lợi`

**Editor — từng section (mọi field liệt kê đủ):**
1. **Banner** (US-07): `Tên thử thách` (text, bắt buộc); `Trạng thái` (select: Đang mở/Sắp mở/Đã đóng); `Hiển thị` (select: Đã đăng (public) / Nháp (ẩn) = `published`); upload **Ảnh Desktop** (1440×600) + **Ảnh Mobile** (390×500) — click vùng ảnh để chọn, preview ngay; hint "Để trống → giữ gradient mặc định". (Ngày khai giảng + công tắc countdown — xem US-14, nằm ở thanh editor toolbar.)
2. **Sau 30 ngày / Outcomes** (US-08): field "Ghi chú dưới tiêu đề"; danh sách mục, mỗi mục = `Icon` (emoji) + `Tiêu đề` + `Mô tả`; nút **Thêm mục** / **Xóa** từng mục.
3. **Chương trình / Curriculum** (US-09): "Ghi chú dưới tiêu đề"; danh sách tuần, mỗi tuần = `Tên tuần` + danh sách `Nội dung (topics)` thêm/xóa; topic trống tự loại khi lưu.
4. **Người đồng hành / Instructor** (US-10): "Ghi chú"; upload `Ảnh đại diện` (400×400, tròn — trống thì hiện chữ cái đầu của tên); `Họ tên`; `Chức danh`; danh sách `Tags` (thêm/xóa); `Giới thiệu` (textarea); danh sách `Điểm nổi bật` (thêm/xóa).
5. **Học viên nói gì / Reviews** (US-11): danh sách review, mỗi review = `Ảnh` (tròn, fallback chữ cái) + `Họ tên` + `Nghề nghiệp` + `Đã tốt nghiệp (topic)` + `Nội dung đánh giá` (textarea); nút **Thêm học viên** / **Xóa**.
6. **FAQ** (US-12): danh sách Q&A, mỗi mục = `Câu hỏi` + `Câu trả lời` (textarea); thêm/xóa.
7. **Giá & Quyền lợi** (US-13): **Gói tháng**: `Giá/tháng` + danh sách `Quyền lợi` (thêm/xóa). **Gói năm**: `Giá/năm` + `Tiết kiệm` + `Ghi chú` + danh sách `Quyền lợi`. Hint "Để trống ô → ẩn khỏi bảng giá"; quyền lợi trống tự loại khi lưu.

**Editor toolbar (trên cùng editor):**
- `Ngày khai giảng` (input dd/mm/yyyy) + **công tắc bật/tắt Đếm ngược** (US-14) → phản ánh ngay trong preview.
- Nút chuyển **Máy tính / Điện thoại** cho preview (US-15).
- Nút **Phóng to** (fullscreen preview, ẩn sidebar + editor) (US-02, US-15).
- Nút **"Lưu & Cập nhật"** (US-16): trạng thái "Đang lưu..." → thành công "Đã lưu lúc HH:MM" + icon xanh; lỗi → cảnh báo đỏ. Gọi `PATCH /challenges/:id` với toàn bộ fields + content.

**`<ChallengePreview>`** (US-15): render trang landing thử thách đầy đủ từ `content`, **cập nhật realtime theo từng thay đổi** (debounce nhẹ). Hỗ trợ desktop ↔ mobile (đổi ảnh hero + layout cột). Section đang sửa được **highlight** (outline vàng + nhãn "✏ Đang chỉnh sửa") — đúng như mockup. Countdown chạy live nếu bật. Đây là bản dựng lại landing nedu.vn/thu-thach từ data CMS.

### 7.4 Bài viết (`/dashboard/articles`) (US-17→20)
- **List**: bảng `Bài viết | Loại | Ngày đăng | Trạng thái | (Sửa/Xoá)`. Loại = badge `✍️ Blog` / `🏠 Homepage`. Trạng thái badge Đã đăng / Nháp.
- **Xoá** (US-20): `ConfirmDialog` cảnh báo không hoàn tác.
- **Editor** (`/dashboard/articles/:id/edit`, full page) (US-18): `Loại` (Blog/Homepage); `Tiêu đề` (bắt buộc — lỗi nếu trống khi lưu); `Đường dẫn` (tự sinh từ tiêu đề, sửa tay được); `Mô tả/excerpt`; **RichTextEditor (TipTap)** hỗ trợ B/I/S, H2/H3, danh sách, trích dẫn; `Ảnh bìa` (kéo-thả hoặc click); `Tags` (ngăn cách dấu phẩy); `Ngày đăng`; `Trạng thái`.
  - Nút **"Viết bài với AI"** → DISABLED + `<SoonBadge>` "Sắp ra" (§9).
  - **SEO** (US-19, không bắt buộc): `Tiêu đề Google` (gợi ý 50–60 ký tự, có đếm ký tự); `Mô tả Google` (120–160); `Tiêu đề chia sẻ MXH (OG)`; `Mô tả chia sẻ MXH`.

### 7.5 Bài học (`/dashboard/lessons`) (US-21→22)
- List **gom nhóm theo khoá** (📚), hiện số thứ tự trong khoá; mỗi dòng: tên bài, cohort, trạng thái video (Có / Chưa có), trạng thái xuất bản, nút Sửa/Xoá.
- Form (modal) (US-22): `Khoá học`, `Tên bài học` (bắt buộc), `Cohort`, `Link video`, `Trạng thái`. Không có link video → hiện "Chưa có video".

### 7.6 Test Config (`/dashboard/test-config`) — **ADMIN ONLY** (US-23→25)
- Layout 2 cột: **trái** = danh sách persona (tối đa 9, icon + tên + trạng thái); **phải** = chi tiết persona đang chọn.
- Chi tiết persona: `icon`, `tên`, `instruction`; danh sách **vấn đề MaxDiff** (tối đa 8, cảnh báo khi vượt) mỗi vấn đề = `tiêu đề` + `mô tả ngắn` + `course slug` + `urgency message`; thêm/sửa/xóa.
- Nút **Thêm persona** (cảnh báo nếu > 9), **Lưu**, **Xóa persona** (ConfirmDialog).
- Nút **"Publish All → test.nedu.vn"** (US-25): `POST /personas/publish-all` → mọi persona thành Published, toast xác nhận, badge "✅ Published".
- Nút **"Generate problems"** → DISABLED + "Sắp ra" (§9).

### 7.7 Alumni (`/dashboard/alumni`) (US-26)
- List: `Tiêu đề | Loại | Trạng thái | Cập nhật`. Loại badge `⭐ Spotlight / 📅 Event / 💼 Job`.
- Form (modal): `Tiêu đề` (bắt buộc), `Trích dẫn/Mô tả`, `Loại`, `Trạng thái`. Ngày cập nhật tự ghi khi lưu.

### 7.8 Đánh giá (`/dashboard/reviews`) (US-27)
- List: `Học viên | Khoá học | Rating (sao) | Tháng | Trạng thái`. Review Featured → badge riêng.
- Form (modal): `Tên học viên` (bắt buộc), `Khoá học`, `<StarRating>` (click 1–5 sao), `Tháng`, công tắc `Featured`, `Trạng thái`.

### 7.9 FAQ (`/dashboard/faqs`) (US-28)
- List **gom theo danh mục**. Form (modal): `Danh mục`, `Câu hỏi` (bắt buộc), `Câu trả lời`, `Trạng thái`. Xoá có ConfirmDialog.

### 7.10 Cài đặt site (`/dashboard/settings`) — **ADMIN ONLY** (US-29→30)
- **Thống kê & Hero**: `Số học viên`, `Số cohort`, `Đánh giá trung bình`, `Loại hình khoá học`, `Tiêu đề Hero (headline)`, `Phụ đề Hero (subheadline)`. Hiện "Cập nhật lần cuối".
- **CTA & Playlist**: `Nhãn nút CTA`, `URL nút CTA`, `YouTube Playlist Review` (link). Nút **"Lưu cài đặt"** → `PATCH /site-settings`.

---

## 8. Shared Components (không duplicate)

| Component | Mô tả ngắn |
|---|---|
| `AppLayout` | Khung sidebar + content, bọc các route /dashboard. |
| `Sidebar` | Nav 10 mục, nhóm Chương trình bung/thu, thu gọn 66px, RoleGate cho admin item. |
| `Topbar` | (nếu cần) breadcrumb + tên trang. |
| `DataTable` | Bảng list chung: cột config, empty state, row actions. Dùng cho articles/lessons/alumni/reviews/faqs/challenges. |
| `StatusPill` | Pill trạng thái: published/draft + open/upcoming/closed (màu khác nhau). |
| `Modal` / `ConfirmDialog` | Modal form chung (thay `openOv` trong mockup) + dialog xác nhận xoá "không hoàn tác". |
| `ImageUpload` | Upload ảnh click/kéo-thả, preview, fallback chữ cái (avatar tròn) hoặc placeholder (banner). FileReader → base64 ở bản mock. |
| `RepeaterList` | Danh sách field thêm/xóa từng dòng (outcomes, topics, tags, highlights, benefits, reviews, faqs, problems). |
| `SaveButton` | Nút lưu 3 trạng thái: idle / "Đang lưu..." / "Đã lưu lúc HH:MM" / lỗi đỏ. |
| `Toast` | Thông báo nổi góc dưới (thay `toast()` mockup). |
| `StarRating` | Chọn/hiện 1–5 sao (reviews). |
| `RoleGate` | Bọc UI chỉ-admin; ẩn hoặc disable theo role. |
| `SoonBadge` | Nhãn "Sắp ra" / "Đang cập nhật" cho item/nút chưa làm. |
| `EmptyState` / `Skeleton` | Trạng thái rỗng + loading cho list (API fallback — không để trang trắng). |

---

## 9. AI Layer — DEFERRED ("Sắp ra", làm sau)

Bản này **KHÔNG implement AI**. Chỉ giữ 2 nút ở trạng thái DISABLED + `<SoonBadge>`:
1. **"Viết bài với AI"** (Bài viết) — dự kiến: `POST /ai/article-draft` sinh `body` HTML từ tiêu đề + dàn ý.
2. **"Generate problems"** (Test Config) — dự kiến: `POST /ai/personas-generate` sinh danh sách vấn đề MaxDiff từ instruction persona.

Khi làm thật (sprint sau), bổ sung: system prompt (giọng Nedu, tiếng Việt, phù hợp người trưởng thành), user template, guardrails (không bịa số liệu, độ dài giới hạn, output đúng schema). **Không build bây giờ** — chỉ chừa chỗ.

---

## 10. Build Order (sprint-by-sprint, theo dependency)

> Data model / nền tảng trước, UI sau. Mỗi sprint xong → list file → người dùng confirm → sang sprint kế.

**Sprint 1 — Foundation (chạy được login mock end-to-end)**
- Scaffold Vite + React + TS; cài deps (§Tech Stack); `vite.config.ts` alias `@ @shared @modules @routes` + plugin react/tailwind/cloudflare.
- `shared/config/`: `env.ts`, `token-storage.ts` (keys `nlh_access_token`/`nlh_refresh_token`), `auth-central-client.ts` (→ `iam.nedu.vn`), `api-client.ts` (401 refresh + envelope), `query-client.ts`.
- `shared/analytics/` (GA4 + Clarity, gate theo hostname prod).
- `modules/auth/`: `useAuthStore` (có mock branch đọc `mock_uid`), `LoginPage`, `AuthCallbackPage`.
- `routes/`: `AppRouter`, `ProtectedRoute`, `AdminRoute`.
- `mocks/`: `init.ts`, `browser.ts`, `config.ts`, handler `/auth/me` (trả AuthUser có role); `npx msw init public/`.
- `main.tsx`: `await enableMocking() → analytics.init() → render`.
- `.env.example` (5 var), `vercel.json`, `wrangler.jsonc` (name `nedu-cms`, dev `nedu-cms-dev`, prod `nedu-cms-prod`).
- **Verify:** `npm run dev` → vào được /dashboard ở mock mode.

**Sprint 2 — Shared UI + mock data toàn bộ**
- `shared/components/`: AppLayout, Sidebar (10 mục + nhóm + collapse + RoleGate), DataTable, StatusPill, Modal, ConfirmDialog, ImageUpload, RepeaterList, SaveButton, Toast, StarRating, SoonBadge, EmptyState, Skeleton.
- `useUiStore` (sidebar mini, preview mode, fullscreen).
- `mocks/data/` + `mocks/handlers/` cho tất cả resource (seed lấy từ `nedu-cms.html`).
- Overview page.

**Sprint 3 — Thử thách (list + editor 7 phần + live preview)** ⭐ trọng tâm
- ChallengeListPage (search/filter/new). ChallengeEditorPage + 7 section components + ChallengeSectionNav + toolbar (countdown, device toggle, fullscreen, SaveButton).
- `ChallengePreview` desktop/mobile, realtime, highlight section đang sửa, countdown live.
- `useChallenges` hooks.

**Sprint 4 — Bài viết + Bài học**
- Article list + editor (TipTap rich text + SEO + cover + tags), delete confirm, validate tiêu đề.
- Lesson list (group theo course) + form modal.

**Sprint 5 — Test Config (admin) + Alumni + Đánh giá + FAQ**
- Test Config 2 cột (personas ≤9, problems ≤8, publish-all) — AdminRoute.
- Alumni / Reviews (StarRating + Featured) / FAQ (group danh mục) — list + modal CRUD.

**Sprint 6 — Cài đặt site + hoàn thiện + deploy**
- Settings (admin). Polish empty/loading/error mọi list. Chuẩn bị deploy (xem §12 cuối).

---

## 11. Environment Variables (`.env.example`)

```bash
VITE_API_URL=http://localhost:8080            # Backend (api.nedu.vn). Mock mode: không cần BE chạy.
VITE_AUTH_CENTRAL_URL=https://iam.nedu.vn     # IAM — cấp quyền + Google OAuth (xem §13)
VITE_ENABLE_MOCKING=true                       # true = data giả (dev + Vercel preview). Prod CF = false.
VITE_GA4_ID=                                    # để trống = tắt
VITE_CLARITY_ID=                                # để trống = tắt
```

---

## 12. Câu lệnh mở đầu cho Claude Code

```
Đọc CLAUDE.md.

Build nedu-cms (cms.nedu.vn) theo đúng spec trong file này.
Đây là Vite portal chuẩn NLH, chạy ở chế độ DATA GIẢ (MSW mock) — chưa nối backend thật.
Bắt đầu Sprint 1 (Foundation): scaffold + stack + auth qua iam.nedu.vn + MSW + AppLayout khung.
Mục tiêu cuối Sprint 1: npm run dev vào được /dashboard ở mock mode.
Tạo xong thì list ra tất cả file đã tạo. Tôi confirm rồi mới qua Sprint 2.

Ràng buộc: không đổi tech stack; không thêm thư viện ngoài danh sách §2;
không build feature ngoài spec; 2 nút AI để DISABLED + "Sắp ra"; mọi list phải có empty/loading state.
```

---

## 13. Khi nào lệch template (exception có chủ đích)

1. **Auth-central = `iam.nedu.vn`** (không phải `auth-central.vn` như reference NLH).
   - *Why:* Org dùng IAM riêng tại iam.nedu.vn; admin được cấp quyền ở IAM trước rồi mới đăng nhập Google vào portal được.
   - *How:* `VITE_AUTH_CENTRAL_URL=https://iam.nedu.vn`. `auth-central-client.ts` trỏ về domain này. Token keys vẫn giữ chuẩn `nlh_access_token` / `nlh_refresh_token`. Role ('editor'|'admin') đọc từ JWT claim do IAM phát; portal KHÔNG tự quản user (P1).

2. **Rich text dùng TipTap v2** (thêm ngoài stack lock-in).
   - *Why:* Mockup dùng `contentEditable` + `document.execCommand` (deprecated, vỡ trong React). US-18 cần B/I/S, H2/H3, list, quote ổn định.
   - *How:* Chỉ dùng trong `modules/articles/components/RichTextEditor.tsx`. Output HTML lưu vào `articles.body`. Không lan sang module khác.

3. **Build mock-first, chưa nối BE.** RLS + API contract (§4, §6) là hợp đồng cho IT nối `api.nedu.vn` sau. Khi nối thật: set `VITE_ENABLE_MOCKING=false`, point `VITE_API_URL` → api.nedu.vn, bỏ mock handlers khỏi prod bundle.

---

## 14. Context module khác trong hệ Nedu (đừng build trùng)

| Module | Domain | Repo | Status |
|---|---|---|---|
| Public Website | nedu.vn | nedu-public | LIVE |
| **CMS (file này)** | **cms.nedu.vn** | **nedu-cms** | **Spec done** |
| Backend API | api.nedu.vn | nedu-backend | IT đang build |
| IAM (auth) | iam.nedu.vn | — | Cấp quyền + OAuth |
| Student Portal | learn.nedu.vn | nedu-learn | Planned |
| Alumni Portal | alumni.nedu.vn | nedu-alumni | Planned |
| Test Portal | test.nedu.vn | nedu-test | Planned |

CMS **sở hữu** mọi bảng nội dung ở §4. CMS **mượn** identity/role từ IAM (không lưu user). `lessons.course` và `persona_problems.course_slug` là tham chiếu khoá học (free text bản này; tương lai borrow từ `nedu-backend`, join qua slug — không duplicate bảng courses).

---

*NL-CLAUDE-003 v1.0 · NhiLe Holdings · 2026 · Source: user-stories-cms-nedu.docx + nedu_cms_big_picture.html + nedu-cms.html*
