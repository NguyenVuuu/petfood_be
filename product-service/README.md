# Product Service

Service nay quan ly san pham va metadata hinh anh. Product-service KHONG upload truc tiep len S3/Cloudinary, ma goi upload-service qua HTTP.

## Chuc nang

- CRUD san pham
- Xem chi tiet san pham theo id
- Tim kiem theo ten (`keyword`)
- Loc theo `categoryId`
- Validate `categoryId` voi category-service
- Upload/doi/xoa anh thong qua upload-service

## Cong nghe

- Node.js + Express
- MongoDB + Mongoose
- Joi validation
- Axios (goi category-service + upload-service)
- Multer (nhan multipart tu client)

## Cau hinh moi truong

```env
NODE_ENV=development
PRODUCT_PORT=3003
PRODUCT_MONGODB_URI=mongodb://localhost:27017/petfood_product
PRODUCT_CORS_ORIGIN=*

CATEGORY_SERVICE_URL=http://localhost:3005
PRODUCT_CATEGORY_TIMEOUT_MS=5000

UPLOAD_SERVICE_URL=http://localhost:3006
PRODUCT_UPLOAD_SERVICE_TIMEOUT_MS=15000

PRODUCT_IMAGE_MAX_SIZE_MB=5
PRODUCT_IMAGE_ALLOWED_MIME=image/jpeg,image/png,image/webp
```

## Chay service

```bash
cd be/petfood_be/product-service
npm install
npm run dev
```

Health:

- `GET /health`

## API

Base path: `/api/products`

- `POST /api/products` (multipart, bat buoc `image`)
- `GET /api/products`
- `GET /api/products/search`
- `GET /api/products/:id`
- `PUT /api/products/:id` (multipart optional `image`)
- `DELETE /api/products/:id`

Query list:

- `keyword` (optional)
- `categoryId` (optional)
- `page`, `limit`
- `sortBy`: `createdAt|updatedAt|name|price`
- `sortOrder`: `asc|desc`

## Upload flow

- Tao/sua product co `image`: product-service gui file sang upload-service (`type=product`)
- Upload-service tra `url`, `provider`, `key`
- Product-service luu vao DB: `imageUrl`, `imageKey`, `imageProvider`
- Khi doi/xoa product: product-service goi upload-service de delete file cu

## Loi thuong gap

- `400`: validation loi, category khong ton tai/inactive, file sai dinh dang
- `404`: product khong ton tai
- `502`: category-service hoac upload-service khong san sang
- `500`: loi noi bo
