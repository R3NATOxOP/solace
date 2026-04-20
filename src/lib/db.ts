import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Falling back to local filesystem.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Generic function to get all items from a collection (replaces JSON file read)
 */
export async function dbRead<T = any>(collectionName: string): Promise<T[]> {
  try {
    const { data, error } = await supabase
      .from('storage')
      .select('data')
      .eq('key', collectionName)
      .single()

    console.log(`[DB] Reading ${collectionName}:`, { 
      found: !!data, 
      error: error ? error.message : 'none' 
    })

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        // Fallback to filesystem if not in DB
        return await fallbackRead(collectionName)
      }
      throw error
    }

    const result = data.data
    return Array.isArray(result) ? result : [result]
  } catch (error) {
    console.error(`Error reading from Supabase (${collectionName}):`, error)
    return await fallbackRead(collectionName)
  }
}

async function fallbackRead(collectionName: string): Promise<any[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', `${collectionName}.json`)
    const content = await fs.readFile(filePath, 'utf-8')
    const fileData = JSON.parse(content)
    return Array.isArray(fileData) ? fileData : [fileData]
  } catch {
    return []
  }
}

/**
 * Generic function to update items in a collection (replaces JSON file write)
 */
export async function dbWrite<T = any>(collectionName: string, data: T[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('storage')
      .upsert({ 
        key: collectionName, 
        data: data,
        updated_at: new Date().toISOString() 
      }, { onConflict: 'key' })

    if (error) throw error
  } catch (error) {
    console.error(`Error writing to Supabase (${collectionName}):`, error)
    throw error // Re-throw so the API knows it failed
  }
}

/**
 * Compatibility helper to simulate fs.readFile for JSON files
 */
export async function dbReadFile(filePath: string): Promise<string> {
  const collectionName = filePath.split(/[\\/]/).pop()?.replace('.json', '') || 'unknown'
  const items = await dbRead(collectionName)
  
  if (!items || items.length === 0) {
    return filePath.includes('rules') || filePath.includes('types') ? '{}' : '[]'
  }

  // Collections that should always be returned as arrays
  const isArrayType = 
    collectionName.includes('applications') || 
    collectionName.includes('tickets') || 
    collectionName.includes('log') ||
    collectionName.includes('notifications')

  // If it's a single object and NOT a list type, return just the object string
  if (items.length === 1 && !isArrayType) {
    return JSON.stringify(items[0])
  }
  
  return JSON.stringify(items)
}

/**
 * Compatibility helper to simulate fs.writeFile for JSON files
 */
export async function dbWriteFile(filePath: string, data: string): Promise<void> {
  const collectionName = filePath.split(/[\\/]/).pop()?.replace('.json', '') || 'unknown'
  try {
    const dataObj = JSON.parse(data)
    await dbWrite(collectionName, Array.isArray(dataObj) ? dataObj : [dataObj])
  } catch (error) {
    console.error(`Error writing file to Supabase: ${collectionName}`, error)
  }
}

// Minimal placeholder for MongoDB-style collection access if needed elsewhere
export async function getCollection(name: string) {
  return {
    find: () => ({
      toArray: () => dbRead(name)
    }),
    insertOne: (doc: any) => {
      return dbRead(name).then(current => {
        return dbWrite(name, [...current, doc])
      })
    },
    insertMany: (docs: any[]) => {
      return dbRead(name).then(current => {
        return dbWrite(name, [...current, ...docs])
      })
    },
    deleteMany: () => dbWrite(name, []),
    updateOne: (filter: any, update: any, options: any) => {
        // Very basic shim for rules update
        if (update.$set) {
            return dbWrite(name, [update.$set])
        }
        return Promise.resolve()
    }
  } as any
}
