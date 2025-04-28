import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/db";
import { authOptions } from "@/app/lib/auth";
import { onlyAdmin } from "@/app/middleware/onlyAdmin";

// GET all users (admin only)
export async function GET(req: NextRequest) {
  const auth: any = await onlyAdmin(req);
  if (auth) return auth;

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
