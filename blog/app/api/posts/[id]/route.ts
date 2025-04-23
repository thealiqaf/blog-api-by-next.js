import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

// This function handles editing a single post by ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, content } = body;

  const post = await prisma.post.findUnique({ where: { id } });

  if (!post || post.authorId !== session.user.id) {
    return NextResponse.json(
      { error: "Not found or forbidden" },
      { status: 404 }
    );
  }

  const updated = await prisma.post.update({
    where: { id },
    data: {
      title,
      content,
    },
  });

  return NextResponse.json(updated);
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
