import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding production database...");

  // Clear existing data
  await prisma.note.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // Create tenants
  const acmeTenant = await prisma.tenant.create({
    data: {
      slug: "acme",
      name: "Acme Corporation",
      subscription: "FREE",
    },
  });

  const globexTenant = await prisma.tenant.create({
    data: {
      slug: "globex",
      name: "Globex Corporation",
      subscription: "PRO",
    },
  });

  // Hash password
  const hashedPassword = await bcrypt.hash("demo123", 10);

  // Create users for Acme Corp
  const acmeAdmin = await prisma.user.create({
    data: {
      email: "admin@acme.demo",
      password: hashedPassword,
      role: "ADMIN",
      tenantId: acmeTenant.id,
    },
  });

  const acmeUser = await prisma.user.create({
    data: {
      email: "user@acme.demo",
      password: hashedPassword,
      role: "MEMBER",
      tenantId: acmeTenant.id,
    },
  });

  // Create users for Globex Corp
  const globexAdmin = await prisma.user.create({
    data: {
      email: "admin@globex.demo",
      password: hashedPassword,
      role: "ADMIN",
      tenantId: globexTenant.id,
    },
  });

  const globexUser = await prisma.user.create({
    data: {
      email: "user@globex.demo",
      password: hashedPassword,
      role: "MEMBER",
      tenantId: globexTenant.id,
    },
  });

  // Create sample notes for Acme Corp
  await prisma.note.create({
    data: {
      title: "Welcome to Acme Corporation",
      content:
        "This is your first note in the SaaS Notes application. You can create, edit, and delete notes. As a FREE plan user, you can create up to 3 notes.",
      userId: acmeAdmin.id,
      tenantId: acmeTenant.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "Project Planning Meeting",
      content:
        "Discussed the Q4 roadmap and resource allocation. Key decisions: 1) Focus on mobile app development, 2) Hire 2 new developers, 3) Launch beta by December.",
      userId: acmeUser.id,
      tenantId: acmeTenant.id,
    },
  });

  // Create sample notes for Globex Corp (PRO plan - more notes)
  await prisma.note.create({
    data: {
      title: "Globex PRO Features Demo",
      content:
        "Welcome to Globex Corporation! As a PRO plan subscriber, you have unlimited notes and advanced features. This demonstrates our multi-tenant SaaS architecture.",
      userId: globexAdmin.id,
      tenantId: globexTenant.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "Technical Architecture Overview",
      content:
        "Our SaaS application uses Next.js 14, PostgreSQL, Prisma ORM, and JWT authentication. The multi-tenant architecture ensures complete data isolation between organizations.",
      userId: globexAdmin.id,
      tenantId: globexTenant.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "Business Model Analysis",
      content:
        "Freemium model with FREE (3 notes) and PRO (unlimited) tiers. Role-based access control with Admin and Member permissions. Subscription management with upgrade functionality.",
      userId: globexUser.id,
      tenantId: globexTenant.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "Security Implementation",
      content:
        "JWT-based authentication, bcrypt password hashing, input validation, CORS protection, and secure API endpoints. All industry best practices implemented.",
      userId: globexUser.id,
      tenantId: globexTenant.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "UI/UX Design Features",
      content:
        "Modern dark theme with glass morphism effects, smooth animations, responsive design, and professional visual hierarchy. Built with Tailwind CSS and custom components.",
      userId: globexAdmin.id,
      tenantId: globexTenant.id,
    },
  });

  console.log("✅ Production database seeded successfully");
  console.log("");
  console.log("📧 Demo accounts created:");
  console.log("   Acme Corp Admin: admin@acme.demo");
  console.log("   Acme Corp User: user@acme.demo");
  console.log("   Globex Corp Admin: admin@globex.demo");
  console.log("   Globex Corp User: user@globex.demo");
  console.log("🔑 All passwords: demo123");
  console.log("");
  console.log("🏢 Organizations:");
  console.log("   Acme Corporation (FREE plan) - 2 notes");
  console.log("   Globex Corporation (PRO plan) - 5 notes");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
