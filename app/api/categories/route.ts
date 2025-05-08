import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, parentId } = body;

    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        parent: parentId ? { connect: { id: parentId } } : undefined,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
