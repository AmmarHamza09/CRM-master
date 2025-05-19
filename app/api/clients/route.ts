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
    const limit = parseInt(searchParams.get('limit') || '10');

    const clients = await prisma.user.findMany({
      where: {
        role: 'CLIENT',
      },
      select: {
        id: true,
        name: true,
        email: true,
        projects: {
          select: {
            invoices: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
              select: {
                amount: true,
              },
            },
          },
        },
      },
      take: limit,
    });

    const formattedClients = clients.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      recentAmount: client.projects[0]?.invoices[0]?.amount || null,
    }));

    return NextResponse.json(formattedClients);
  } catch (error) {
    console.error("[CLIENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 