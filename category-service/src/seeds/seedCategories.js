const mongoose = require("mongoose");
const { connectDatabase } = require("../config/db");
const { mongoUri } = require("../config/env");
const Category = require("../models/Category");

const seedData = [
  { name: "Cho", slug: "cho", parentPath: null, menuGroup: "Pets", menuOrder: 1 },
  { name: "Meo", slug: "meo", parentPath: null, menuGroup: "Pets", menuOrder: 2 },

  { name: "Thuc an", slug: "thuc-an-cho", parentPath: "cho", menuGroup: "Food", menuOrder: 1 },
  { name: "Phu kien", slug: "phu-kien-cho", parentPath: "cho", menuGroup: "Accessories", menuOrder: 2 },
  { name: "Cham soc", slug: "cham-soc-cho", parentPath: "cho", menuGroup: "Care", menuOrder: 3 },

  { name: "Thuc an", slug: "thuc-an-meo", parentPath: "meo", menuGroup: "Food", menuOrder: 1 },
  { name: "Phu kien", slug: "phu-kien-meo", parentPath: "meo", menuGroup: "Accessories", menuOrder: 2 },
  { name: "Cham soc", slug: "cham-soc-meo", parentPath: "meo", menuGroup: "Care", menuOrder: 3 },

  { name: "Thuc an hat", slug: "thuc-an-hat-cho", parentPath: "cho/thuc-an-cho", menuGroup: "Dry Food", menuOrder: 1 },
  { name: "Pate", slug: "pate-cho", parentPath: "cho/thuc-an-cho", menuGroup: "Wet Food", menuOrder: 2 },

  { name: "Thuc an hat", slug: "thuc-an-hat-meo", parentPath: "meo/thuc-an-meo", menuGroup: "Dry Food", menuOrder: 1 },
  { name: "Pate", slug: "pate-meo", parentPath: "meo/thuc-an-meo", menuGroup: "Wet Food", menuOrder: 2 },
];

const seedCategories = async () => {
  await connectDatabase(mongoUri);

  await Category.deleteMany({});

  const createdByPath = new Map();

  for (const item of seedData) {
    const parent = item.parentPath ? createdByPath.get(item.parentPath) : null;
    const path = parent ? `${parent.path}/${item.slug}` : item.slug;
    const level = parent ? parent.level + 1 : 0;

    const category = await Category.create({
      name: item.name,
      slug: item.slug,
      parentId: parent ? parent._id : null,
      level,
      path,
      menuGroup: item.menuGroup,
      menuOrder: item.menuOrder,
      isActive: true,
    });

    createdByPath.set(path, category);
  }

  console.log("Seed categories successful");
};

seedCategories()
  .catch((error) => {
    console.error("Seed categories failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
