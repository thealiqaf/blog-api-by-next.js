import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/db";
import { authOptions } from "@/app/lib/auth";

interface Params {
  params: {
    userId: string;
  };
}

// PATCH - Update user (change role)
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { userId } = params;
  const { role } = await req.json();

  if (!userId || !role || (role !== "ADMIN" && role !== "USER")) {
    return new NextResponse("Invalid data", { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}

// DELETE - Delete a user
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { userId } = params;

  if (!userId) {
    return new NextResponse("Missing userId", { status: 400 });
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
