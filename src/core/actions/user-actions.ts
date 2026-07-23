"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/core/auth/session";
import { getDataSourceMode } from "@/core/repositories";
import {
  createUserMembershipRow,
  updateUserMembershipRow,
  updateUserMembershipStatus,
  type UserMembershipInput,
} from "@/core/repositories/user-repository";
import { readRequiredEmail, readRequiredText } from "@/core/security/validation";
import type { CoreUser, MembershipStatus } from "@/core/types";

export async function createUserMembershipAction(formData: FormData) {
  await requirePermission("platform.users.create");
  const input = parseUserMembershipForm(formData);

  if (getDataSourceMode() === "mock") {
    redirect("/usuarios?userAction=mock-create");
  }

  const membershipId = await createUserMembershipRow(input);
  revalidatePath("/usuarios");
  redirect(`/usuarios/${membershipId}`);
}

export async function updateUserMembershipAction(membershipId: string, formData: FormData) {
  await requirePermission("platform.users.update");
  const input = parseUserMembershipForm(formData);

  if (getDataSourceMode() === "mock") {
    redirect(`/usuarios/${membershipId}?userAction=mock-update`);
  }

  await updateUserMembershipRow(membershipId, input);
  revalidatePath("/usuarios");
  revalidatePath(`/usuarios/${membershipId}`);
  redirect(`/usuarios/${membershipId}`);
}

export async function activateUserMembershipAction(membershipId: string) {
  await setUserMembershipStatus(membershipId, "active");
}

export async function suspendUserMembershipAction(membershipId: string) {
  await setUserMembershipStatus(membershipId, "suspended");
}

async function setUserMembershipStatus(membershipId: string, status: MembershipStatus) {
  await requirePermission("platform.users.update");

  if (getDataSourceMode() === "mock") {
    redirect(`/usuarios/${membershipId}?userAction=mock-status-${status}`);
  }

  await updateUserMembershipStatus(membershipId, status);
  revalidatePath("/usuarios");
  revalidatePath(`/usuarios/${membershipId}`);
  redirect(`/usuarios/${membershipId}`);
}

function parseUserMembershipForm(formData: FormData): UserMembershipInput {
  const status = String(formData.get("status") ?? "invited") as MembershipStatus;
  const userStatus = String(formData.get("userStatus") ?? "invited") as CoreUser["status"];

  if (!["invited", "active", "suspended", "removed"].includes(status)) {
    throw new Error("Invalid membership status");
  }

  if (!["invited", "active", "suspended"].includes(userStatus)) {
    throw new Error("Invalid user status");
  }

  return {
    name: readRequiredText(formData, "name"),
    email: readRequiredEmail(formData, "email"),
    systemCode: readRequiredText(formData, "systemCode", 80),
    tenantId: readRequiredText(formData, "tenantId", 80),
    roleId: readRequiredText(formData, "roleId", 80),
    status,
    userStatus,
  };
}
