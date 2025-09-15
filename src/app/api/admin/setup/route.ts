import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log("🚀 Starting database setup...");
    
    // Test database connection
    await prisma.$executeRaw`SELECT 1`;
    console.log("✅ Database connection successful");
    
    // Try to create tables using Prisma's push command equivalent
    try {
      // Force create all tables
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS tenants (
          id TEXT PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          subscription TEXT NOT NULL DEFAULT 'FREE',
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'MEMBER',
          "tenantId" TEXT NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("tenantId") REFERENCES tenants(id)
        )
      `;
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS notes (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "tenantId" TEXT NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("userId") REFERENCES users(id),
          FOREIGN KEY ("tenantId") REFERENCES tenants(id)
        )
      `;
      
      console.log("✅ Tables created successfully");
      
    } catch (tableError) {
      console.log("Tables might already exist, continuing...");
    }
    
    // Check if data already exists
    const existingUsers = await prisma.user.findMany();
    if (existingUsers.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Database already setup",
        users: existingUsers.length
      });
    }
    
    // Create demo data
    console.log("🌱 Creating demo accounts...");
    
    const acme = await prisma.tenant.create({
      data: { 
        id: "acme-123",
        name: "Acme Corporation", 
        slug: "acme", 
        subscription: "FREE" 
      }
    });
    
    const globex = await prisma.tenant.create({
      data: { 
        id: "globex-456",
        name: "Globex Corporation", 
        slug: "globex", 
        subscription: "PRO" 
      }
    });
    
    const hashedPassword = await bcrypt.hash("password", 12);
    
    await prisma.user.create({
      data: { 
        id: "admin-acme",
        email: "admin@acme.test", 
        password: hashedPassword, 
        role: "ADMIN", 
        tenantId: acme.id 
      }
    });
    
    await prisma.user.create({
      data: { 
        id: "user-acme",
        email: "user@acme.test", 
        password: hashedPassword, 
        role: "MEMBER", 
        tenantId: acme.id 
      }
    });
    
    await prisma.user.create({
      data: { 
        id: "admin-globex",
        email: "admin@globex.test", 
        password: hashedPassword, 
        role: "ADMIN", 
        tenantId: globex.id 
      }
    });
    
    await prisma.user.create({
      data: { 
        id: "user-globex",
        email: "user@globex.test", 
        password: hashedPassword, 
        role: "MEMBER", 
        tenantId: globex.id 
      }
    });
    
    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully!",
      data: {
        tenants: 2,
        users: 4,
        loginWith: {
          email: "admin@acme.test",
          password: "password"
        }
      }
    });
    
  } catch (error) {
    console.error("❌ Setup error:", error);
    
    return NextResponse.json(
      { 
        error: "Database setup failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}