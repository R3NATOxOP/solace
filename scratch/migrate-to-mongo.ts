import fs from 'fs/promises'
import path from 'path'
import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI
const DATA_DIR = path.join(process.cwd(), 'data')

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env')
  process.exit(1)
}

const filesToMigrate = [
  'applications.json',
  'application_drafts.json',
  'archived_applications.json',
  'application-types.json',
  'tickets.json',
  'bans.json',
  'blacklist.json',
  'notifications.json',
  'announcements.json',
  'rules.json',
  'shop-products.json',
  'activity_log.json'
]

async function migrate() {
  console.log('🚀 Starting migration to MongoDB...')
  const client = new MongoClient(MONGODB_URI!)
  
  try {
    await client.connect()
    const db = client.db('solace')
    console.log('✅ Connected to MongoDB')

    for (const filename of filesToMigrate) {
      const collectionName = filename.replace('.json', '')
      const filePath = path.join(DATA_DIR, filename)

      try {
        if (await fs.access(filePath).then(() => true).catch(() => false)) {
          const data = JSON.parse(await fs.readFile(filePath, 'utf8'))
          
          if (Array.isArray(data) && data.length > 0) {
            console.log(`📦 Migrating ${filename} to collection "${collectionName}" (${data.length} items)...`)
            
            // Clear existing data in collection
            await db.collection(collectionName).deleteMany({})
            
            // Insert new data
            await db.collection(collectionName).insertMany(data)
            console.log(`✅ Finished migrating ${filename}`)
          } else {
            console.log(`⏭️ Skipping ${filename} (empty or not an array)`)
          }
        } else {
          console.log(`❓ File not found: ${filename}`)
        }
      } catch (error) {
        console.error(`❌ Error migrating ${filename}:`, error)
      }
    }

    console.log('\n🎉 Migration complete!')
  } finally {
    await client.close()
  }
}

migrate()
