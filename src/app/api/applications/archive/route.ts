import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions, hasAnyStaffAccess } from '@/lib/auth'
import { dbReadFile as readFile, dbWriteFile as writeFile } from '@/lib/db'
import path from 'path'

const archiveFilePath = path.join(process.cwd(), 'data', 'archived_applications.json')

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.discord) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!(await hasAnyStaffAccess(session))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
      const data = await readFile(archiveFilePath)
      return NextResponse.json(JSON.parse(data))
    } catch {
      await writeFile(archiveFilePath, '[]')
      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Error in archive route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
