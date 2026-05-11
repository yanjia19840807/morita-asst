export type BucketAccess = 'public' | 'private'

export interface BucketConfigDto {
  bucket: string
  region: string
}

export interface StsCredentialsDto {
  accessKeyId: string
  accessKeySecret: string
  securityToken: string
  expiration: string
}

export interface StsTokenResponseDto extends StsCredentialsDto {
  bucketData: BucketConfigDto
}
