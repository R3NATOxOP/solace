import { MongoClient, Db, Collection } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env')
}

const uri = process.env.MONGODB_URI
const options = {}

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
 * Helper to get a collection
 */
export async function getCollection<T = any>(name: string): Promise<Collection<T>> {
  const db = await getDb()
  return db.collection<T>(name)
}

/**
 * Generic function to get all items from a collection (replaces JSON file read)
 */
export async function dbRead<T = any>(collectionName: string): Promise<T[]> {
  try {
    const collection = await getCollection(collectionName)
    return collection.find({}).toArray() as any
  } catch (error) {
    console.error(`Error reading from collection ${collectionName}:`, error)
    return []
  }
}

/**
 * Generic function to save/replace all items in a collection (replaces JSON file write)
 */
export async function dbWrite<T = any>(collectionName: string, data: T[]): Promise<void> {
  try {
    const collection = await getCollection(collectionName)
    await collection.deleteMany({})
    if (data && data.length > 0) {
      await collection.insertMany(data as any)
    }
  } catch (error) {
    console.error(`Error writing to collection ${collectionName}:`, error)
  }
}

/**
 * Compatibility helper to simulate fs.readFile for JSON files
 */
export async function dbReadFile(filePath: string): Promise<string> {
  const collectionName = filePath.split(/[\\/]/).pop()?.replace('.json', '') || 'unknown'
  const data = await dbRead(collectionName)
  
  // If it's a single-object "file" (like rules.json), it might be stored as the first element of the array
  if (data.length === 1 && !filePath.includes('notifications') && !filePath.includes('activity-log')) {
    // Check if the single item looks like a wrapped config object
    return JSON.stringify(data[0])
  }
  
  return JSON.stringify(data)
}

/**
 * Compatibility helper to simulate fs.writeFile for JSON files
 */
export async function dbWriteFile(filePath: string, content: string): Promise<void> {
  const collectionName = filePath.split(/[\\/]/).pop()?.replace('.json', '') || 'unknown'
  try {
    const data = JSON.parse(content)
    const collection = await getCollection(collectionName)
    
    // For single-object files like rules.json, we replace the entire collection content with one document
    // or if it's an array, we use dbWrite.
    if (!Array.isArray(data)) {
      await collection.deleteMany({})
      await collection.insertOne(data as any)
    } else {
      await dbWrite(collectionName, data)
    }
  } catch (e) {
    console.error(`Failed to parse content for ${collectionName}:`, e)
  }
}

