import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'edge'

export async function GET(req: Request) {
  try {
    const parts = req.url.split('/')
    const encodedKey = parts.slice(parts.indexOf('uploads') + 1).join('/')
    if (!encodedKey) return NextResponse.json({ error: 'missing key' }, { status: 400 })

    const key = decodeURIComponent(encodedKey)
    const filePath = path.join(process.cwd(), 'uploads', key.replace(/^uploads\//, ''))

    if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'not found' }, { status: 404 })

    const data = fs.readFileSync(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const contentType = ext === '.pdf' ? 'application/pdf' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.png' ? 'image/png' : 'application/octet-stream'

    return new NextResponse(data, { status: 200, headers: { 'Content-Type': contentType } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
