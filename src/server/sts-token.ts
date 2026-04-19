import STS from "@alicloud/sts-sdk";

export async function fetchSTS() {
  const accessKeyId = process.env.ALI_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALI_ACCESS_KEY_SECRET;
  const roleArn = process.env.ALI_ROLE_ARN;
  const endpoint = "sts.aliyuncs.com";
  const roleSessionName = `morita-oss-session-${Date.now()}`;

  if (!accessKeyId || !accessKeySecret || !roleArn) {
    throw new Error("STS Missing required environment variables.");
  }

  try {
    const sts = new STS({
      endpoint,
      accessKeyId,
      accessKeySecret,
    });

    const response = await sts.assumeRole(
      roleArn,
      roleSessionName,
      undefined,
      900,
    );

    if (!response?.Credentials) {
      console.error("Failed to get STS token.", response);
      throw new Error(response?.Message || "Failed to get STS token.");
    }

    const { AccessKeyId, AccessKeySecret, SecurityToken, Expiration } =
      response.Credentials;

    return {
      accessKeyId: AccessKeyId,
      accessKeySecret: AccessKeySecret,
      securityToken: SecurityToken,
      expiration: Expiration,
    };
  } catch (error) {
    console.error("Fetch STS Error:", error);
    throw error;
  }
}
