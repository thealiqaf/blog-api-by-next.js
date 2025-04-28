import { prisma } from "@/app/lib/db";
import { hashPassword } from "@/app/lib/password";
import { NextResponse } from "next/server";

// POST /api/auth/signup
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 409 });
    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword: hashed,
        role: "USER",
      },
    });

    return NextResponse.json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Signup error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
