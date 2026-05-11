import type {
  BucketConfigDto,
  StsCredentialsDto,
  StsTokenResponseDto
} from './dto'

export function toStsTokenResponseDto(
  credentials: StsCredentialsDto,
  bucketData: BucketConfigDto
): StsTokenResponseDto {
  return {
    ...credentials,
    bucketData
  }
}
