import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log("🌱 Starting database seeding...");

    // Get or create tenants first
    let acme = await prisma.tenant.findUnique({ where: { slug: "acme" } });
    if (!acme) {
      console.log("📊 Creating Acme tenant...");
      acme = await prisma.tenant.create({
        data: {
          name: "Acme Corporation",
          slug: "acme",
          subscription: "FREE",
        },
      });
    }

    let globex = await prisma.tenant.findUnique({ where: { slug: "globex" } });
    if (!globex) {
      console.log("📊 Creating Globex tenant...");
      globex = await prisma.tenant.create({
        data: {
          name: "Globex Corporation",
          slug: "globex",
          subscription: "PRO",
        },
      });
    }

    // Check if we have all demo users (should be 4)
    const existingUsers = await prisma.user.findMany();
    if (existingUsers.length >= 4) {
      console.log(`✅ Database already has ${existingUsers.length} users`);
      return NextResponse.json({
        success: true,
        message: "All demo accounts already exist",
        data: {
          tenants: 2,
          users: existingUsers.length,
          accounts: existingUsers.map((u) => ({ email: u.email, role: u.role })),
          loginWith: { email: "admin@acme.test", password: "password" }
        }
      });
    }

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

    // Create users one by one using upsert to avoid conflicts
    const createdUsers = [];
    for (const userData of users) {
      // Use upsert to handle existing users gracefully
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {}, // Don't update existing users
        create: userData,
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
      console.log(`✅ Ensured user exists: ${user.email}`);
    }

    console.log("🎉 Seeding completed successfully!");

    return NextResponse.json({
      success: true,
      message: "Demo accounts created successfully!",
      data: {
        tenants: 2,
        users: createdUsers.length,
        accounts: createdUsers.map(u => ({ email: u.email, role: u.role })),
        loginWith: {
          email: "admin@acme.test",
          password: "password"
        }
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
