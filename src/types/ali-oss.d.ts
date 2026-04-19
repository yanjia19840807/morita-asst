declare module "ali-oss" {
  interface OSSOptions {
    region: string;
    bucket: string;
    accessKeyId: string;
    accessKeySecret: string;
    stsToken?: string;
    secure?: boolean;
  }

  interface PutObjectOptions {
    headers?: Record<string, string>;
    [key: string]: unknown;
  }

  interface PutObjectResult {
    name?: string;
    url?: string;
    [key: string]: unknown;
  }

  export default class OSS {
    constructor(options: OSSOptions);
    put(
      name: string,
      file: Blob | File | ArrayBuffer | string,
      options?: PutObjectOptions,
    ): Promise<PutObjectResult>;
  }
}

declare module "ali-oss/dist/aliyun-oss-sdk.js" {
  export { default } from "ali-oss";
}
