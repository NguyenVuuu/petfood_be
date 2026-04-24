# Category Service

Production-ready Category Service cho e-commerce pet shop voi ho tro category da cap va mega menu.

## Tinh nang

- Unlimited depth hierarchy (thuc te thuong 3 cap)
- Auto slug generation
- Auto materialized path generation
- Prevent circular parent relation
- Menu tree cho mega menu (`/api/categories/menu`)
- Full tree (`/api/categories/tree`)
- Query theo `id`, `slug`
- Create/Update/Delete (soft delete)
- Flat list co pagination (`GET /api/categories`)
- Cache menu in-memory (TTL)
- Seed data cho Dog/Cat

## Data model

- `name`: String
- `slug`: String, unique
- `parentId`: ObjectId | null
- `level`: Number
- `path`: String (materialized path)
- `menuGroup`: String
- `menuOrder`: Number (default 0)
- `isActive`: Boolean
- `createdAt`, `updatedAt`

## Environment

```env
NODE_ENV=development
CATEGORY_PORT=3005
CATEGORY_CORS_ORIGIN=*
CATEGORY_MENU_CACHE_TTL_MS=60000

CATEGORY_MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/petfood_category?retryWrites=true&w=majority
```

## Run

```bash
cd be/petfood_be/category-service
npm install
npm run dev
```

## Seed data

```bash
npm run seed
```

## APIs

- `GET /health`
- `GET /api/categories?page=1&limit=20&keyword=&parentId=&isActive=true`
- `GET /api/categories/menu`
- `GET /api/categories/tree`
- `GET /api/categories/:id`
- `GET /api/categories/slug/:slug`
- `POST /api/categories`
- `PATCH /api/categories/:id`
- `DELETE /api/categories/:id` (soft delete)

### POST /api/categories body

```json
{
  "name": "Thuc an",
  "parentId": null,
  "menuGroup": "Food",
  "menuOrder": 1,
  "isActive": true
}
```

### PATCH /api/categories/:id body

```json
{
  "name": "Thuc an cao cap",
  "parentId": "507f1f77bcf86cd799439011",
  "menuGroup": "Food",
  "menuOrder": 2,
  "isActive": true
}
```

## Kien truc

- `controllers/`: HTTP handler
- `services/`: business logic
- `repositories/`: DB access
- `validators/`: Joi DTO validation
- `seeds/`: seed script
