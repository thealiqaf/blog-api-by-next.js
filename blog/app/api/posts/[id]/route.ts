import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

// This function handles editing a single post by ID
export async function PATCH(req: Request, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = context.params;
  const { title, content, slug, categoryIds } = await req.json();

  try {
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        slug,
        categories: {
          set: [],
          connect: categoryIds.map((id: string) => ({ id })),
        },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return new NextResponse("Failed to update post", { status: 500 });
  }
}

// This function handles deleting a post by ID
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
