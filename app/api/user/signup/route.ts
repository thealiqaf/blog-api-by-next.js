import { prisma } from "@/app/lib/db";
import { hashPassword } from "@/app/lib/password";
import { NextResponse } from "next/server";
import { signUpSchema } from "@/app/lib/zod";
import { ZodError } from "zod";


// POST /api/auth/signup
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = signUpSchema.parse(body);
    const { email, password, name } = parsed;

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
    // ✅ Step 4: Handle validation error
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((e) => e.message).join(" | ");
      return new NextResponse(`Validation Error: ${errorMessages}`, { status: 400 });
    }

    console.error("Signup error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}