import { prisma } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextResponse } from "next/server";

// This function handles delete requests for a specific category by ID
export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = context.params;

  if (!id) {
    return new NextResponse("Category ID is required", { status: 400 });
  }

  try {
    const existing = await prisma.category.findUnique({ where: { id } });

    if (!existing) {
      return new NextResponse("Category not found", { status: 404 });
    }

    await prisma.category.delete({ where: { id } });

    return new NextResponse("Category deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting category:", error);
    return new NextResponse("Failed to delete category", { status: 500 });
  }
}
