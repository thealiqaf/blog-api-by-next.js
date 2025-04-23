import { prisma } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// This function handles POST requests to create categories
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { name } = await req.json();

  if (!name || name.trim() === "") {
    return new NextResponse("Category name required", { status: 400 });
  }

  try {
    const category = await prisma.category.create({
      data: { name },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    return new NextResponse("Category creation failed", { status: 500 });
  }
}
