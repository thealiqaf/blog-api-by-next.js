import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { z } from "zod";

const PostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
});

// This function handles creating a new post
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { title, content, slug, categoryIds } = await req.json();

  if (!title || !content || !slug || !Array.isArray(categoryIds)) {
    return new NextResponse("Invalid post data", { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    const post = await prisma.post.create({
      data: {
        title,
        content,
        slug,
        authorId: user!.id,
        categories: {
          connect: categoryIds.map((id: string) => ({ id })),
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    return new NextResponse("Post creation failed", { status: 500 });
  }
}

// This function handles fetching all posts
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { id: true, name: true } },
        categories: true,
        comments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return new NextResponse("Failed to fetch posts", { status: 500 });
  }
}
