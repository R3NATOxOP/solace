import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { applicationConfig, hasPriorityRole } from './config';
import type { Application, Ticket } from './types';

// Verify this is running on server
if (typeof window !== 'undefined') {
  throw new Error('discord-bot.ts should only be used on the server side');
}

let client: Client | null = null;
let isReady = false;
const messageQueue: Array<{ userId: string; status: 'approved' | 'denied'; staffName?: string; reason?: string; retries: number }> = [];
const channelMessageQueue: Array<{ message: string; channelId?: string; retries: number }> = [];

export function initializeDiscordBot() {
  if (!process.env.DISCORD_BOT_TOKEN) {
    console.error('DISCORD_BOT_TOKEN is not set in the environment variables');
    return;
  }

  if (client) {
    console.log('Discord bot already initialized');
    return;
  }

  client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMembers],
  });

  try {
    client.on('ready', () => {
      console.log(`Discord bot logged in as ${client!.user?.tag || 'Unknown'}!`);
      isReady = true;
      processMessageQueue();
      processChannelMessageQueue();
      setInterval(() => {
        if (isReady && messageQueue.length > 0) {
          console.log(`Processing ${messageQueue.length} queued messages...`);
          processMessageQueue();
        }
        if (isReady && channelMessageQueue.length > 0) {
          console.log(`Processing ${channelMessageQueue.length} queued channel messages...`);
          processChannelMessageQueue();
        }
      }, 30000);
    });

    client.on('error', (error) => {
      console.error('Discord client error:', error);
      isReady = false;
    });

    client.on('disconnect', () => {
      console.log('Discord bot disconnected');
      isReady = false;
    });

    client.on('guildMemberUpdate', async (oldMember, newMember) => {
      try {
        const oldRoles = oldMember.roles.cache.flatMap(r => [r.name, r.id]);
        const newRoles = newMember.roles.cache.flatMap(r => [r.name, r.id]);

        // Check if roles actually changed
        if (JSON.stringify(oldRoles.sort()) === JSON.stringify(newRoles.sort())) {
          return;
        }

        console.log(`Roles changed for user ${newMember.user.id} (${newMember.user.username})`);
        console.log(`Old roles: ${oldRoles.join(', ')}`);
        console.log(`New roles: ${newRoles.join(', ')}`);

        // Check for priority roles using config
        const hadPriorityRole = hasPriorityRole(oldRoles);
        const hasPriorityRoleNow = hasPriorityRole(newRoles);

        // Only update if priority status changed
        if (hadPriorityRole !== hasPriorityRoleNow) {
          await updateApplicationPriority(newMember.user.id, hasPriorityRoleNow);
        }
      } catch (error) {
        console.error('Error handling role update:', error);
      }
    });

    client.login(process.env.DISCORD_BOT_TOKEN);
  } catch (error) {
    console.error('Failed to initialize Discord bot:', error);
  }
}

async function updateApplicationPriority(userId: string, hasPriorityRole: boolean): Promise<void> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Fetch pending applications for this user
    const response = await fetch(`${baseUrl}/api/applications`);
    if (!response.ok) {
      console.error('Failed to fetch applications');
      return;
    }

    const applications = await response.json();
    const userApplication = applications.find((app: Application) =>
      app.discord?.id === userId && app.status === 'pending'
    );

    if (!userApplication) {
      console.log(`No pending application found for user ${userId}`);
      return;
    }

    const newPriority = hasPriorityRole ? 'high' : 'normal';
    const oldPriority = userApplication.priority || 'normal';

    // Only update if priority actually changed
    if (oldPriority === newPriority) {
      return;
    }

    // Update the application priority using system authentication
    const updateResponse = await fetch(`${baseUrl}/api/applications/${userApplication.id}/priority`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priority: newPriority,
        systemUpdate: process.env.NEXTAUTH_SECRET
      })
    });

    if (updateResponse.ok) {
      console.log(`Updated application ${userApplication.id} priority from ${oldPriority} to ${newPriority}`);

      // Send notification about priority change
      await sendChannelMessage(
        `🔔 Application priority auto-updated: ${userApplication.username || userApplication.discord.username} (${oldPriority} → ${newPriority}) due to role change`
      );
    } else {
      console.error('Failed to update application priority');
    }
  } catch (error) {
    console.error('Error updating application priority:', error);
  }
}

// In-memory cache for user roles with 2-minute expiry
const rolesCache = new Map<string, { roles: string[]; timestamp: number }>()
const ROLES_CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

