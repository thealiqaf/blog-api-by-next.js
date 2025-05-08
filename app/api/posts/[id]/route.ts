import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { auth } from "@/auth";

// This function handles editing a single post by ID
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session || !session.user || !session.user.email || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, slug, content, categoryIds } = body;

    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        content,
        categories: {
          set: categoryIds.map((id: string) => ({ id })),
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// This function handles deleting a post by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session || !session.user || !session.user.email || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = params;

  const post = await prisma.post.findUnique({ where: { id } });

  if (!post || post.authorId !== session.user.id) {
    return NextResponse.json(
      { error: "Not found or forbidden" },
      { status: 404 }
    );
  }

  await prisma.post.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
