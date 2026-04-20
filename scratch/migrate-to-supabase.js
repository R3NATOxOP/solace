const fs = require('fs/promises');
const path = require('path');

const supabaseUrl = 'https://vfcnbdznuffjbqjdrvjx.supabase.co';
const supabaseKey = 'sb_publishable_SR6jXwUWcqoHIYurWqcSEw_w4wevnaC';

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
        'Keep all content appropriate and family-friendly.',
        'Report bugs and exploits to staff instead of abusing them.',
        'Do not impersonate staff members or other players.'
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
        'Fear roleplay must be taken seriously.',
        'Use /me and /do commands appropriately for actions.',
        'Character names must be realistic and appropriate.',
        'No mixing OOC (Out of Character) information with IC (In Character) situations.'
      ]
    },
    {
      id: 'combat',
      title: 'Combat Rules',
      rules: [
        'No drive-by shootings without proper roleplay buildup.',
        'Weapon usage must follow realistic roleplay scenarios.',
        'No camping in safe zones or spawn areas.',
        'Proper initiation of combat is required.',
        'No ghosting or leaving combat without consequences.',
        'Medical roleplay must be respected during injuries.',
        'No combat logging during active situations.',
        'Weapon skins and modifications must be roleplayed appropriately.'
      ]
    }
  ]
};

async function migrate() {
  const dataDir = path.join(process.cwd(), 'data');
  const files = await fs.readdir(dataDir);
  
  console.log(`Starting DIRECT migration to Supabase (${supabaseUrl})...`);

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    
    const key = file.replace('.json', '');
    let content;

    try {
      const raw = await fs.readFile(path.join(dataDir, file), 'utf-8');
      content = JSON.parse(raw);
      
      // Special case for rules - if empty, use defaults
      if (key === 'rules' && (!content || (Array.isArray(content) && content.length === 0) || (typeof content === 'object' && Object.keys(content).length === 0))) {
        console.log(`Restoring default rules for ${file}...`);
        content = defaultRules;
      }

      // Ensure it's an array for consistency
      const dataToStore = Array.isArray(content) ? content : [content];

      console.log(`Migrating ${file} (${dataToStore.length} items)...`);
      
      const response = await fetch(`${supabaseUrl}/rest/v1/storage`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          key: key,
          data: dataToStore,
          updated_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log(`Successfully migrated ${file}`);
      } else {
        const err = await response.text();
        console.error(`Error migrating ${file}: ${response.status} - ${err}`);
      }
    } catch (err) {
      console.error(`Failed to process ${file}:`, err);
    }
  }

  console.log('Migration complete! 🏁');
}

migrate();