export async function getUserRoles(userId: string): Promise<string[]> {
  // Check cache first
  const cached = rolesCache.get(userId)
  if (cached && Date.now() - cached.timestamp < ROLES_CACHE_DURATION) {
    return cached.roles
  }

  // Initialize bot if not already initialized
  if (!client) {
    console.log('Discord bot not initialized, initializing now...')
    initializeDiscordBot()
  }

  // Wait for bot to be ready with reduced timeout (1 second)
  let attempts = 0
  const maxAttempts = 10 // 10 attempts * 500ms = 5 second timeout

  while (!isReady && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 500))
    attempts++
  }

  if (!isReady) {
    console.debug('Discord bot not ready, returning cached or empty roles')
    // Return cached value even if expired, or empty array
    return cached ? cached.roles : []
  }

  const guildId = process.env.DISCORD_GUILD_ID
  if (!guildId) {
    throw new Error('DISCORD_GUILD_ID not set')
  }

  let guild = client!.guilds.cache.get(guildId)
  if (!guild) {
    try {
      guild = await client!.guilds.fetch(guildId)
    } catch (err) {
      console.error(`[Discord] Failed to fetch guild ${guildId}:`, err)
      throw new Error('Guild not found')
    }
  }
  try {
    const member = await guild.members.fetch(userId)
    const roles = Array.from(member.roles.cache.values()).flatMap(role => [role.name, role.id])

    // Cache the result
    rolesCache.set(userId, { roles, timestamp: Date.now() })

    return roles
  } catch (error) {
    console.error('Error fetching member roles:', error)
    // Return cached value even if expired, or empty array
    return cached ? cached.roles : []
  }
}

