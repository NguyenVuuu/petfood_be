const request = require("supertest");

jest.mock("../../services/cartService", () => ({
  getCart: jest.fn(),
  addItem: jest.fn(),
  updateItemQuantity: jest.fn(),
  removeItem: jest.fn(),
  clearCart: jest.fn(),
  validateCart: jest.fn(),
  mergeGuestCart: jest.fn(),
}));
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn((token) => {
    if (token === "valid-token") {
      return { sub: "507f1f77bcf86cd799439011" };
    }
    throw new Error("invalid token");
  }),
}));

describe("cart API integration", () => {
  let app;
  let serviceMock;

  beforeAll(() => {
    process.env.CART_MONGODB_URI = "mongodb://localhost:27017/petfood_cart_test";
    process.env.PRODUCT_SERVICE_URL = "http://localhost:3003";
    process.env.JWT_SECRET = "test-secret";

    app = require("../../app");
    serviceMock = require("../../services/cartService");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/cart should return cart for guest", async () => {
    serviceMock.getCart.mockResolvedValue({ items: [], totals: { subtotal: 0, totalItems: 0 } });

    const response = await request(app).get("/api/cart").set("x-cart-token", "guest-token");

    expect(response.status).toBe(200);
    expect(serviceMock.getCart).toHaveBeenCalled();
  });

  test("POST /api/cart/items should add item", async () => {
    serviceMock.addItem.mockResolvedValue({ items: [{ quantity: 1 }] });

    const response = await request(app)
      .post("/api/cart/items")
      .set("x-cart-token", "guest-token")
      .send({ productId: "507f1f77bcf86cd799439011", quantity: 1 });

    expect(response.status).toBe(200);
  });

  test("PATCH /api/cart/items/:productId should update quantity", async () => {
    serviceMock.updateItemQuantity.mockResolvedValue({ items: [{ quantity: 4 }] });

    const response = await request(app)
      .patch("/api/cart/items/507f1f77bcf86cd799439011")
      .set("x-cart-token", "guest-token")
      .send({ quantity: 4 });

    expect(response.status).toBe(200);
  });

  test("DELETE /api/cart/items/:productId should remove item", async () => {
    serviceMock.removeItem.mockResolvedValue({ items: [] });

    const response = await request(app)
      .delete("/api/cart/items/507f1f77bcf86cd799439011")
      .set("x-cart-token", "guest-token");

    expect(response.status).toBe(200);
  });

  test("DELETE /api/cart should clear cart", async () => {
    serviceMock.clearCart.mockResolvedValue({ items: [] });

    const response = await request(app).delete("/api/cart").set("x-cart-token", "guest-token");

    expect(response.status).toBe(200);
  });

  test("POST /api/cart/validate should return validation result", async () => {
    serviceMock.validateCart.mockResolvedValue({
      canCheckout: false,
      issues: [{ productId: "507f1f77bcf86cd799439011", issues: ["outOfStock"] }],
      cart: { items: [] },
    });

    const response = await request(app).post("/api/cart/validate").set("x-cart-token", "guest-token");

    expect(response.status).toBe(200);
    expect(response.body.canCheckout).toBe(false);
  });

  test("POST /api/cart/merge should require auth", async () => {
    const response = await request(app)
      .post("/api/cart/merge")
      .send({ guestToken: "guest-token-12345" });

    expect(response.status).toBe(401);
  });

  test("POST /api/cart/merge should merge cart for authenticated user", async () => {
    serviceMock.mergeGuestCart.mockResolvedValue({ items: [{ quantity: 3 }] });

    const response = await request(app)
      .post("/api/cart/merge")
      .set("Authorization", "Bearer valid-token")
      .send({ guestToken: "guest-token-12345" });

    expect(response.status).toBe(200);
    expect(serviceMock.mergeGuestCart).toHaveBeenCalledWith({
      userId: "507f1f77bcf86cd799439011",
      guestToken: "guest-token-12345",
    });
  });

  test("GET /api/cart should fail when missing guest token and auth", async () => {
    const response = await request(app).get("/api/cart");
    expect(response.status).toBe(400);
  });
});
