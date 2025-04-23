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

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = PostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { title, content } = parsed.data;

  const slug = title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

  const post = await prisma.post.create({
    data: {
      title,
      content,
      slug,
      authorId: session.user.id,
    },
  });

  return NextResponse.json(post, { status: 201 });
}

// This function handles fetching all posts
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        categories: true,
        comments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return new NextResponse("Error in fetching data", { status: 500 });
  }
}