export async function sendChannelMessage(message: string, channelId?: string): Promise<void> {
  if (!client) {
    console.log('Discord bot not initialized, initializing now...');
    initializeDiscordBot();
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  if (!isReady) {
    console.log('Bot not ready, queuing channel message');
    channelMessageQueue.push({ message, channelId, retries: 0 });
    return;
  }

  try {
    await sendChannelMessageInternal(message, channelId);
  } catch (error) {
    console.error('Failed to send channel message, queuing for retry:', error);
    channelMessageQueue.push({ message, channelId, retries: 0 });
  }
}

async function sendChannelMessageInternal(message: string, channelId?: string): Promise<void> {
  if (!client || !isReady) {
    throw new Error('Discord bot not ready for channel message');
  }
  const chId = channelId || process.env.DISCORD_LOGS_CHANNEL_ID || process.env.DISCORD_NOTIFICATION_CHANNEL_ID;
  if (!chId) {
    throw new Error('No notification channel ID set');
  }
  try {
    const channel = client.channels.cache.get(chId);
    if (channel?.isTextBased()) {
      await (channel as { send: (msg: string) => Promise<unknown> }).send(message);
      console.log(`Channel message sent successfully to ${chId}`);
    } else {
      throw new Error('Channel not found or not text-based');
    }
  } catch (error) {
    console.error('Error sending channel message:', error);
    throw error;
  }
}

async function processChannelMessageQueue() {
  if (!isReady || channelMessageQueue.length === 0) return;

  console.log(`Processing ${channelMessageQueue.length} queued channel messages...`);

  const queuedMessage = channelMessageQueue.shift();
  if (!queuedMessage) return;

  try {
    await sendChannelMessageInternal(queuedMessage.message, queuedMessage.channelId);
    console.log('Queued channel message sent successfully');
  } catch (error) {
    console.error('Failed to send queued channel message:', error);
    if (queuedMessage.retries < 3) {
      queuedMessage.retries++;
      channelMessageQueue.unshift(queuedMessage);
      console.log(`Retrying channel message (attempt ${queuedMessage.retries}/3) in ${5000 * queuedMessage.retries}ms`);
      setTimeout(() => processChannelMessageQueue(), 5000 * queuedMessage.retries);
    } else {
      console.error('Failed to send channel message after 3 retries - giving up');
    }
  }
  setTimeout(() => processChannelMessageQueue(), 1000);
}

async function processMessageQueue() {
  if (!isReady || messageQueue.length === 0) return;

  console.log(`Processing ${messageQueue.length} queued Discord messages...`);

  const message = messageQueue.shift();
  if (!message) return;

  try {
    await sendDirectMessageInternal(message.userId, message.status, message.staffName, message.reason);
    console.log(`Queued message sent to user ${message.userId}`);
  } catch (error) {
    console.error(`Failed to send queued message to user ${message.userId}:`, error);
    if (message.retries < 3) {
      message.retries++;
      messageQueue.unshift(message);
      console.log(`Retrying message to user ${message.userId} (attempt ${message.retries}/3) in ${5000 * message.retries}ms`);
      setTimeout(() => processMessageQueue(), 5000 * message.retries);
    } else {
      console.error(`Failed to send message to user ${message.userId} after 3 retries - giving up`);
    }
  }
  setTimeout(() => processMessageQueue(), 1000);
}

async function sendDirectMessageInternal(userId: string, status: 'approved' | 'denied', staffName: string = 'Staff', reason?: string): Promise<void> {
  if (!client) {
    throw new Error('Discord bot not initialized');
  }

  const isApproved = status === 'approved'
  const timestamp = new Date()
  const formattedDate = timestamp.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const formattedTime = timestamp.toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const bannerUrl = isApproved 
    ? `${baseUrl}/images/approved_banner.png`
    : `${baseUrl}/images/rejected_banner.png`

  const embed = new EmbedBuilder()
    .setColor(isApproved ? '#10B981' : '#EF4444')
    .setTitle(`${applicationConfig.website.serverName}`)
    .setDescription(
      isApproved
        ? `Your application has been **Accepted**.`
        : `Your application has been **rejected**. Feel free to apply again.`
    )
    .addFields(
      { name: 'Applicant', value: `<@${userId}>`, inline: false },
      { name: 'Reviewed By', value: staffName, inline: true },
      { name: 'Time of Response', value: `${formattedDate}, ${formattedTime}`, inline: true },
    )
    .setImage(bannerUrl)
    .setFooter({ text: `#thriveinsolace • ${formattedTime}` })

  if (reason && !isApproved) {
    embed.addFields({
      name: 'Reason',
      value: reason,
      inline: false
    });
  }

  try {
    const user = await Promise.race([
      client.users.fetch(userId),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('User fetch timeout')), 10000)
      )
    ]);

    if (!user) {
      throw new Error('User not found');
    }

    await Promise.race([
      user.send({ embeds: [embed] }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Message send timeout')), 10000)
      )
    ]);

    console.log(`Discord message sent successfully to user ${userId}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Cannot send messages to this user')) {
      console.error(`Cannot send DM to user ${userId}: User has DMs disabled or bot is blocked`);
    } else if (errorMessage.includes('Missing Permissions')) {
      console.error(`Cannot send DM to user ${userId}: Bot lacks permissions`);
    } else if (errorMessage.includes('Unknown User')) {
      console.error(`Cannot send DM to user ${userId}: User not found`);
    } else {
      console.error(`Failed to send Discord message to user ${userId}:`, error);
    }
    throw error;
  }
}

export async function sendDirectMessage(userId: string, status: 'approved' | 'denied', staffName: string = 'Staff', reason?: string): Promise<void> {
  if (!client) {
    console.log('Discord bot not initialized, initializing now...');
    initializeDiscordBot();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (!isReady) {
    console.log(`Bot not ready, queuing message for user ${userId}`);
    messageQueue.push({ userId, status, staffName, reason, retries: 0 });
    return;
  }

  try {
    await sendDirectMessageInternal(userId, status, staffName, reason);
  } catch (error) {
    console.error(`Immediate send failed for user ${userId}, queuing for retry:`, error);
    messageQueue.push({ userId, status, staffName, reason, retries: 0 });
    console.log(`Message queued for retry to user ${userId}`);
  }
}

export function getBotStatus() {
  return {
    initialized: !!client,
    ready: isReady,
    queueLength: messageQueue.length,
    channelQueueLength: channelMessageQueue.length,
    user: client?.user?.tag || null,
  };
}

export function forceProcessQueue() {
  if (isReady) {
    processMessageQueue();
    processChannelMessageQueue();
  }
}

export async function notifyTicketCreated(ticket: Ticket): Promise<void> {
  if (!isReady || !client) {
    console.warn('Discord bot not ready, cannot send ticket notification')
    return
  }
  const channelId = process.env.DISCORD_SUPPORT_CHANNEL_ID || process.env.DISCORD_NOTIFICATION_CHANNEL_ID
  if (!channelId) return
  try {
    const channel = await client.channels.fetch(channelId)
    if (!channel || !('send' in channel)) return
    const embed = new EmbedBuilder()
      .setColor('#3B82F6')
      .setTitle('🎫 New Support Ticket')
      .setDescription(`A new transmission has been established.`)
      .addFields(
        { name: 'Subject', value: ticket.subject, inline: false },
        { name: 'Category', value: ticket.category.toUpperCase(), inline: true },
        { name: 'Priority', value: ticket.priority.toUpperCase(), inline: true },
        { name: 'From', value: ticket.userName || 'Unknown', inline: false },
      )
      .setTimestamp()
    await (channel as any).send({ embeds: [embed] })
  } catch (error) {
    console.error('Failed to send ticket notification:', error)
  }
}

export async function notifyTicketStatusChanged(ticket: Ticket, oldStatus: string): Promise<void> {
  if (!isReady || !client) {
    console.warn('Discord bot not ready, cannot send ticket status notification')
    return
  }
  const channelId = process.env.DISCORD_SUPPORT_CHANNEL_ID || process.env.DISCORD_NOTIFICATION_CHANNEL_ID
  if (!channelId) return
  try {
    const channel = await client.channels.fetch(channelId)
    if (!channel || !('send' in channel)) return
    const color = ticket.status === 'resolved' ? '#10B981' : ticket.status === 'closed' ? '#EF4444' : '#F59E0B'
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('🔄 Ticket Status Updated')
      .setDescription(`Transmission ID: \`${ticket.id}\``)
      .addFields(
        { name: 'Subject', value: ticket.subject, inline: false },
        { name: 'Old Status', value: oldStatus.replace('_', ' ').toUpperCase(), inline: true },
        { name: 'New Status', value: ticket.status.replace('_', ' ').toUpperCase(), inline: true },
      )
      .setTimestamp()
    await (channel as any).send({ embeds: [embed] })
  } catch (error) {
    console.error('Failed to send status notification:', error)
  }
}

