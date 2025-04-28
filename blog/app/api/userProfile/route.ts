import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/db";
import { authOptions } from "@/app/lib/auth";
import { onlyAdmin } from "@/app/middleware/onlyAdmin";
import { onlyLoggedIn } from "@/app/middleware/onlyLoggedin";

// This function handles PATCH requests to update the user's profile
export async function PATCH(req: NextRequest) {
  const auth: any = await onlyLoggedIn(req);
  if (auth) return auth;

  const { name } = await req.json();

  if (!name) {
    return new NextResponse("No fields to update", { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { email: auth.session.user.email },
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
export async function GET(req: NextRequest) {
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
