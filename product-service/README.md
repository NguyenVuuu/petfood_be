# Product Service

Service nay quan ly san pham va anh san pham luu tren S3.

## Chuc nang da co

- CRUD san pham
- Xem chi tiet san pham theo id
- Tim kiem san pham theo tu khoa trong ten (`keyword`)
- Upload anh san pham len S3 voi key trong folder `image/products/`
- Khi cap nhat anh san pham: upload anh moi va xoa anh cu tren S3
- Khi xoa san pham: xoa anh cu tren S3

## Cong nghe

- Node.js + Express
- MongoDB + Mongoose
- AWS S3 SDK v3
- Joi validation
- Multer (multipart/form-data)

## Cau hinh moi truong

Tao file `.env` trong `product-service` (hoac root `petfood_be`) dua theo `.env.example`:

```env
NODE_ENV=development
PRODUCT_PORT=3003
PRODUCT_MONGODB_URI=mongodb://localhost:27017/petfood_product
PRODUCT_CORS_ORIGIN=*

AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET=your_bucket_name
AWS_S3_PUBLIC_BASE_URL=
PRODUCT_IMAGE_MAX_SIZE_MB=5
PRODUCT_IMAGE_ALLOWED_MIME=image/jpeg,image/png,image/webp
```

Luu y:

- Anh san pham duoc tao key dang `image/products/<timestamp>-<name>-<random>.<ext>`
- `AWS_S3_PUBLIC_BASE_URL` la tuy chon. Neu de trong, service dung URL mac dinh cua S3.

## Chay service

```bash
cd be/petfood_be/product-service
npm install
npm run dev
```

Health check:

```http
GET /health
```

## API

Base path: `/api/products`

### 1) Tao san pham

```http
POST /api/products
Content-Type: multipart/form-data
```

Form-data:

- `name` (string, required)
- `description` (string, optional)
- `price` (number, required)
- `stock` (number, required)
- `categoryId` (ObjectId string, optional)
- `isActive` (boolean, optional)
- `image` (file, required)

### 2) Lay danh sach san pham + tim kiem theo ten

```http
GET /api/products?keyword=fish&page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

Query:

- `keyword` (optional): tim theo ten, khong phan biet hoa thuong
- `page` (optional, default `1`)
- `limit` (optional, default `10`, max `100`)
- `sortBy` (optional): `createdAt|updatedAt|name|price`
- `sortOrder` (optional): `asc|desc`

Co the dung endpoint tuong duong:

```http
GET /api/products/search?keyword=fish
```

### 3) Xem chi tiet san pham

```http
GET /api/products/:id
```

### 4) Cap nhat san pham

```http
PUT /api/products/:id
Content-Type: multipart/form-data
```

Co the gui bat ky field nao can sua. Neu gui `image` moi:

- Anh moi duoc upload len S3
- Anh cu cua san pham se bi xoa tren S3

### 5) Xoa san pham

```http
DELETE /api/products/:id
```

Khi xoa:

- Ban ghi san pham bi xoa khoi MongoDB
- Anh cu cua san pham bi xoa khoi S3

## Huong dan tu test bang curl

Gia su service chay tai `http://localhost:3003`.

### Tao san pham

```bash
curl --location 'http://localhost:3003/api/products' \
--form 'name="Hat cho meo vi ca"' \
--form 'description="San pham thu nghiem"' \
--form 'price="120000"' \
--form 'stock="20"' \
--form 'isActive="true"' \
--form 'image=@"./sample-product.jpg"'
```

### Lay danh sach + search keyword

```bash
curl 'http://localhost:3003/api/products?keyword=ca&page=1&limit=10'
```

### Lay chi tiet

```bash
curl 'http://localhost:3003/api/products/<productId>'
```

### Cap nhat thong tin va doi anh (anh cu se bi xoa)

```bash
curl --location --request PUT 'http://localhost:3003/api/products/<productId>' \
--form 'name="Hat cho meo vi ca - moi"' \
--form 'price="130000"' \
--form 'image=@"./sample-product-new.jpg"'
```

### Xoa san pham (anh cu se bi xoa)

```bash
curl --location --request DELETE 'http://localhost:3003/api/products/<productId>'
```

## Cac ma loi thuong gap

- `400`: validation loi, sai dinh dang id, thieu image khi tao, file qua lon, sai mime type
- `404`: khong tim thay san pham
- `500`: loi he thong/noi bo
