import { NextAuthOptions, Session } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { hasPermission, hasAdminRole, hasModeratorRole, hasReviewerRole, hasAnyStaffRole } from "./config"
import { getUserRoles } from "./discord-bot"

export { hasPermission, hasAdminRole, hasModeratorRole, hasReviewerRole, hasAnyStaffRole }

/**
 * Check if user has any staff access (admin, moderator, or reviewer)
 * Use this as replacement for isAdmin checks
 */
export const hasStaffAccess = (userRoles: string[]): boolean => {
  return hasAnyStaffRole(userRoles)
}

/**
 * Check if a session has any staff access based on Discord roles
 * This is an async function that fetches user roles from Discord
 */
export const hasAnyStaffAccess = async (session: Session): Promise<boolean> => {
  if (!session?.discord?.id) {
    return false
  }
  
  try {
    const userRoles = await getUserRoles(session.discord.id)
    return hasAnyStaffRole(userRoles)
  } catch (error) {
    console.error('Error checking staff access:', error)
    return false
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify email guilds guilds.members.read'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const discordProfile = profile as any
        token.discord = {
          id: discordProfile.id,
          username: discordProfile.username,
          discriminator: discordProfile.discriminator,
          avatar: discordProfile.avatar,
          banner: discordProfile.banner,
          accentColor: discordProfile.accent_color,
          verified: discordProfile.verified,
          email: discordProfile.email,
          createdAt: new Date(Number(BigInt(discordProfile.id) >> BigInt(22)) + 1420070400000).toISOString(),
        }
      }
      return token
    },
    async session({ session, token }) {
      session.discord = token.discord as {
        id: string;
        username: string;
        discriminator: string;
        avatar: string;
        banner: string;
        accentColor: number | null;
        verified: boolean;
        email: string;
        createdAt: string;
      }
      return session
    }
  },
  events: {
    async signIn({ user, account, profile }) {
      if (user?.id) {
        try {
          const { getUserRoles } = await import("./discord-bot")
          const { hasAnyStaffRole } = await import("./config")
          const { logActivity } = await import("./activity-log")
          const { sendChannelMessage } = await import("./discord-bot")
          
          const roles = await getUserRoles(user.id)
          if (hasAnyStaffRole(roles)) {
            // Log staff login
            await logActivity({
              type: 'staff_login',
              userId: user.id,
              userName: (profile as any)?.username || user.name || 'Unknown',
              details: {
                method: account?.provider || 'unknown',
                roles: roles.filter(r => r.length > 20) // Store only role IDs
              }
            })
            
            // Notify staff logs channel
            await sendChannelMessage(
              `👤 **Staff Login**: ${(profile as any)?.username || user.name} has logged into the dashboard.`,
              process.env.DISCORD_STAFF_LOGS_CHANNEL_ID
            )
          }
        } catch (error) {
          console.error('Error logging staff login:', error)
        }
      }
    }
  }
}
