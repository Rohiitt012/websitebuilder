import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const emailTrimmed = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: emailTrimmed },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = `c${randomBytes(11).toString("hex")}`;

    await prisma.$executeRaw`
      INSERT INTO users (id, name, email, password)
      VALUES (${userId}, ${name?.trim() || null}, ${emailTrimmed}, ${hashedPassword})
    `;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return NextResponse.json({
      message: "User created successfully",
      user: { id: user?.id, email: user?.email, name: user?.name },
    });
  } catch (error) {
    console.error("Signup error:", error);
    const message =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
