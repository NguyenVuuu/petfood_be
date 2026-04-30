# User Service

User-service la single source of truth cho user profile.

## Security & Authorization

- JWT middleware xac thuc nguoi dung (`req.auth`)
- Role middleware cho admin (`req.auth.role === "admin"`)
- User self-service su dung `req.auth.sub`, khong cho sua user khac
- Khong tra password trong moi response (tru endpoint noi bo cho auth-service)

## User Self-Service

- `GET /users/me`
- `PATCH /users/me`
- `PATCH /users/me/password`

`PATCH /users/me` chi nhan du lieu JSON, avatar la URL string (`avatarUrl`).
Upload file phai thong qua upload-service.

## Admin APIs

- `GET /users?page=1&limit=20&email=`
- `PATCH /users/:id/role`
- `PATCH /users/:id/restore`

Yeu cau admin token.

## Internal APIs (for auth-service)

- `POST /users`
- `GET /users/email/:email`
- `GET /users/:id`

## Environment

```env
NODE_ENV=development
USER_PORT=3002
USER_CORS_ORIGIN=*
USER_BCRYPT_SALT_ROUNDS=10
USER_MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/petfood_user?retryWrites=true&w=majority
JWT_SECRET=petfood_secret_key
```

## Run

```bash
cd be/petfood_be/user-service
npm install
npm run dev
```
