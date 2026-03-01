import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role;
  if (role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { role: newRole, password, canUpload, canEdit, canDelete, canManageUsers } = body as {
    role?: "USER" | "ADMIN" | "SUPER_ADMIN";
    password?: string;
    canUpload?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    canManageUsers?: boolean;
  };

  const updateData: {
    role?: "USER" | "ADMIN" | "SUPER_ADMIN";
    passwordHash?: string;
  } = {};
  if (newRole) updateData.role = newRole;
  if (typeof password === "string" && password.length >= 8)
    updateData.passwordHash = await bcrypt.hash(password, 10);

  if (Object.keys(updateData).length > 0) {
    await prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  const permData: { canUpload?: boolean; canEdit?: boolean; canDelete?: boolean; canManageUsers?: boolean } = {};
  if (typeof canUpload === "boolean") permData.canUpload = canUpload;
  if (typeof canEdit === "boolean") permData.canEdit = canEdit;
  if (typeof canDelete === "boolean") permData.canDelete = canDelete;
  if (typeof canManageUsers === "boolean") permData.canManageUsers = canManageUsers;

  if (Object.keys(permData).length > 0) {
    await prisma.adminPermissions.upsert({
      where: { adminId: id },
      create: { adminId: id, ...permData },
      update: permData,
    });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: { adminPermissions: true },
  });
  return NextResponse.json(user);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role;
  if (role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (id === session.user.id)
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
