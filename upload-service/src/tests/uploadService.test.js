const uploadService = require("../services/uploadService");

jest.mock("../providers/providerFactory", () => ({
  getProvider: jest.fn(() => ({
    upload: jest.fn().mockResolvedValue({
      url: "https://cdn.test/file.jpg",
      provider: "s3",
      key: "avatars/file.jpg",
    }),
    delete: jest.fn().mockResolvedValue({
      provider: "s3",
      key: "avatars/file.jpg",
      deleted: true,
    }),
    createPresignedUploadUrl: jest.fn().mockResolvedValue({
      provider: "s3",
      key: "avatars/file.jpg",
      url: "https://signed-url",
      expiresIn: 600,
      method: "PUT",
      publicUrl: "https://public-url",
    }),
  })),
}));

describe("uploadService", () => {
  test("should upload file and return metadata", async () => {
    const result = await uploadService.uploadFile({
      type: "avatar",
      file: {
        originalname: "avatar.png",
        mimetype: "image/png",
        size: 1024,
        buffer: Buffer.from("demo"),
      },
    });

    expect(result.url).toBeDefined();
    expect(result.provider).toBe("s3");
    expect(result.metadata.type).toBe("avatar");
  });

  test("should reject unsupported type", async () => {
    await expect(
      uploadService.uploadFile({
        type: "invoice",
        file: {
          originalname: "a.png",
          mimetype: "image/png",
          size: 1,
          buffer: Buffer.from("x"),
        },
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
