import "dotenv/config";

import {
  PrismaClient,
  Role,
  Sentiment,
  FeedbackStatus,
} from "@prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting database seed...");

  // ─────────────────────────────────────────
  // 1. Demo Workspace
  // ─────────────────────────────────────────

  const workspace = await prisma.workspace.create({
    data: {
      name: "LOOP Demo Workspace",
    },
  });

  console.log(`Created workspace: ${workspace.name}`);

  // ─────────────────────────────────────────
  // 2. Demo Users
  // ─────────────────────────────────────────

  // TODO:
  // Replace these placeholder hashes with real bcrypt hashes
  // when authentication is implemented.

  const admin = await prisma.user.create({
    data: {
      name: "Demo Admin",
      email: "admin@loop-demo.com",
      passwordHash: "TEMP_HASH_ADMIN",
      role: Role.ADMIN,
      workspaceId: workspace.id,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: "Demo Analyst",
      email: "analyst@loop-demo.com",
      passwordHash: "TEMP_HASH_ANALYST",
      role: Role.ANALYST,
      workspaceId: workspace.id,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: "Demo Viewer",
      email: "viewer@loop-demo.com",
      passwordHash: "TEMP_HASH_VIEWER",
      role: Role.VIEWER,
      workspaceId: workspace.id,
    },
  });

  console.log("Created demo users:");
  console.log(`- ${admin.email} [ADMIN]`);
  console.log(`- ${analyst.email} [ANALYST]`);
  console.log(`- ${viewer.email} [VIEWER]`);

  // ─────────────────────────────────────────
  // 3. Themes
  // ─────────────────────────────────────────

  const themes = await Promise.all([
    prisma.theme.create({
      data: {
        name: "Onboarding",
        description: "Feedback related to signup, setup and getting started.",
        color: "#6366F1",
        workspaceId: workspace.id,
      },
    }),

    prisma.theme.create({
      data: {
        name: "Performance",
        description: "Feedback about speed, loading and responsiveness.",
        color: "#10B981",
        workspaceId: workspace.id,
      },
    }),

    prisma.theme.create({
      data: {
        name: "Billing",
        description: "Invoices, payments and billing-related feedback.",
        color: "#F59E0B",
        workspaceId: workspace.id,
      },
    }),

    prisma.theme.create({
      data: {
        name: "Mobile Experience",
        description: "Feedback about the mobile web/app experience.",
        color: "#EC4899",
        workspaceId: workspace.id,
      },
    }),

    prisma.theme.create({
      data: {
        name: "Authentication",
        description: "Login, SSO, password and account-access feedback.",
        color: "#8B5CF6",
        workspaceId: workspace.id,
      },
    }),
  ]);

  console.log(`Created ${themes.length} themes`);

  // ─────────────────────────────────────────
  // 4. Feedback
  // ─────────────────────────────────────────

  const feedbackData = [
    {
      content:
        "Onboarding took forever — I couldn't figure out how to invite my team.",
      channel: "Support ticket",
      customerLabel: "Customer A",
      sentiment: Sentiment.NEG,
      sentimentScore: -0.85,
    },

    {
      content:
        "The new dashboard is gorgeous and finally fast. Huge improvement.",
      channel: "App store review",
      customerLabel: "Customer B",
      sentiment: Sentiment.POS,
      sentimentScore: 0.9,
    },

    {
      content:
        "It does the job, but the mobile experience needs work.",
      channel: "NPS survey",
      customerLabel: "Customer C",
      sentiment: Sentiment.NEU,
      sentimentScore: 0.05,
    },

    {
      content:
        "Prospect wants SSO before they'll sign — third time this month.",
      channel: "Sales call note",
      customerLabel: "Prospect D",
      sentiment: Sentiment.NEG,
      sentimentScore: -0.7,
    },

    {
      content:
        "Love the new export feature, saved me an hour today.",
      channel: "Community post",
      customerLabel: "Customer E",
      sentiment: Sentiment.POS,
      sentimentScore: 0.85,
    },

    {
      content:
        "Billing page keeps timing out when I try to download an invoice.",
      channel: "Support ticket",
      customerLabel: "Customer F",
      sentiment: Sentiment.NEG,
      sentimentScore: -0.8,
    },

    // Add more realistic feedback here.
    // The final seed must contain at least 120 items.
  ];

  // ─────────────────────────────────────────
  // 5. Insert Feedback
  // ─────────────────────────────────────────

  for (const item of feedbackData) {
    await prisma.feedback.create({
      data: {
        content: item.content,
        channel: item.channel,
        customerLabel: item.customerLabel,

        sentiment: item.sentiment,
        sentimentScore: item.sentimentScore,

        status: FeedbackStatus.NEW,

        workspaceId: workspace.id,
      },
    });
  }

  console.log(`Created ${feedbackData.length} feedback items`);

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });