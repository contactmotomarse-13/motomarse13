Stockage des fichiers (gratuit/local ou S3 compatible)

But: this project supports two modes for storing uploaded documents from the driver form:

1) S3-compatible mode (MinIO, AWS S3, Cloudflare R2):
   - Set environment variables in `.env.local`:
     - S3_BUCKET=your-bucket
     - S3_REGION=eu-west-1
     - S3_ACCESS_KEY_ID=xxx
     - S3_SECRET_ACCESS_KEY=yyy
     - (optional) S3_ENDPOINT=http://localhost:9000  # for MinIO
   - Request `POST /api/storage/presign` with JSON { filename, contentType }.
   - The endpoint returns `uploadType: 's3'` and the `url` to PUT the file to (you'll still need to generate a real presigned URL server-side or client-side with AWS SDK). This implementation returns metadata so you can use your preferred presign method.

2) Local server fallback (no cost):
   - If S3 env vars are not set, the presign endpoint returns `uploadType: 'server'`, an `uploadUrl` (e.g. `/api/uploads/upload?key=uploads/ts-...`) and a `publicUrl` where the file will be available after upload.
   - The client should PUT the file bytes to the `uploadUrl` and then include the `publicUrl` in the form payload.
   - Uploaded files are stored under the `uploads/` directory at project root.

Run a local MinIO with Docker Compose (optional):

version: '3.7'
services:
  minio:
    image: minio/minio:latest
    command: server /data
    ports:
      - "9000:9000"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - ./minio-data:/data

Then create a bucket (via MinIO console at http://localhost:9000) and set the env vars accordingly.

Security notes:
- The local server fallback stores files on disk and serves them at `/api/uploads/<key>` publicly — use this only during development or behind authentication. For production, prefer S3 + presigned URLs and limit file lifetime.
- Add file size/type validation on the client and server (recommend max 5 MB per file for email attachments).

Next steps if you want me to implement the client changes:
- Update `app/devenir/page.tsx` to call `/api/storage/presign`, then upload each file (via PUT either to S3 or server upload), then send metadata (file URLs) to `/api/drivers` instead of sending base64 attachments.
- Add client-side validation for size/types and UX for upload progress.
