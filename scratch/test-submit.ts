import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'

dotenv.config()

async function testSubmit() {
  const uri = process.env.MONGODB_URI
  if (!uri) return

  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db('solace')
    const col = db.collection('applications')
    
    const testApp = {
      id: 'test_' + Date.now(),
      timestamp: new Date().toISOString(),
      status: 'pending',
      username: 'TestUser',
      age: 25,
      steamId: 'steam:76561198000000000',
      cfxAccount: 'https://forum.cfx.re/u/test',
      experience: 'I have 5 years of RP experience.',
      character: 'I am a humble shopkeeper.',
      discord: {
        id: '1234567890',
        username: 'testuser',
        avatar: ''
      },
      priority: 'normal',
      applicationType: 'whitelist'
    }

    await col.insertOne(testApp)
    console.log('✅ Test application submitted to MongoDB.')
    
  } catch (e) {
    console.error(e)
  } finally {
    await client.close()
  }
}

testSubmit()
