# Upload Service

Upload-service la gateway duy nhat den storage providers cho he thong microservice.

## Kien truc

- Provider pattern:
  - `UploadProvider` (base class)
  - `S3Provider`
  - `CloudinaryProvider`
- Provider factory theo `type`:
  - `avatar` -> `s3`
  - `product` -> `s3`
  - `chat` -> `cloudinary`

## APIs

- `POST /upload` (alias: `/api/upload`)
- `DELETE /upload` (alias: `/api/upload`)
- `POST /upload/presigned` (alias: `/api/upload/presigned`)
- `GET /health`

## 1) Upload file

`POST /upload`

Multipart form-data:

- `file` (required)
- `type` (required): `avatar | product | chat`

Response:

```json
{
  "url": "https://cdn.app.com/file.jpg",
  "provider": "s3",
  "key": "avatars/file-uuid.jpg",
  "metadata": {
    "type": "avatar",
    "size": 12345,
    "mimeType": "image/jpeg",
    "originalName": "my-avatar.jpg"
  }
}
```

## 2) Delete file (bonus)

`DELETE /upload`

Body JSON:

```json
{
  "provider": "s3",
  "key": "avatars/file-uuid.jpg"
}
```

## 3) Presigned URL (bonus)

`POST /upload/presigned`

Body JSON:

```json
{
  "type": "product",
  "fileName": "cat-food.png",
  "mimeType": "image/png",
  "expiresInSec": 600
}
```

Luu y: endpoint nay chi ho tro type dung S3 (`avatar`, `product`).

## Validation

- Chi cho phep: `image/jpeg`, `image/png`, `image/webp`
- Max size mac dinh: `5MB`

## Security

- Credential luu trong env
- Sanitize file name truoc khi tao key
- Khong expose secret qua response

## Run

```bash
cd be/petfood_be/upload-service
npm install
npm run dev
```
