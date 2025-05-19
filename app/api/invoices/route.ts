import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import prisma from "@/lib/prisma";

// GET /api/invoices
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        project: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// POST /api/invoices
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const body = await req.json();
    const { projectId, amount, status, dueDate } = body;

    // Validate required fields
    if (!projectId || !amount || !dueDate) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields" }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Generate invoice number
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const invoiceNumber = `INV-${timestamp}-${randomNum}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        amount: parseFloat(amount),
        status,
        dueDate: new Date(dueDate),
        projectId,
        userId: session.user.id,
      },
      include: {
        project: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error creating invoice:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 