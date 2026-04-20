import { MongoClient, Db, Collection, ServerApiVersion } from 'mongodb'
import fs from 'fs/promises'
import path from 'path'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env')
}

const uri = process.env.MONGODB_URI
const options = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

/**
 * Get the MongoDB database instance
 */
export async function getDb(): Promise<Db> {
  const connectedClient = await clientPromise
  return connectedClient.db('solace')
}

/**
 * Helper to make MongoDB documents JSON serializable (converts ObjectId to string)
 */
function serializeData(data: any): any {
  if (!data) return data
  if (Array.isArray(data)) return data.map(serializeData)
  if (typeof data === 'object') {
    const serialized = { ...data }
    if (serialized._id) serialized._id = serialized._id.toString()
    // Recursively handle nested objects
    Object.keys(serialized).forEach(key => {
      if (typeof serialized[key] === 'object') {
        serialized[key] = serializeData(serialized[key])
      }
    })
    return serialized
  }
  return data
}

/**
 * Generic function to get all items from a collection (replaces JSON file read)
 */
export async function dbRead<T = any>(collectionName: string): Promise<T[]> {
  try {
    const collection = await getCollection(collectionName)
    const data = await collection.find({}).toArray() as any
    
    if (data && data.length > 0) {
      return serializeData(data)
    }

    // Fallback to filesystem if DB is empty
    try {
      const filePath = path.join(process.cwd(), 'data', `${collectionName}.json`)
      const content = await fs.readFile(filePath, 'utf-8')
      const fileData = JSON.parse(content)
      const arrayData = Array.isArray(fileData) ? fileData : [fileData]
      return serializeData(arrayData)
    } catch {
      return []
    }
  } catch (error) {
    console.error(`Error reading from collection ${collectionName}:`, error)
    return []
  }
}

/**
 * Generic function to update items in a collection (replaces JSON file write)
 */
export async function dbWrite<T = any>(collectionName: string, data: T[]): Promise<void> {
  try {
    const collection = await getCollection(collectionName)
    // For simplicity in this shim, we replace the whole collection
    // In a real app, you'd use more targeted updates
    await collection.deleteMany({})
    if (data.length > 0) {
      await collection.insertMany(data as any[])
    }
  } catch (error) {
    console.error(`Error writing to collection ${collectionName}:`, error)
  }
}

/**
 * Utility to get a collection by name
 */
export async function getCollection<T = any>(name: string): Promise<Collection<T>> {
  const db = await getDb()
  return db.collection<T>(name)
}

/**
 * Compatibility helper to simulate fs.readFile for JSON files
 */
export async function dbReadFile(filePath: string): Promise<string> {
  const collectionName = filePath.split(/[\\/]/).pop()?.replace('.json', '') || 'unknown'
  const data = await dbRead(collectionName)
  
  if (!data || data.length === 0) {
    return filePath.includes('rules') || filePath.includes('types') ? '{}' : '[]'
  }

  // Collections that should always be returned as arrays
  const isArrayType = 
    collectionName.includes('applications') || 
    collectionName.includes('tickets') || 
    collectionName.includes('log') ||
    collectionName.includes('notifications')

  // If it's a single object and NOT a list type, return just the object string
  if (data.length === 1 && !isArrayType) {
    return JSON.stringify(data[0])
  }
  
  return JSON.stringify(data)
}

/**
 * Compatibility helper to simulate fs.writeFile for JSON files
 */
export async function dbWriteFile(filePath: string, data: string): Promise<void> {
  const collectionName = filePath.split(/[\\/]/).pop()?.replace('.json', '') || 'unknown'
  try {
    const collection = await getCollection(collectionName)
    const dataObj = JSON.parse(data)
    
    if (Array.isArray(dataObj)) {
      await collection.deleteMany({})
      if (dataObj.length > 0) {
        await collection.insertMany(dataObj as any)
      }
    } else {
      // For single object files (like rules.json)
      // We use a constant _id to ensure we only have one document
      await collection.updateOne(
        { _id: 'default' as any },
        { $set: { ...dataObj, updatedAt: new Date() } },
        { upsert: true }
      )
    }
  } catch (error) {
    console.error(`Error writing file to DB: ${collectionName}`, error)
  }
}
