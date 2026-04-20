import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'

dotenv.config()

async function checkApplications() {
  const uri = process.env.MONGODB_URI
  if (!uri) return

  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db('solace')
    
    console.log('--- Pending Applications ---')
    const applications = await db.collection('applications').find({}).toArray()
    console.log(`Count: ${applications.length}`)
    console.log(JSON.stringify(applications, null, 2))

    console.log('\n--- Archived Applications ---')
    const archived = await db.collection('archived_applications').find({}).toArray()
    console.log(`Count: ${archived.length}`)
    // console.log(JSON.stringify(archived, null, 2))

  } catch (e) {
    console.error(e)
  } finally {
    await client.close()
  }
}

checkApplications()
