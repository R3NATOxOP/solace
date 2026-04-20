import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'

dotenv.config()

async function fixData() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('No MONGODB_URI found')
    return
  }

  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db('solace')
    
    // 1. Fix Rules
    const rulesCollection = db.collection('rules')
    const existingRules = await rulesCollection.find({}).toArray()
    
    if (existingRules.length === 0) {
      console.log('Restoring default rules...')
      const defaultRules = {
        categories: [
          {
            id: 'general',
            title: 'General Rules',
            rules: [
              'Respect all players and staff members at all times.',
              'No harassment, discrimination, or hate speech of any kind.',
              'Do not spam chat, voice chat, or any other communication channels.',
              'English is the primary language. Use appropriate channels for other languages.'
            ]
          },
          {
            id: 'roleplay',
            title: 'Roleplay Rules',
            rules: [
              'Stay in character at all times while in-game.',
              'Powergaming and metagaming are strictly prohibited.',
              'Value of Life (VoL) must be respected in all situations.'
            ]
          }
        ]
      }
      await rulesCollection.insertOne(defaultRules)
      console.log('✅ Rules restored.')
    } else {
      console.log('Rules already exist in DB.')
    }

    // 2. Fix Application Types
    const typesCollection = db.collection('application-types')
    const existingTypes = await typesCollection.find({}).toArray()
    
    if (existingTypes.length === 0) {
      console.log('Restoring application types...')
      const defaultType = {
        id: 'whitelist',
        name: 'Whitelist Application',
        cooldownDays: 0,
        uniqueApproved: false,
        allowMultiplePending: false,
        fields: [
          { id: 'name', label: 'Full Name', type: 'text', required: true },
          { id: 'age', label: 'Age', type: 'number', required: true },
          { id: 'experience', label: 'Roleplay Experience', type: 'textarea', required: true }
        ]
      }
      await typesCollection.insertOne(defaultType)
      console.log('✅ Application types restored.')
    } else {
      console.log('Application types already exist in DB.')
    }

  } catch (e) {
    console.error(e)
  } finally {
    await client.close()
  }
}

fixData()
