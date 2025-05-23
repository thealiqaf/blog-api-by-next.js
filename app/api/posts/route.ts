import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/db";
import { z } from "zod";


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
});

// This function handles creating a new post
export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.email || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const user = session?.user;

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, slug, content, categoryIds } = body;

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        authorId: user.id,
        categories: {
          connect: categoryIds.map((id: string) => ({ id })),
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

// This function handles fetching all posts
export async function GET(req: NextRequest) {
  try {
    const categoryId = req.nextUrl.searchParams.get("categoryId");
    const categoryName = req.nextUrl.searchParams.get("categoryName");
    const order = req.nextUrl.searchParams.get("order");

    let whereClause = {};

    if (categoryId) {
      whereClause = { categoryId };
    } else if (categoryName) {
      whereClause = {
        category: {
          name: categoryName,
        },
      };
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        author: {
          select: { id: true, name: true },
        },
        categories: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        createdAt: order === "asc" ? "asc" : "desc",
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
