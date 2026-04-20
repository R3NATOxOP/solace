import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'

dotenv.config()

async function deepFix() {
  const uri = process.env.MONGODB_URI
  if (!uri) return

  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db('solace')
    
    console.log('--- Wiping and Restoring Rules ---')
    const rulesCollection = db.collection('rules')
    await rulesCollection.deleteMany({})
    
    const defaultRules = {
      categories: [
        {
          id: 'general',
          title: 'General Rules',
          rules: [
            'Respect all players and staff members at all times.',
            'No harassment, discrimination, or hate speech of any kind.',
            'Do not spam chat, voice chat, or any other communication channels.',
            'English is the primary language. Use appropriate channels for other languages.',
            'Do not advertise other servers or communities.',
            'Keep all content appropriate and family-friendly.'
          ]
        },
        {
          id: 'roleplay',
          title: 'Roleplay Rules',
          rules: [
            'Stay in character at all times while in-game.',
            'Powergaming and metagaming are strictly prohibited.',
            'Value of Life (VoL) must be respected in all situations.',
            'No random deathmatching or revenge killing.',
            'Fear roleplay must be taken seriously.'
          ]
        },
        {
          id: 'combat',
          title: 'Combat Rules',
          rules: [
            'Proper initiation of combat is required.',
            'No combat logging during active situations.',
            'No drive-by shootings without proper roleplay buildup.',
            'No random deathmatching.'
          ]
        }
      ]
    }
    await rulesCollection.insertOne(defaultRules)
    console.log('✅ Rules restored.')

    console.log('\n--- Wiping and Restoring Application Types ---')
    const typesCollection = db.collection('application-types')
    await typesCollection.deleteMany({})
    
    const defaultTypes = [
      {
        id: 'whitelist',
        name: 'Whitelist Application',
        cooldownDays: 0,
        uniqueApproved: false,
        allowMultiplePending: false,
        fields: [
          { id: 'full_name', label: 'Full Name', type: 'text', required: true },
          { id: 'age', label: 'Age', type: 'number', required: true },
          { id: 'steam_id', label: 'Steam ID', type: 'text', required: true },
          { id: 'experience', label: 'Roleplay Experience', type: 'textarea', required: true },
          { id: 'backstory', label: 'Character Backstory', type: 'textarea', required: true }
        ],
        enabled: true
      }
    ]
    await typesCollection.insertMany(defaultTypes)
    console.log('✅ Application types restored.')

  } catch (e) {
    console.error(e)
  } finally {
    await client.close()
  }
}

deepFix()
