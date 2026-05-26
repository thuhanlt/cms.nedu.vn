# nedu-cms

> Trang quản trị nội dung cho hệ sinh thái Nedu · `cms.nedu.vn` · NhiLe Holdings
> Spec đầy đủ: xem `CLAUDE.md` trong thư mục này.

Team nội dung non-tech soạn nội dung → xem trước → xuất bản lên 4 site đầu ra (`nedu.vn`, `learn.nedu.vn`, `alumni.nedu.vn`, `test.nedu.vn`).

## ⚡ Quickstart (5 phút)

```bash
# 1. Cài thư viện (lần đầu)
npm install

# 2. Chạy thử ở chế độ data giả
npm run dev
# → mở http://localhost:5173

# 3. Đăng nhập: click "Vào CMS (mock)" — không cần Google
# 4. Đổi vai trò Quản trị viên ↔ Biên tập viên để test phân quyền
```

## 🧭 9 module nội dung

| Route                          | Tên                | Ai dùng       |
| ------------------------------ | ------------------ | ------------- |
| `/dashboard/overview`          | Tổng quan          | Mọi role      |
| `/dashboard/challenges`        | Thử thách + Editor | Editor + Admin |
| `/dashboard/articles`          | Bài viết + Editor  | Editor + Admin |
| `/dashboard/lessons`           | Bài học            | Editor + Admin |
| `/dashboard/alumni`            | Alumni             | Editor + Admin |
| `/dashboard/reviews`           | Đánh giá           | Editor + Admin |
| `/dashboard/faqs`              | FAQ                | Editor + Admin |
| `/dashboard/test-config`       | Test Config        | **Chỉ Admin** |
| `/dashboard/settings`          | Cài đặt site       | **Chỉ Admin** |

## 🔧 npm scripts

| Lệnh                  | Tác dụng                                           |
| --------------------- | -------------------------------------------------- |
| `npm run dev`         | Chạy server dev ở `http://localhost:5173`         |
| `npm run build`       | Build production vào thư mục `dist/`              |
| `npm run preview`     | Mở thử bản đã build trên máy local                 |
| `npm run lint`        | Kiểm tra code style                                |
| `npm run deploy:dev`  | Deploy lên Cloudflare Workers `nedu-cms-dev`      |
| `npm run deploy:prod` | Deploy lên Cloudflare Workers `nedu-cms-prod` (`cms.nedu.vn`) |

## ⚙️ Biến môi trường (`.env`)

```bash
VITE_API_URL=http://localhost:8080            # Backend (api.nedu.vn)
VITE_AUTH_CENTRAL_URL=https://iam.nedu.vn     # IAM cấp quyền Google OAuth
VITE_ENABLE_MOCKING=true                       # true = data giả · false = gọi BE thật
VITE_GA4_ID=                                    # Để trống = tắt analytics
VITE_CLARITY_ID=                                # Để trống = tắt
```

**Chuyển từ data giả sang BE thật:**

1. Mở file `.env`
2. Sửa `VITE_ENABLE_MOCKING=false`
3. Sửa `VITE_API_URL=https://api.nedu.vn`
4. Restart `npm run dev` — request giờ đi tới BE thật

## 🚀 Deploy

| Đích             | Khi nào                          | Lệnh                  | Mock?  |
| ---------------- | -------------------------------- | --------------------- | ------ |
| **Vercel preview** | Cho non-tech xem thử             | Auto khi push branch  | `true` |
| **CF Workers dev** | Stage IT test với BE thật        | `npm run deploy:dev`  | `false`|
| **CF Workers prod**| Live tại `cms.nedu.vn`           | `npm run deploy:prod` | `false`|

**Setup Vercel lần đầu** (1 lần):

1. Project → Settings → Environment Variables → set 5 var ở trên cho Production
2. `VITE_ENABLE_MOCKING=true` (Vercel = preview cho non-tech, không cần BE)
3. Push lên branch → Vercel auto deploy

**Setup Cloudflare lần đầu** (1 lần):

```bash
npx wrangler login                          # Đăng nhập tài khoản CF
npx wrangler secret put VITE_API_URL --env production
# (lặp cho từng biến môi trường)
npm run deploy:prod
```

## 🏗️ Cấu trúc thư mục

```
src/
├── main.tsx                       # Bootstrap: mock → analytics → render
├── routes/                        # AppRouter + ProtectedRoute + AdminRoute
├── modules/                       # 1 folder = 1 domain
│   ├── auth/                      # Login + token + Google OAuth
│   ├── overview/                  # Dashboard tổng quan
│   ├── challenges/                # Thử thách + Editor 7 section + Preview
│   ├── articles/                  # Bài viết + TipTap rich text + SEO
│   ├── lessons/                   # Bài học gom theo khoá
│   ├── test-config/               # Persona MaxDiff (admin)
│   ├── alumni/                    # Spotlight / Event / Job
│   ├── reviews/                   # Đánh giá học viên + sao
│   ├── faqs/                      # FAQ gom theo danh mục
│   └── settings/                  # Cài đặt site (admin)
├── shared/                        # Code dùng chéo nhiều module
│   ├── config/                    # env, api-client, auth-central, token-storage
│   ├── analytics/                 # GA4 + Clarity
│   ├── components/                # DataTable, Modal, ImageUpload, ...
│   ├── stores/                    # useUiStore, useToastStore
│   └── types/                     # Common types
└── mocks/                         # MSW handlers + seed data
```

Nguyên tắc: **feature-first**, không technical-first. Code share ≥2 module → `shared/`.

## 📚 Tech stack

- **Vite 8** + **React 19** + **TypeScript strict**
- **React Router v7** (SPA, client-side routing)
- **TanStack Query v5** (server state)
- **Zustand v5** (client state cho auth + UI)
- **Tailwind v4** (styling)
- **MSW v2** (mock API ở chế độ vibe coding)
- **TipTap v3** (rich text editor cho bài viết)
- **lucide-react** (icon)
- **date-fns** v3 (format date)

Cấm thêm: Redux, Recoil, Jotai, SWR, Axios, MUI, Ant Design, styled-components. Cần gì khác → hỏi trước.

## 🐛 Troubleshooting

**Trang trắng sau khi `npm run dev`?**
→ Check console (F12). Thường do `mockServiceWorker.js` không nhận. Chạy lại: `npx msw init public/ --save`.

**Trang đăng nhập không vào được CMS?**
→ Đảm bảo `VITE_ENABLE_MOCKING=true` trong `.env`. Mock mode bypass Google OAuth.

**`npm run build` lỗi TypeScript?**
→ Đọc lỗi cụ thể trong terminal. Đa số là import path sai (`@modules/...` vs `@shared/...`).

**Deploy Cloudflare failed?**
→ Check `wrangler.jsonc`: `name` phải là `nedu-cms`, env `dev`/`production` phải tồn tại.

---

*Spec: `CLAUDE.md` — đọc trước khi build feature mới.*
