# Auth Service

Service nay da hoan thien cac API co ban cho xac thuc nguoi dung bang MongoDB + JWT.

## Chuc nang da co

- `POST /api/auth/register`: dang ky tai khoan moi
- `POST /api/auth/login`: dang nhap va nhan JWT
- `GET /api/auth/me`: lay thong tin nguoi dung hien tai bang Bearer token
- `GET /health`: kiem tra service song

## Cac bien moi truong can co

File [`.env`](D:/IUH/25_26_HK2/KTTK/btl/prj01/be/petfood_be/.env) da duoc bo sung:

```env
AUTH_PORT=3001
AUTH_MONGODB_URI=mongodb+srv://...
JWT_SECRET=petfood_secret_key
JWT_EXPIRES_IN=7d
```

## Cach chay

Tu thu muc [auth-service](D:/IUH/25_26_HK2/KTTK/btl/prj01/be/petfood_be/auth-service):

```powershell
npm start
```

hoac:

```powershell
npm run dev
```

Service mac dinh chay o `http://localhost:3001`.

## Test bang Postman

### 1. Dang ky

- Method: `POST`
- URL: `http://localhost:3001/api/auth/register`
- Body JSON:

```json
{
  "fullName": "Vu Pro",
  "email": "vu@example.com",
  "password": "12345678"
}
```

Ky vong:

- Status `201`
- Response co `token` va `user`

### 2. Dang nhap

- Method: `POST`
- URL: `http://localhost:3001/api/auth/login`
- Body JSON:

```json
{
  "email": "vu@example.com",
  "password": "12345678"
}
```

Ky vong:

- Status `200`
- Response co `token`

### 3. Lay thong tin user bang JWT

- Method: `GET`
- URL: `http://localhost:3001/api/auth/me`
- Header:

```text
Authorization: Bearer <token_nhan_duoc_tu_login_hoac_register>
```

Ky vong:

- Status `200`
- Response tra ve `user`
