jest.mock("../../repositories/categoryRepository", () => ({
  findAll: jest.fn(),
  findActive: jest.fn(),
  findById: jest.fn(),
  findBySlug: jest.fn(),
  findOneBySlug: jest.fn(),
  create: jest.fn(),
  updateById: jest.fn(),
  findChildrenByParentId: jest.fn(),
  findDescendantsByPathPrefix: jest.fn(),
  bulkWrite: jest.fn(),
  softDeleteById: jest.fn(),
  listFlat: jest.fn(),
}));

jest.mock("../../config/env", () => ({
  menuCacheTtlMs: 10000,
}));

const repo = require("../../repositories/categoryRepository");
const categoryService = require("../../services/categoryService");

describe("categoryService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getCategoryTree should build nested tree", async () => {
    repo.findActive.mockResolvedValue([
      {
        _id: "1",
        name: "Dog",
        slug: "dog",
        parentId: null,
        level: 0,
        path: "dog",
        menuGroup: "Pets",
        menuOrder: 1,
        isActive: true,
      },
      {
        _id: "2",
        name: "Food",
        slug: "food",
        parentId: "1",
        level: 1,
        path: "dog/food",
        menuGroup: "Food",
        menuOrder: 1,
        isActive: true,
      },
    ]);

    const tree = await categoryService.getCategoryTree();

    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].name).toBe("Food");
  });

  test("getMenuTree should group children by menuGroup", async () => {
    repo.findActive.mockResolvedValue([
      {
        _id: "1",
        name: "Dog",
        slug: "dog",
        parentId: null,
        level: 0,
        path: "dog",
        menuGroup: "Pets",
        menuOrder: 1,
        isActive: true,
      },
      {
        _id: "2",
        name: "Dry Food",
        slug: "dry-food",
        parentId: "1",
        level: 1,
        path: "dog/dry-food",
        menuGroup: "Food",
        menuOrder: 1,
        isActive: true,
      },
      {
        _id: "3",
        name: "Toys",
        slug: "toys",
        parentId: "1",
        level: 1,
        path: "dog/toys",
        menuGroup: "Accessories",
        menuOrder: 2,
        isActive: true,
      },
    ]);

    const menu = await categoryService.getMenuTree();

    expect(menu[0].menuGroups).toHaveLength(2);
    expect(menu[0].menuGroups[0].items).toBeDefined();
  });

  test("updateCategory should reject circular hierarchy", async () => {
    repo.findById
      .mockResolvedValueOnce({
        _id: "507f1f77bcf86cd799439011",
        name: "Food",
        slug: "food",
        parentId: null,
        level: 0,
        path: "food",
        isActive: true,
      })
      .mockResolvedValueOnce({
        _id: "507f1f77bcf86cd799439012",
        name: "Dry",
        slug: "dry",
        parentId: "507f1f77bcf86cd799439011",
        level: 1,
        path: "food/dry",
        isActive: true,
      });

    await expect(
      categoryService.updateCategory("507f1f77bcf86cd799439011", {
        parentId: "507f1f77bcf86cd799439012",
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
