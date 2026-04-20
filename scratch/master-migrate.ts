import { MongoClient } from 'mongodb'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config()

async function migrateAll() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('No MONGODB_URI found')
    return
  }

  const client = new MongoClient(uri)
  const DATA_DIR = path.join(process.cwd(), 'data')

  try {
    await client.connect()
    const db = client.db('solace')
    console.log('Connected to MongoDB. Starting master migration...')

    const files = await fs.readdir(DATA_DIR)
    const jsonFiles = files.filter(f => f.endsWith('.json'))

    for (const filename of jsonFiles) {
      const collectionName = filename.replace('.json', '')
      const filePath = path.join(DATA_DIR, filename)
      
      try {
        const content = await fs.readFile(filePath, 'utf-8')
        const data = JSON.parse(content)
        
        if (!data || (Array.isArray(data) && data.length === 0)) {
          console.log(`Skipping empty file: ${filename}`)
          continue
        }

        console.log(`Migrating ${filename} to collection "${collectionName}"...`)
        const collection = db.collection(collectionName)

        if (Array.isArray(data)) {
          // For arrays (applications, tickets, etc.)
          // We upsert each item by its ID if it has one, otherwise we just insert
          for (const item of data) {
            const id = item.id || item._id
            if (id) {
              await collection.updateOne(
                { id: id as any }, 
                { $set: item }, 
                { upsert: true }
              )
            } else {
              await collection.insertOne(item)
            }
          }
          console.log(`✅ Migrated ${data.length} items from ${filename}`)
        } else {
          // For single objects (rules, config)
          await collection.updateOne(
            { _id: 'default' as any },
            { $set: { ...data, updatedAt: new Date() } },
            { upsert: true }
          )
          console.log(`✅ Migrated single object from ${filename}`)
        }
      } catch (err) {
        console.error(`Failed to migrate ${filename}:`, err)
      }
    }

    console.log('\n🎉 Master Migration Complete!')
  } catch (e) {
    console.error('Migration failed:', e)
  } finally {
    await client.close()
  }
}

migrateAll()
