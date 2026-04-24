class UploadProvider {
  async upload() {
    throw new Error("upload() must be implemented");
  }

  async delete() {
    throw new Error("delete() must be implemented");
  }

  async createPresignedUploadUrl() {
    const error = new Error("Presigned upload URL is not supported by this provider");
    error.statusCode = 400;
    throw error;
  }
}

module.exports = UploadProvider;
