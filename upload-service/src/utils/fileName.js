const { randomUUID } = require("crypto");

const sanitizeBaseName = (filename) =>
  filename
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

const splitFileName = (filename) => {
  const cleaned = sanitizeBaseName(filename || "file");
  const parts = cleaned.split(".");

  if (parts.length <= 1) {
    return { name: cleaned || "file", extension: "" };
  }

  const extension = parts.pop();
  const name = parts.join(".") || "file";

  return { name, extension };
};

const buildStorageFileName = (filename) => {
  const { name, extension } = splitFileName(filename);
  const id = randomUUID();

  return extension ? `${name}-${id}.${extension}` : `${name}-${id}`;
};

module.exports = {
  splitFileName,
  buildStorageFileName,
};
