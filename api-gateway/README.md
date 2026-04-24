# API Gateway

Gateway la diem vao duy nhat cho frontend. Frontend chi can goi 1 base URL va gateway se proxy den cac service ben trong.

## Chuc nang da hoan thien

- Proxy `auth-service` qua prefix `/api/auth`
- Proxy `product-service` qua prefix `/api/products`
- Proxy `cart-service` qua prefix `/api/cart`
- CORS + security headers + compression + log request
- Rate limit co ban cho cac route `/api/*`
- Health check cho gateway

## Bien moi truong

Tao file `.env` trong `api-gateway` (hoac root `petfood_be`) theo `.env.example`:

```env
NODE_ENV=development
API_GATEWAY_PORT=3000
API_GATEWAY_CORS_ORIGIN=*
API_GATEWAY_RATE_LIMIT_WINDOW_MS=900000
API_GATEWAY_RATE_LIMIT_MAX=200

AUTH_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3003
CART_SERVICE_URL=http://localhost:3007
```

## Chay gateway

```bash
cd be/petfood_be/api-gateway
npm install
npm run dev
```

Gateway mac dinh chay tai: `http://localhost:3000`

## Health API

- `GET /health`
- `GET /api/health`

## API danh cho frontend (goi qua gateway)

Base URL frontend nen dung:

```text
http://localhost:3000
```

### Auth APIs

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Product APIs

- `GET /api/products`
- `GET /api/products/search`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Cart APIs

- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:productId`
- `DELETE /api/cart/items/:productId`
- `DELETE /api/cart`
- `POST /api/cart/validate`
- `POST /api/cart/merge`

## Luu y cho frontend team

- Neu dung refresh token cookie (`/api/auth/refresh`, `/api/auth/logout`) thi FE can bat `withCredentials: true`.
- API tao/sua product co upload anh: dung `multipart/form-data`.
- Search theo ten dung query `keyword`, vi du: `/api/products?keyword=fish`.

## Note cho AI Agent khac

- Khi mount proxy bang `app.use("/api/products", ...)` hoac `app.use("/api/auth", ...)`, Express se bo prefix da mount truoc khi request vao middleware proxy.
- Neu khong `pathRewrite` de them lai prefix, request co the bi forward sai path (vi du `/api/products?limit=8` bi thanh `/?limit=8`) va service dich se tra `404`.
- Gateway nay da co `pathRewrite` trong [src/app.js](D:/IUH/25_26_HK2/KTTK/btl/prj01/be/petfood_be/api-gateway/src/app.js) de dam bao:
  - `/api/auth/*` -> `auth-service` nhan dung `/api/auth/*`
  - `/api/products/*` -> `product-service` nhan dung `/api/products/*`
  - `/api/cart/*` -> `cart-service` nhan dung `/api/cart/*`
