export type BucketAccess = 'public' | 'private'

export type BucketConfig = {
  bucket: string
  region: string
}

export type STSResponse = {
  accessKeyId: string
  accessKeySecret: string
  securityToken: string
  expiration: string
  bucketData: BucketConfig
}
