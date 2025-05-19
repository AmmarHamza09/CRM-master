import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: {
        id: params.id,
      },
      include: {
        project: true,
        user: true,
      },
    });

    if (!invoice) {
      return new NextResponse("Invoice not found", { status: 404 });
    }

    // Create PDF
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    // Collect PDF chunks
    doc.on('data', (chunk) => chunks.push(chunk));
    
    // Add content to PDF
    doc.fontSize(25).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);
    doc.moveDown();
    doc.text(`Project: ${invoice.project.title}`);
    doc.text(`Amount: $${invoice.amount.toFixed(2)}`);
    doc.text(`Status: ${invoice.status}`);
    doc.moveDown();
    doc.text(`Client: ${invoice.user.name}`);
    doc.text(`Email: ${invoice.user.email}`);

    // End the document
    doc.end();

    // Wait for all chunks to be collected
    await new Promise<void>((resolve) => {
      doc.on('end', () => {
        resolve();
      });
    });

    // Combine chunks into a single buffer
    const pdfBuffer = Buffer.concat(chunks);

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 