export async function notifyApplicationStatusChanged(application: Application, staffName: string): Promise<void> {
  if (!isReady || !client) return
  const channelId = process.env.DISCORD_LOGS_CHANNEL_ID || process.env.DISCORD_NOTIFICATION_CHANNEL_ID
  if (!channelId) return

  try {
    const channel = await client.channels.fetch(channelId)
    if (!channel || !('send' in channel)) return

    const isApproved = application.status === 'approved'
    const embed = new EmbedBuilder()
      .setColor(isApproved ? '#10B981' : '#EF4444')
      .setTitle(isApproved ? '✅ Application Approved' : '❌ Application Denied')
      .setDescription(`Application from **${application.discord.username}** has been processed.`)
      .addFields(
        { name: 'User', value: `${application.discord.username} (<@${application.discord.id}>)`, inline: true },
        { name: 'Staff Member', value: staffName, inline: true },
        { name: 'Status', value: application.status.toUpperCase(), inline: true },
      )

    if (application.statusReason) {
      embed.addFields({ name: 'Reason/Note', value: application.statusReason })
    }

    embed.setTimestamp()
    await (channel as any).send({ embeds: [embed] })
  } catch (error) {
    console.error('Failed to send application status log:', error)
  }
}

export async function notifyPublicApplicationResponse(application: Application, staffName: string): Promise<void> {
  if (!isReady || !client) return
  const channelId = process.env.DISCORD_PUBLIC_LOGS_CHANNEL_ID
  if (!channelId) return

  try {
    const channel = await client.channels.fetch(channelId)
    if (!channel || !('send' in channel)) return

    const isApproved = application.status === 'approved'
    const timestamp = new Date()
    const formattedDate = timestamp.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    const formattedTime = timestamp.toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const bannerUrl = isApproved 
      ? `${baseUrl}/images/approved_banner.png`
      : `${baseUrl}/images/rejected_banner.png`

    const embed = new EmbedBuilder()
      .setColor(isApproved ? '#10B981' : '#EF4444')
      .setTitle(`${applicationConfig.website.serverName}`)
      .setDescription(
        isApproved
          ? `Your application has been **Accepted**.`
          : `Your application has been **rejected**. Feel free to apply again.`
      )
      .addFields(
        { name: 'Applicant', value: `<@${application.discord.id}>`, inline: false },
        { name: 'Reviewed By', value: staffName, inline: true },
        { name: 'Time of Response', value: `${formattedDate}, ${formattedTime}`, inline: true },
      )
      .setImage(bannerUrl)
      .setFooter({ text: `#thriveinsolace • ${formattedTime}` })

    await (channel as any).send({
      content: `<@${application.discord.id}>`,
      embeds: [embed]
    })
  } catch (error) {
    console.error('Failed to send public application log:', error)
  }
}
