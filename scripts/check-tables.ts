import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkTables() {
  console.log('🔍 Checking database tables...\n')

  const tables = [
    'campaigns',
    'stakeholder_sessions',
    'agent_sessions',
    'session_documents',
    'document_chunks',
    'synthesis',
    'knowledge',
    'knowledge_chunks'
  ]

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1)

      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`)
      } else {
        console.log(`✅ Table '${table}' exists`)
      }
    } catch (err) {
      console.log(`❌ Table '${table}': ${err}`)
    }
  }

  console.log('\n✨ Table check complete!')
}

checkTables()
