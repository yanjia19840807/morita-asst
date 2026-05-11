declare module 'ali-oss/dist/aliyun-oss-sdk.js' {
  export { default } from 'ali-oss'
  export * from 'ali-oss'
}

declare module '@alicloud/sts-sdk' {
  interface StsClientConfig {
    endpoint?: string
    accessKeyId: string
    accessKeySecret: string
  }

  interface AssumeRoleCredentials {
    AccessKeyId: string
    AccessKeySecret: string
    SecurityToken: string
    Expiration: string
  }

  interface AssumeRoleResponse {
    Credentials?: AssumeRoleCredentials
    Message?: string
  }

  export default class STS {
    constructor(config: StsClientConfig)
    assumeRole(
      roleArn: string,
      roleSessionName: string
    ): Promise<AssumeRoleResponse>
  }
}
