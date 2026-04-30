# Cart Service

Cart-service ho tro gio hang cho ca user dang nhap va guest.

## Chuc nang

- `GET /api/cart`: lay gio hang hien tai theo Bearer token (user) hoac `x-cart-token` (guest)
- `POST /api/cart/items`: them san pham vao gio (neu trung thi cong don quantity)
- `PATCH /api/cart/items/:productId`: cap nhat so luong
- `DELETE /api/cart/items/:productId`: xoa 1 item
- `DELETE /api/cart`: xoa toan bo gio
- `POST /api/cart/validate`: dong bo trang thai item voi `product-service`, tra ve `canCheckout` + `issues`
- `POST /api/cart/merge`: merge gio guest vao user (yeu cau Bearer token)
- `GET /health`: health check

## Price Strategy (Hybrid)

- Luu snapshot khi add item: `priceAtAdd`, `productName`, `imageUrl`
- Khi validate: so sanh voi gia/tinh trang moi nhat tu product-service
- Flags tren tung item:
  - `priceChanged`
  - `outOfStock`
  - `inactiveProduct`

## Bien moi truong

```env
NODE_ENV=development
CART_PORT=3007
CART_CORS_ORIGIN=*

CART_MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/petfood_cart?retryWrites=true&w=majority

PRODUCT_SERVICE_URL=http://localhost:3003
JWT_SECRET=petfood_secret_key

CART_PRODUCT_TIMEOUT_MS=5000
```

## Chay service

```bash
cd be/petfood_be/cart-service
npm install
npm run dev
```

Service mac dinh chay o `http://localhost:3007`.

## Huong dan test tung API

### 1. Chuan bi truoc khi test

- Chay `product-service` (de cart-service lay gia/stock).
- Chay `auth-service` neu muon test luong user + merge.
- Chay `cart-service`.
- Tao truoc it nhat 1 product, lay `productId` de test.

Gia su dung:

- `CART_BASE_URL=http://localhost:3007`
- `PRODUCT_ID=<id_san_pham_hop_le>`
- `GUEST_TOKEN=guest-token-001`
- `ACCESS_TOKEN=<token_tu_auth_service>`

### 2. Health check

Request:

```bash
curl --location "http://localhost:3007/health"
```

Ky vong:

- Status `200`
- Response co `service: "cart-service"` va `status: "ok"`

### 3. GET /api/cart (guest)

Request:

```bash
curl --location "http://localhost:3007/api/cart" \
  --header "x-cart-token: guest-token-001"
```

Ky vong:

- Status `200`
- Response co `cart.items`, `cart.totals`

### 4. POST /api/cart/items (guest)

Request:

```bash
curl --location "http://localhost:3007/api/cart/items" \
  --header "Content-Type: application/json" \
  --header "x-cart-token: guest-token-001" \
  --data "{\"productId\":\"<PRODUCT_ID>\",\"quantity\":2}"
```

Ky vong:

- Status `200`
- Response co `message: "Add item successful"`
- Item duoc them vao `cart.items`

### 5. PATCH /api/cart/items/:productId (guest)

Request:

```bash
curl --location --request PATCH "http://localhost:3007/api/cart/items/<PRODUCT_ID>" \
  --header "Content-Type: application/json" \
  --header "x-cart-token: guest-token-001" \
  --data "{\"quantity\":5}"
```

Ky vong:

- Status `200`
- Response co `message: "Update item quantity successful"`
- `cart.items[].quantity` duoc cap nhat

### 6. DELETE /api/cart/items/:productId (guest)

Request:

```bash
curl --location --request DELETE "http://localhost:3007/api/cart/items/<PRODUCT_ID>" \
  --header "x-cart-token: guest-token-001"
```

Ky vong:

- Status `200`
- Response co `message: "Remove item successful"`

### 7. DELETE /api/cart (guest)

Request:

```bash
curl --location --request DELETE "http://localhost:3007/api/cart" \
  --header "x-cart-token: guest-token-001"
```

Ky vong:

- Status `200`
- Response co `message: "Clear cart successful"`
- `cart.items` rong

### 8. POST /api/cart/validate (guest)

Request:

```bash
curl --location --request POST "http://localhost:3007/api/cart/validate" \
  --header "x-cart-token: guest-token-001"
```

Ky vong:

- Status `200`
- Response co:
  - `canCheckout` (true/false)
  - `issues` (danh sach item co loi/canh bao)
  - `cart.items[].flags` gom `priceChanged`, `outOfStock`, `inactiveProduct`

### 9. GET /api/cart (user)

Request:

```bash
curl --location "http://localhost:3007/api/cart" \
  --header "Authorization: Bearer <ACCESS_TOKEN>"
```

Ky vong:

- Status `200`
- Response la cart cua user dang dang nhap

### 10. POST /api/cart/items (user)

Request:

```bash
curl --location "http://localhost:3007/api/cart/items" \
  --header "Authorization: Bearer <ACCESS_TOKEN>" \
  --header "Content-Type: application/json" \
  --data "{\"productId\":\"<PRODUCT_ID>\",\"quantity\":1}"
```

Ky vong:

- Status `200`
- Response co `message: "Add item successful"`

### 11. POST /api/cart/merge (guest -> user)

Request:

```bash
curl --location --request POST "http://localhost:3007/api/cart/merge" \
  --header "Authorization: Bearer <ACCESS_TOKEN>" \
  --header "Content-Type: application/json" \
  --data "{\"guestToken\":\"guest-token-001\"}"
```

Ky vong:

- Status `200`
- Response co `message: "Merge cart successful"`
- Item guest duoc cong vao cart user theo `productId`

### 12. Loi thuong gap khi test

- `400 Missing cart identity`: ban chua gui Bearer token va cung chua gui `x-cart-token`.
- `401 Invalid or expired token`: token user khong hop le/het han.
- `404 Product not found`: `productId` khong ton tai.
- `502 product-service is unavailable`: product-service dang tat hoac sai `PRODUCT_SERVICE_URL`.
