import {  NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const [totalPosts, totalUsers, totalComments] = await Promise.all([
      prisma.post.count(),
      prisma.user.count(),
      prisma.comment.count(),
    ]);

    const [postsToday, usersToday, commentsToday] = await Promise.all([
      prisma.post.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.comment.count({ where: { createdAt: { gte: today } } }),
    ]);

    return NextResponse.json({
      totalPosts,
      totalUsers,
      totalComments,
      postsToday,
      usersToday,
      commentsToday,
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return new NextResponse("Server Error", { status: 500 });
  }
}
