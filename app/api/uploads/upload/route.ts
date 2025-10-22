import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'edge'

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url)
    const key = url.searchParams.get('key')
    if (!key) return NextResponse.json({ error: 'missing key' }, { status: 400 })

    const uploadsDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

    const filePath = path.join(uploadsDir, key.replace(/^uploads\//, ''))
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    const arrayBuffer = await req.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    fs.writeFileSync(filePath, buffer)

    // Return the public URL the client can use to access the file
    const publicUrl = `/api/uploads/${encodeURIComponent(key)}`
    return NextResponse.json({ ok: true, publicUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
