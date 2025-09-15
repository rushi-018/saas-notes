import { prisma } from "../src/lib/prisma";

async function testDatabase() {
  try {
    console.log("🔍 Testing database connection...");

    // Test basic connection
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Count tenants
    const tenantCount = await prisma.tenant.count();
    console.log(`📊 Tenants in database: ${tenantCount}`);

    // Count users
    const userCount = await prisma.user.count();
    console.log(`👤 Users in database: ${userCount}`);

    // List all tenants with their users
    const tenants = await prisma.tenant.findMany({
      include: {
        users: {
          select: {
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            notes: true,
          },
        },
      },
    });

    console.log("\n📋 Tenant Details:");
    tenants.forEach((tenant) => {
      console.log(`\n🏢 ${tenant.name} (${tenant.slug})`);
      console.log(`   Subscription: ${tenant.subscription}`);
      console.log(`   Notes: ${tenant._count.notes}`);
      console.log(`   Users:`);
      tenant.users.forEach((user) => {
        console.log(`     - ${user.email} (${user.role})`);
      });
    });

    console.log("\n✅ Database test completed successfully!");
  } catch (error) {
    console.error("❌ Database test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
