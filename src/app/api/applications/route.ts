import { NextResponse } from 'next/server'
import { logActivity } from '@/lib/activity-log'
import { getUserRoles, sendChannelMessage } from '@/lib/discord-bot'
import { hasPriorityRole } from '@/lib/config'
import { getCollection, dbRead } from '@/lib/db'

async function isUserBanned(discordId: string): Promise<boolean> {
  try {
    const bans = await dbRead<any>('bans')
    return bans.some(ban => ban.discordId === discordId)
  } catch {
    return false
  }
}

async function isUserBlacklisted(discordId: string): Promise<boolean> {
  try {
    const blacklist = await dbRead<any>('blacklist')
    return blacklist.some(entry => entry.discordId === discordId)
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  try {
    const application = await req.json()
    const applicationType: string = application.applicationType || 'whitelist'

    let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
    if (application.discord?.id) {
      try {
        const roles = await getUserRoles(application.discord.id)
        if (hasPriorityRole(roles)) {
          priority = 'high'
        }
      } catch (error) {
        console.error('Error getting user roles:', error)
      }
    }

    // Check if user is banned
    if (application.discord?.id) {
      const banned = await isUserBanned(application.discord.id)
      if (banned) {
        return NextResponse.json({ error: 'You are banned' }, { status: 403 })
      }

      const blacklisted = await isUserBlacklisted(application.discord.id)
      if (blacklisted) {
        return NextResponse.json({ error: 'You are blacklisted' }, { status: 403 })
      }
    }

    const applicationsCollection = await getCollection('applications')
    const applications = await applicationsCollection.find({}).toArray()

    // Enforce per-type rules
    const typeConfigs = await dbRead<any>('application-types')
    let typeConfig: { cooldownDays: number; uniqueApproved: boolean; allowMultiplePending: boolean } = { cooldownDays: 0, uniqueApproved: false, allowMultiplePending: false }
    
    const found = Array.isArray(typeConfigs) ? typeConfigs.find((t: any) => t.id === applicationType) : null
    if (found) typeConfig = { cooldownDays: found.cooldownDays || 0, uniqueApproved: !!found.uniqueApproved, allowMultiplePending: !!found.allowMultiplePending }

    const userId = application.discord?.id
    if (userId) {
      const sameTypeCurrent = (applications || []).filter((a: any) => a.discord?.id === userId && ((a.applicationType || 'whitelist') === applicationType))
      if (!typeConfig.allowMultiplePending) {
        if (sameTypeCurrent.some((a: any) => (a.status || 'pending') === 'pending')) {
          return NextResponse.json({ error: 'You already have a pending application of this type' }, { status: 400 })
        }
      }

      if (typeConfig.uniqueApproved) {
        const archived = await dbRead<any>('archived_applications')
        if (Array.isArray(archived)) {
          const approved = archived.find((a: any) => a.discord?.id === userId && ((a.applicationType || 'whitelist') === applicationType) && a.status === 'approved')
          if (approved) {
            return NextResponse.json({ error: 'You are already approved for this application type' }, { status: 400 })
          }
          if (typeConfig.cooldownDays > 0) {
            const deniedList = archived.filter((a: any) => a.discord?.id === userId && ((a.applicationType || 'whitelist') === applicationType) && a.status === 'denied')
            if (deniedList.length > 0) {
              deniedList.sort((a: any, b: any) => new Date(b.updatedAt || b.timestamp).getTime() - new Date(a.updatedAt || a.timestamp).getTime())
              const lastDenied = deniedList[0]
              const since = new Date(lastDenied.updatedAt || lastDenied.timestamp)
              const until = new Date(since)
              until.setDate(until.getDate() + typeConfig.cooldownDays)
              if (new Date() < until) {
                const daysRemaining = Math.max(0, Math.ceil((until.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                return NextResponse.json({ error: `Please wait ${daysRemaining} day(s) before applying again for this type` }, { status: 400 })
              }
            }
          }
        }
      }
    }

    const newApplication = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'pending' as const,
      priority,
      applicationType: applicationType,
      ...application
    }
    
    await applicationsCollection.insertOne(newApplication)

    // Handle non-critical tasks in the background to prevent timeout
    (async () => {
      try {
        // Create notification for admins
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'application_submitted',
            title: 'New Application Submitted',
            message: `${application.discord.username} has submitted a ${applicationType} application`,
            applicationId: newApplication.id,
            userId: application.discord.id,
            username: application.discord.username,
            priority: priority,
          })
        })

        // Send notification to Discord channel
        await sendChannelMessage(`New allowlist application submitted by (${application.discord.username}) - Priority: ${priority}`)

        // Log activity
        if (application.discord?.id) {
          await logActivity({
            type: 'application_created',
            userId: application.discord.id,
            userName: application.discord.username,
            targetId: newApplication.id,
            targetName: application.username || application.discord.username,
          })
        }
      } catch (bgError) {
        console.error('Background task error:', bgError)
      }
    })()

    return NextResponse.json({ message: 'Application submitted successfully', id: newApplication.id })
  } catch (error) {
    console.error('Error saving application:', error)
    return NextResponse.json({ error: 'Failed to save application' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const applications = await dbRead('applications')
    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error reading applications:', error)
    return NextResponse.json({ error: 'Failed to read applications' }, { status: 500 })
  }
}


