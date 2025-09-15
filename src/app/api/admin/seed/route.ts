import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log("🌱 Starting database seeding...");

    // Check if already has users
    const existingUsers = await prisma.user.findMany();
    if (existingUsers.length > 0) {
      console.log(`✅ Database already has ${existingUsers.length} users`);
      return NextResponse.json({
        message: "Database already has users",
        users: existingUsers.length,
        existing: existingUsers.map((u) => ({ email: u.email, role: u.role })),
      });
    }

    console.log("📊 Creating tenants...");

    // Create tenants
    const acme = await prisma.tenant.create({
      data: {
        name: "Acme Corporation",
        slug: "acme",
        subscription: "FREE",
      },
    });

    const globex = await prisma.tenant.create({
      data: {
        name: "Globex Corporation",
        slug: "globex",
        subscription: "PRO",
      },
    });

    console.log("👥 Creating users...");

    // Create demo accounts
    const hashedPassword = await bcrypt.hash("password", 12);

    const users = [
      {
        email: "admin@acme.test",
        password: hashedPassword,
        role: "ADMIN" as const,
        tenantId: acme.id,
      },
      {
        email: "user@acme.test",
        password: hashedPassword,
        role: "MEMBER" as const,
        tenantId: acme.id,
      },
      {
        email: "admin@globex.test",
        password: hashedPassword,
        role: "ADMIN" as const,
        tenantId: globex.id,
      },
      {
        email: "user@globex.test",
        password: hashedPassword,
        role: "MEMBER" as const,
        tenantId: globex.id,
      },
    ];

    // Create users one by one to handle any errors better
    const createdUsers = [];
    for (const userData of users) {
      const user = await prisma.user.create({
        data: userData,
        select: {
          id: true,
          email: true,
          role: true,
          tenant: {
            select: {
              name: true,
              slug: true,
              subscription: true,
            },
          },
        },
      });
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.email}`);
    }

    console.log("🎉 Seeding completed successfully!");

    return NextResponse.json({
      success: true,
      message: "Demo accounts created successfully!",
      data: {
        tenants: 2,
        users: createdUsers.length,
        accounts: createdUsers,
      },
    });
  } catch (error) {
    console.error("❌ Seeding error:", error);

    return NextResponse.json(
      {
        error: "Failed to create accounts",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
