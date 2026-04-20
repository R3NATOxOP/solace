import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { Application } from '@/lib/types'
import { dbReadFile as readFile } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.discord) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let applications: Application[] = []
    let archived: Application[] = []

    try {
      const data = await readFile('applications.json')
      applications = JSON.parse(data)
    } catch {}

    try {
      const archivedData = await readFile('archived_applications.json')
      archived = JSON.parse(archivedData)
    } catch {}

    // Find user's applications
    const userApplications = [
      ...applications.filter(app => app.discord.id === session.discord.id),
      ...archived.filter(app => app.discord.id === session.discord.id)
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Get the most recent application
    const latestApplication = userApplications[0] || null

    return NextResponse.json({
      applications: userApplications,
      latestApplication,
      totalApplications: userApplications.length,
      pendingApplications: userApplications.filter(app => app.status === 'pending' || !app.status).length,
    })
  } catch (error) {
    console.error('Error fetching user application status:', error)
    return NextResponse.json({ error: 'Failed to fetch application status' }, { status: 500 })
  }
}
