/**
 * 图片存储适配器
 * 支持多种存储后端：Local、Cloudflare R2、AWS S3
 */

// ============================================
// 类型定义
// ============================================

export interface UploadResult {
  url: string;
  key: string;
}

export interface StorageAdapter {
  upload(file: File | Buffer, path: string): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}

// ============================================
// 配置
// ============================================

const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || "local";
const LOCAL_UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR || "./public/uploads";
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";
const AWS_REGION = process.env.AWS_REGION || "";
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || "";

// ============================================
// 工具函数
// ============================================

/**
 * 生成唯一文件名
 */
export function generateStorageKey(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split(".").pop() || "";
  const base = originalName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9一-鿿]/g, "_");
  return `${timestamp}-${random}-${base}${ext ? "." + ext : ""}`;
}

/**
 * 推断 MIME 类型
 */
function getMimeType(file: File | Buffer, filename: string): string {
  if (file instanceof File) {
    return file.type || "application/octet-stream";
  }
  // 从文件名推断
  const ext = filename.split(".").pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    pdf: "application/pdf",
  };
  return mimeMap[ext || ""] || "application/octet-stream";
}

// ============================================
// Local 存储适配器
// ============================================

class LocalStorageAdapter implements StorageAdapter {
  async upload(file: File | Buffer, path: string): Promise<UploadResult> {
    // Next.js App Router 中使用 fs 需要动态导入
    const fs = await import("fs/promises");
    const pathModule = await import("path");

    const key = path || generateStorageKey(file instanceof File ? file.name : "file");
    const fullPath = pathModule.join(process.cwd(), LOCAL_UPLOAD_DIR, key);

    // 确保目录存在
    await fs.mkdir(pathModule.dirname(fullPath), { recursive: true });

    if (file instanceof File) {
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(fullPath, buffer);
    } else {
      await fs.writeFile(fullPath, file);
    }

    return {
      url: `/uploads/${key}`,
      key,
    };
  }

  async delete(key: string): Promise<void> {
    const fs = await import("fs/promises");
    const pathModule = await import("path");
    const fullPath = pathModule.join(process.cwd(), LOCAL_UPLOAD_DIR, key);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        // 文件不存在，忽略
        return;
      }
      // 其他错误（如权限问题）重新抛出
      throw error;
    }
  }

  getUrl(key: string): string {
    return `/uploads/${key}`;
  }
}

// ============================================
// Cloudflare R2 存储适配器
// ============================================

class CloudflareR2Adapter implements StorageAdapter {
  private accountId: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    this.accountId = R2_ACCOUNT_ID;
    this.accessKeyId = R2_ACCESS_KEY_ID;
    this.secretAccessKey = R2_SECRET_ACCESS_KEY;
    this.bucketName = R2_BUCKET_NAME;
    this.publicUrl = R2_PUBLIC_URL;
  }

  async upload(file: File | Buffer, path: string): Promise<UploadResult> {
    const key = path || generateStorageKey(file instanceof File ? file.name : "file");

    let body: BodyInit;
    if (file instanceof File) {
      body = await file.arrayBuffer();
    } else {
      // 将 Buffer 转换为 Uint8Array（BodyInit 可接受）
      body = new Uint8Array(file);
    }

    const endpoint = `https://${this.accountId}.r2.cloudflarestorage.com/${this.bucketName}/${key}`;

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": getMimeType(file, key),
        "X-Cf-Access-Key-Id": this.accessKeyId,
        "X-Cf-Secret-Access-Key": this.secretAccessKey,
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`R2 上传失败: ${response.statusText}`);
    }

    return {
      url: `${this.publicUrl}/${key}`,
      key,
    };
  }

  async delete(key: string): Promise<void> {
    const endpoint = `https://${this.accountId}.r2.cloudflarestorage.com/${this.bucketName}/${key}`;
    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        "X-Cf-Access-Key-Id": this.accessKeyId,
        "X-Cf-Secret-Access-Key": this.secretAccessKey,
      },
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(`R2 delete 失败: ${response.statusText}`);
    }
  }

  getUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
}

// ============================================
// AWS S3 存储适配器
// ============================================

class AwsS3Adapter implements StorageAdapter {
  private region: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private bucket: string;

  constructor() {
    this.region = AWS_REGION;
    this.accessKeyId = AWS_ACCESS_KEY_ID;
    this.secretAccessKey = AWS_SECRET_ACCESS_KEY;
    this.bucket = AWS_S3_BUCKET;
  }

  async upload(file: File | Buffer, path: string): Promise<UploadResult> {
    // 注意：S3 upload 需要完整的 AWS Signature v4 签名
    // 建议使用 @aws-sdk/client-s3 的 PutObjectCommand
    // 当前简化实现无法正确签名 PUT 请求
    throw new Error(
      `S3 upload 需要使用 @aws-sdk/client-s3。请使用 PutObjectCommand。file=${
        file instanceof File ? file.name : "buffer"
      }, path=${path}`
    );
  }

  async delete(key: string): Promise<void> {
    // 注意：S3 delete 需要完整的 AWS Signature v4 签名
    // 建议使用 @aws-sdk/client-s3 的 DeleteObjectCommand
    // 当前简化实现无法正确签名 DELETE 请求
    throw new Error(
      `S3 delete 需要使用 @aws-sdk/client-s3。请使用 DeleteObjectCommand。key=${key}`
    );
  }

  getUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}

// ============================================
// 存储工厂
// ============================================

let storageAdapter: StorageAdapter | null = null;

/**
 * 获取存储适配器实例
 */
export function getStorageAdapter(): StorageAdapter {
  if (!storageAdapter) {
    switch (STORAGE_PROVIDER) {
      case "cloudflare-r2":
        storageAdapter = new CloudflareR2Adapter();
        break;
      case "aws-s3":
        storageAdapter = new AwsS3Adapter();
        break;
      case "local":
      default:
        storageAdapter = new LocalStorageAdapter();
        break;
    }
  }
  return storageAdapter;
}

/**
 * 上传文件（便捷函数）
 */
export async function uploadFile(file: File | Buffer, path?: string): Promise<UploadResult> {
  const adapter = getStorageAdapter();
  return adapter.upload(file, path || "");
}

/**
 * 删除文件（便捷函数）
 */
export async function deleteFile(key: string): Promise<void> {
  const adapter = getStorageAdapter();
  return adapter.delete(key);
}

/**
 * 获取文件 URL（便捷函数）
 */
export function getFileUrl(key: string): string {
  const adapter = getStorageAdapter();
  return adapter.getUrl(key);
}
