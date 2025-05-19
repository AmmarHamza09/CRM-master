import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/payment-methods
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        isDefault: 'desc',
      },
    });

    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/payment-methods
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { type, last4, expiryMonth, expiryYear, isDefault } = body;

    // Validate required fields
    if (!type || !last4 || !expiryMonth || !expiryYear) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // If this is set as default, unset any existing default
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: session.user.id,
        type,
        last4,
        expiryMonth,
        expiryYear,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(paymentMethod);
  } catch (error) {
    console.error("Error creating payment method:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 