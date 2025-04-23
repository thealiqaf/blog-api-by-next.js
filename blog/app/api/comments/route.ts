import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

// This function handles POST requests to create a new comment
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { postId, content } = await req.json();

  if (!postId || !content || content.trim() === "") {
    return new NextResponse("Invalid data", { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: user.id,
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}

// This function handles GET requests to fetch comments for a specific post
export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get("postId");

  if (!postId) {
    return new NextResponse("Missing postId", { status: 400 });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: { name: true, id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
