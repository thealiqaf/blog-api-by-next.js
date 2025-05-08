import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { auth } from "@/auth";


// This function handles PATCH requests to update the user's profile
export async function PATCH(req: NextRequest) {
  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { name } = await req.json();

  if (!name) {
    return new NextResponse("No fields to update", { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name || undefined,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}

// This function handles GET requests to fetch the user's profile
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
