const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const UploadProvider = require("./uploadProvider");
const {
  awsRegion,
  awsAccessKeyId,
  awsSecretAccessKey,
  awsBucket,
  awsPublicBaseUrl,
  presignedUrlExpiresInSec,
} = require("../config/env");

class S3Provider extends UploadProvider {
  constructor() {
    super();
    this.bucket = awsBucket;
    this.client = new S3Client({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
      },
    });
  }

  getPublicUrl(key) {
    if (awsPublicBaseUrl) {
      return `${awsPublicBaseUrl.replace(/\/$/, "")}/${key}`;
    }

    return `https://${this.bucket}.s3.${awsRegion}.amazonaws.com/${key}`;
  }

  async upload({ buffer, key, mimeType }) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    );

    return {
      url: this.getPublicUrl(key),
      provider: "s3",
      key,
    };
  }

  async delete({ key }) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );

    return {
      provider: "s3",
      key,
      deleted: true,
    };
  }

  async createPresignedUploadUrl({ key, mimeType, expiresInSec }) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });

    const signedUrl = await getSignedUrl(this.client, command, {
      expiresIn: expiresInSec || presignedUrlExpiresInSec,
    });

    return {
      provider: "s3",
      key,
      url: signedUrl,
      expiresIn: expiresInSec || presignedUrlExpiresInSec,
      method: "PUT",
      publicUrl: this.getPublicUrl(key),
    };
  }
}

module.exports = S3Provider;
