import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createStaffSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]).optional(),
  canUpload: z.boolean().optional(),
  canEdit: z.boolean().optional(),
  canDelete: z.boolean().optional(),
  canManageUsers: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role;
  if (role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Only Super Admin can list users" }, { status: 403 });

  const users = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "SUPER_ADMIN"] }
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      level: true,
      totalPagesRead: true,
      createdAt: true,
      adminPermissions: true,
    },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role;
  if (role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Only Super Admin can create staff" }, { status: 403 });

  const parsed = createStaffSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { email, password, role: newRole, canUpload, canEdit, canDelete, canManageUsers } = parsed.data;
  const emailLower = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: emailLower } });
  if (!existing) return NextResponse.json({ error: "User account not found. Please ask them to sign in first to create an account." }, { status: 404 });
  
  if (existing.role === "SUPER_ADMIN" || existing.role === "ADMIN") {
    return NextResponse.json({ error: "User is already a staff member." }, { status: 400 });
  }

  const updateData: any = {
    role: newRole ?? "ADMIN",
  };
  
  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({
    where: { id: existing.id },
    data: {
      ...updateData,
      adminPermissions: {
        upsert: {
          create: {
            canUpload: canUpload ?? true,
            canEdit: canEdit ?? true,
            canDelete: canDelete ?? false,
            canManageUsers: canManageUsers ?? false,
          },
          update: {
            canUpload: canUpload ?? true,
            canEdit: canEdit ?? true,
            canDelete: canDelete ?? false,
            canManageUsers: canManageUsers ?? false,
          }
        },
      },
    },
    include: { adminPermissions: true },
  });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    adminPermissions: user.adminPermissions,
  });
}
