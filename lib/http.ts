import "server-only";
import { NextResponse } from "next/server";
import { Types } from "mongoose";

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ message, ...extra }, { status });
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function isObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id) && new Types.ObjectId(id).toString() === id;
}

export function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}
