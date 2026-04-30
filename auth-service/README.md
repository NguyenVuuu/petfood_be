# Auth Service

Auth-service chiu trach nhiem xac thuc va quan ly session refresh token.

## Kien truc

- Auth-service KHONG co User model
- User-service la nguon du lieu user duy nhat
- Auth-service goi HTTP sang user-service qua Axios

## Chuc nang

- `POST /auth/register` (alias: `/api/auth/register`)
- `POST /auth/login` (alias: `/api/auth/login`)
- `GET /auth/me` (alias: `/api/auth/me`)
- `POST /auth/refresh` (alias: `/api/auth/refresh`)
- `POST /auth/logout` (alias: `/api/auth/logout`)
- `GET /health`

## Bao mat

- JWT access token
- Refresh token luu trong HttpOnly cookie
- Refresh token rotation
- Session TTL index (`expiresAt`)
- Input validation bang Joi

## Environment

```env
AUTH_PORT=3001
AUTH_MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/petfood_auth?retryWrites=true&w=majority
AUTH_CORS_ORIGIN=*

JWT_SECRET=petfood_secret_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=petfood_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d

USER_SERVICE_URL=http://localhost:3002
AUTH_USER_SERVICE_TIMEOUT_MS=5000
```

## Run

```bash
cd be/petfood_be/auth-service
npm install
npm run dev
```
