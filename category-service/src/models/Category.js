const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    level: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    path: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    menuGroup: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    menuOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ parentId: 1, menuOrder: 1, name: 1 });

module.exports = mongoose.model("Category", categorySchema);
