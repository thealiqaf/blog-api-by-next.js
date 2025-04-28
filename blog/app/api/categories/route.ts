import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { onlyAdmin } from "@/app/middleware/onlyAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, parentId } = body;

    const auth = await onlyAdmin(req);
    if (auth) return auth;

    const category = await prisma.category.create({
      data: {
        name,
        parent: parentId ? { connect: { id: parentId } } : undefined,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
