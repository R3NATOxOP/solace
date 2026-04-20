import { NextResponse } from 'next/server'
import { dbReadFile as readFile } from '@/lib/db'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'rules.json')
    try {
      const data = await readFile(filePath)
      return new NextResponse(data, { status: 200, headers: { 'Content-Type': 'application/json' } })
    } catch {
      // Fallback: return empty categories
      return NextResponse.json({ categories: [] })
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ categories: [] }, { status: 500 })
  }
}
