import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";
import { ProjectType, ProjectStatus, ProjectPriority, Prisma } from "@prisma/client";

// Helper function to generate unique title
async function generateUniqueTitle(baseTitle: string, userId: string): Promise<string> {
  let title = baseTitle;
  let counter = 1;

  while (true) {
    const existingProject = await prisma.project.findFirst({
      where: {
        title,
        userId,
      },
    });

    if (!existingProject) {
      return title;
    }

    title = `${baseTitle} (${counter})`;
    counter++;
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        endDate: true,
        status: true,
        priority: true,
        location: true,
        type: true,
        company: true,
        description: true,
        client: true,
        budget: true,
      },
      orderBy: {
        endDate: 'asc',
      },
      take: limit,
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("[PROJECTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    console.log("POST /api/projects - Starting request");
    const session = await getServerSession(authOptions);
    console.log("POST /api/projects - Session:", session);
    
    if (!session?.user?.email) {
      console.log("POST /api/projects - No session or email found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.log("POST /api/projects - User not found for email:", session.user.email);
      return new NextResponse("User not found", { status: 404 });
    }
    const body = await req.json();
    console.log("POST /api/projects - Request body:", body);

    const { title, description, company, location, type, status, priority, budget, client, endDate, startDate } = body;

    if (!title || !company) {
      console.log("POST /api/projects - Missing required fields");
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Generate a unique title
    const uniqueTitle = await generateUniqueTitle(title, user.id);
    console.log("POST /api/projects - Generated unique title:", uniqueTitle);

    // Create project data
    const projectData = {
      title: uniqueTitle,
      description: description || "",
      company,
      location: location || "",
      type: (type || "FULL_TIME") as ProjectType,
      status: (status || "OPEN") as ProjectStatus,
      priority: (priority || "MEDIUM") as ProjectPriority,
      budget: budget ? parseFloat(budget) : null,
      client: client || "",
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      userId: user.id,
    };

    console.log("POST /api/projects - Creating project with data:", projectData);

    const project = await prisma.project.create({
      data: projectData,
      include: {
        modules: {
          select: {
            id: true,
          },
        },
        members: {
          select: {
            id: true,
          },
        },
        invoices: {
          select: {
            id: true,
          },
        },
      },
    });

    console.log("POST /api/projects - Project created successfully:", project);
    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECTS_POST] Error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new NextResponse("A project with this title already exists", { status: 409 });
    }
    return new NextResponse("Internal error", { status: 500,  }, );
  }
} 