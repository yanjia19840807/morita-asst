import { NextResponse } from "next/server";
import { fetchSTS } from "@/server/sts-token";
import { withAuth } from "@/lib/api/with-auth";
import { ApiError, handleApiError } from "@/lib/api/errors";

const bucket = process.env.ALI_BUCKET;
const region = process.env.ALI_OSS_REGION || "oss-cn-beijing";

export const GET = withAuth(async (request, { user }) => {
  try {
    const response = await fetchSTS();
    const { accessKeyId, accessKeySecret, securityToken, expiration } =
      response;

    return NextResponse.json({
      accessKeyId,
      accessKeySecret,
      securityToken,
      expiration,
      bucket,
      region,
    });
  } catch (error) {
    console.error("STS AssumeRole Error:", error);

    return handleApiError(new ApiError("获取STS令牌失败"));
  }
});
