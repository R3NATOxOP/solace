import { getCollection } from './db'
import type { ActivityLog } from './types'

export async function logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
  try {
    const collection = await getCollection<ActivityLog>('activity_log')
    
    const newLog: ActivityLog = {
      ...log,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    }

    await collection.insertOne(newLog as any)
    
    // Optional: Keep only last 10,000 logs (MongoDB handles this better with a TTL index, 
    // but we'll do it manually here for consistency)
    const count = await collection.countDocuments()
    if (count > 10000) {
      const oldest = await collection.find().sort({ timestamp: 1 }).limit(count - 10000).toArray()
      if (oldest.length > 0) {
        await collection.deleteMany({ _id: { $in: oldest.map(o => o._id) } as any })
      }
    }
  } catch (error) {
    console.error('Error logging activity:', error)
  }
}

export async function getActivityLogs(limit: number = 100): Promise<ActivityLog[]> {
  try {
    const collection = await getCollection<ActivityLog>('activity_log')
    return collection.find({}).sort({ timestamp: -1 }).limit(limit).toArray() as any
  } catch {
    return []
  }
}

export async function getActivityLogsByType(type: ActivityLog['type'], limit: number = 100): Promise<ActivityLog[]> {
  try {
    const collection = await getCollection<ActivityLog>('activity_log')
    return collection.find({ type }).sort({ timestamp: -1 }).limit(limit).toArray() as any
  } catch {
    return []
  }
}

export async function getActivityLogsByTarget(targetId: string, limit: number = 100): Promise<ActivityLog[]> {
  try {
    const collection = await getCollection<ActivityLog>('activity_log')
    return collection.find({ targetId }).sort({ timestamp: -1 }).limit(limit).toArray() as any
  } catch {
    return []
  }
}

