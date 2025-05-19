import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    const meetings = await prisma.meeting.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(), // Only future meetings
        },
      },
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
      take: limit,
    });

    const formattedMeetings = meetings.map(meeting => ({
      id: meeting.id,
      title: meeting.title,
      date: meeting.date,
      clientName: meeting.client.name,
    }));

    return NextResponse.json(formattedMeetings);
  } catch (error) {
    console.error("[MEETINGS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 