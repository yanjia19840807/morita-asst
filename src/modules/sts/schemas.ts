import z from 'zod'

export const bucketAccessSchema = z.enum(['public', 'private'])

export type BucketAccessInput = z.infer<typeof bucketAccessSchema>
