import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { auth } from "@/auth";



// GET all users (admin only)
export async function GET() {
  const session = await auth();

  if (!session || !session.user || !session.user.email || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

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
