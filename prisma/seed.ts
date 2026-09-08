import 'dotenv/config'
import { PrismaClient, Role, FeedbackStatus, Sentiment } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { FEEDBACK_RECORDS } from '../lib/feedback-data'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seed...')

  const workspace = await prisma.workspace.create({
    data: { name: 'LOOP Demo Workspace' },
  })

  const hash = await bcrypt.hash('demo1234', 12)

  const [admin, analyst, viewer] = await Promise.all([
    prisma.user.create({ data: { name: 'Demo Admin',   email: 'admin@loop-demo.com',   passwordHash: hash, role: Role.ADMIN,   workspaceId: workspace.id } }),
    prisma.user.create({ data: { name: 'Demo Analyst', email: 'analyst@loop-demo.com', passwordHash: hash, role: Role.ANALYST, workspaceId: workspace.id } }),
    prisma.user.create({ data: { name: 'Demo Viewer',  email: 'viewer@loop-demo.com',  passwordHash: hash, role: Role.VIEWER,  workspaceId: workspace.id } }),
  ])

  console.log(`✓ Users: ${admin.email}, ${analyst.email}, ${viewer.email}`)

  await prisma.theme.createMany({
    data: [
      { name: 'Performance',      color: '#10B981', workspaceId: workspace.id },
      { name: 'Onboarding',       color: '#6366F1', workspaceId: workspace.id },
      { name: 'Billing',          color: '#F59E0B', workspaceId: workspace.id },
      { name: 'Mobile',           color: '#EC4899', workspaceId: workspace.id },
      { name: 'Integrations',     color: '#8B5CF6', workspaceId: workspace.id },
      { name: 'Feature Requests', color: '#3B82F6', workspaceId: workspace.id },
    ],
  })

  console.log('✓ Themes created')

  const statuses = [FeedbackStatus.NEW, FeedbackStatus.NEW, FeedbackStatus.REVIEWED, FeedbackStatus.ACTIONED]

  await prisma.feedback.createMany({
    data: FEEDBACK_RECORDS.map((r, i) => ({
      content:       r.content,
      channel:       r.channel,
      customerLabel: r.customerLabel,
      sentiment:     r.sentiment as Sentiment,
      sentimentScore: r.sentimentScore,
      status:        statuses[i % statuses.length],
      workspaceId:   workspace.id,
      createdAt:     new Date(Date.now() - r.daysAgo * 24 * 60 * 60 * 1000),
    })),
  })

  console.log(`✓ ${FEEDBACK_RECORDS.length} feedback records inserted`)
  console.log('✅ Seed complete!')
  console.log('')
  console.log('Demo credentials (password: demo1234):')
  console.log('  admin@loop-demo.com   [ADMIN]')
  console.log('  analyst@loop-demo.com [ANALYST]')
  console.log('  viewer@loop-demo.com  [VIEWER]')
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
