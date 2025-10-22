import { NextResponse } from 'next/server'

// Lightweight presign endpoint supporting either real S3 (AWS, MinIO) using
// AWS SDK v3 or a server-local fallback that instructs the client to PUT to
// the app's upload endpoint.

// Environment variables expected for S3 mode:
// - S3_ENDPOINT (optional, e.g., http://localhost:9000 for MinIO)
// - S3_REGION
// - S3_BUCKET
// - S3_ACCESS_KEY_ID
// - S3_SECRET_ACCESS_KEY

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { filename, contentType } = body
    if (!filename || !contentType) {
      return NextResponse.json({ error: 'filename and contentType required' }, { status: 400 })
    }

    const { S3_BUCKET, S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env

    const key = `uploads/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '-')}`

    // If minimal S3 credentials present, return an object the client can use
    // with the AWS SDK presigner. We don't want to add the AWS SDK as a hard
    // dependency here so simply return the required data for the client to use
    // a presigned PUT (for MinIO/AWS) when the server has credentials.

    if (S3_BUCKET && S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY) {
      // Return the information needed to upload to S3-compatible endpoint.
      return NextResponse.json({
        uploadType: 's3',
        url: `${S3_ENDPOINT ? S3_ENDPOINT.replace(/\/$/, '') : `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`}/${key}`,
        bucket: S3_BUCKET,
        key,
        region: S3_REGION || 'us-east-1',
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
      })
    }

    // Fallback: server will accept uploads at /api/uploads/upload
    const uploadUrl = `/api/uploads/upload?key=${encodeURIComponent(key)}`
    const publicUrl = `/api/uploads/${encodeURIComponent(key)}`
    return NextResponse.json({ uploadType: 'server', uploadUrl, publicUrl, key })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
