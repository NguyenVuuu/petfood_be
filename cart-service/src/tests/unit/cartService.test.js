jest.mock("../../services/productClient", () => ({
  getProductById: jest.fn(),
}));

jest.mock("../../models/Cart", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  deleteOne: jest.fn(),
}));

const Cart = require("../../models/Cart");
const { getProductById } = require("../../services/productClient");
const cartService = require("../../services/cartService");

const buildCartDoc = (overrides = {}) => ({
  _id: "cart-id",
  ownerType: "guest",
  guestToken: "guest-token",
  userId: null,
  items: [],
  totals: { subtotal: 0, totalItems: 0 },
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  save: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe("cartService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("addItem should increase quantity if item already exists", async () => {
    const cart = buildCartDoc({
      items: [
        {
          productId: { toString: () => "507f1f77bcf86cd799439011" },
          quantity: 1,
          priceAtAdd: 10,
          productName: "Old",
          imageUrl: "",
          flags: { priceChanged: false, outOfStock: false, inactiveProduct: false },
        },
      ],
    });

    Cart.findOne.mockResolvedValue(cart);
    getProductById.mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      name: "Dry Food",
      price: 12,
      stock: 20,
      isActive: true,
      imageUrl: "img.png",
    });

    const result = await cartService.addItem(
      { ownerType: "guest", guestToken: "guest-token" },
      { productId: "507f1f77bcf86cd799439011", quantity: 2 }
    );

    expect(result.items[0].quantity).toBe(3);
    expect(result.items[0].priceAtAdd).toBe(12);
    expect(cart.save).toHaveBeenCalled();
  });

  test("validateCart should flag priceChanged and outOfStock", async () => {
    const cart = buildCartDoc({
      items: [
        {
          productId: { toString: () => "507f1f77bcf86cd799439011" },
          quantity: 5,
          priceAtAdd: 10,
          productName: "Dry Food",
          imageUrl: "",
          flags: { priceChanged: false, outOfStock: false, inactiveProduct: false },
        },
      ],
    });

    Cart.findOne.mockResolvedValue(cart);
    getProductById.mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      name: "Dry Food",
      price: 12,
      stock: 2,
      isActive: true,
      imageUrl: "img.png",
    });

    const result = await cartService.validateCart({
      ownerType: "guest",
      guestToken: "guest-token",
    });

    expect(result.canCheckout).toBe(false);
    expect(result.issues[0].issues).toContain("priceChanged");
    expect(result.issues[0].issues).toContain("outOfStock");
  });

  test("mergeGuestCart should merge items and delete guest cart", async () => {
    const userCart = buildCartDoc({
      ownerType: "user",
      userId: "507f1f77bcf86cd799439012",
      items: [
        {
          productId: { toString: () => "507f1f77bcf86cd799439011" },
          quantity: 1,
          priceAtAdd: 10,
          productName: "A",
          imageUrl: "",
          flags: { priceChanged: false, outOfStock: false, inactiveProduct: false },
        },
      ],
    });

    const guestCart = buildCartDoc({
      _id: "guest-cart-id",
      ownerType: "guest",
      items: [
        {
          productId: { toString: () => "507f1f77bcf86cd799439011" },
          quantity: 2,
          priceAtAdd: 11,
          productName: "B",
          imageUrl: "img.png",
          flags: { priceChanged: false, outOfStock: false, inactiveProduct: false },
        },
      ],
    });

    Cart.findOne.mockResolvedValueOnce(userCart).mockResolvedValueOnce(guestCart);
    Cart.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const result = await cartService.mergeGuestCart({
      userId: "507f1f77bcf86cd799439012",
      guestToken: "guest-token",
    });

    expect(result.items[0].quantity).toBe(3);
    expect(result.items[0].priceAtAdd).toBe(11);
    expect(Cart.deleteOne).toHaveBeenCalledWith({ _id: "guest-cart-id" });
  });

  test("validateCart should throw when product-service is unavailable", async () => {
    const cart = buildCartDoc({
      items: [
        {
          productId: { toString: () => "507f1f77bcf86cd799439011" },
          quantity: 1,
          priceAtAdd: 10,
          productName: "Dry Food",
          imageUrl: "",
          flags: { priceChanged: false, outOfStock: false, inactiveProduct: false },
        },
      ],
    });

    const upstreamError = new Error("product-service is unavailable");
    upstreamError.statusCode = 502;

    Cart.findOne.mockResolvedValue(cart);
    getProductById.mockRejectedValue(upstreamError);

    await expect(
      cartService.validateCart({ ownerType: "guest", guestToken: "guest-token" })
    ).rejects.toMatchObject({ statusCode: 502 });
  });
});
