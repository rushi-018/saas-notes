import { NextResponse } from "next/server";
import { execSync } from "child_process";

export async function GET() {
  try {
    console.log("🔧 Running database migration...");
    
    // Run Prisma migration
    const output = execSync("npx prisma migrate deploy", { 
      encoding: "utf-8",
      cwd: process.cwd()
    });
    
    console.log("Migration output:", output);
    
    return NextResponse.json({
      success: true,
      message: "Database migration completed successfully!",
      output: output
    });
    
  } catch (error) {
    console.error("❌ Migration error:", error);
    
    return NextResponse.json(
      { 
        error: "Migration failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}