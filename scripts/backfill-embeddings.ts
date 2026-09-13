import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { generateAndSaveEmbedding } from '../lib/ai'

async function main() {
  const pending = await prisma.feedback.findMany({
    where: { embedding: { is: null } },
    select: { id: true, content: true },
    take: 200,
  })

  console.log(`Found ${pending.length} feedback items without embeddings`)
  for (const f of pending) {
    try {
      console.log('Embedding', f.id)
      await generateAndSaveEmbedding(f.id, f.content)
    } catch (err) {
      console.error('Failed:', f.id, err)
    }
  }

  console.log('Done')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
