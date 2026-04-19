import OSS from "ali-oss/dist/aliyun-oss-sdk.js";

async function fetchSTS() {
  try {
    const response = await fetch("/api/oss/sts", {
      method: "GET",
      cache: "no-store",
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error);
    }
    return payload;
  } catch (error) {
    console.error("fetchSTS Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch STS token",
    );
  }
}

export async function upload(key: string, file: File) {
  const { accessKeyId, accessKeySecret, securityToken, bucket, region } =
    await fetchSTS();

  try {
    const client = new OSS({
      region,
      bucket,
      accessKeyId,
      accessKeySecret,
      stsToken: securityToken,
    });

    const result = await client.put(key, file, {
      headers: {
        "Content-Type": file.type,
      },
    });

    return result;
  } catch (error) {
    console.error("OSS Upload Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to upload file",
    );
  }
}
