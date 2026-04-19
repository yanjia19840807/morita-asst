declare module "@alicloud/sts-sdk" {
  interface STSCredentials {
    AccessKeyId: string;
    AccessKeySecret: string;
    SecurityToken: string;
    Expiration: string;
  }

  interface AssumeRoleResult {
    Credentials: STSCredentials;
    Code?: string;
    Message?: string;
    RequestId?: string;
    [key: string]: unknown;
  }

  interface STSOptions {
    endpoint?: string;
    accessKeyId: string;
    accessKeySecret: string;
    [key: string]: unknown;
  }

  class STS {
    constructor(options: STSOptions);
    assumeRole(
      roleArn: string,
      roleSessionName: string,
      policy?: string,
      durationSeconds?: number,
      runtimeOption?: Record<string, unknown>,
    ): Promise<AssumeRoleResult>;
  }

  export default STS;
}
