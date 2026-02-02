import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          userId: session.user.id,
          emailNotifications: true,
          productUpdates: true,
          offersPromotions: true,
          newsTips: true,
        },
      });
    }

    return NextResponse.json({
      emailNotifications: settings.emailNotifications,
      productUpdates: settings.productUpdates,
      offersPromotions: settings.offersPromotions,
      newsTips: settings.newsTips,
    });
  } catch (error) {
    console.error("GET notification settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      emailNotifications,
      productUpdates,
      offersPromotions,
      newsTips,
    } = body;

    const data = {
      emailNotifications: emailNotifications ?? true,
      productUpdates: productUpdates ?? true,
      offersPromotions: offersPromotions ?? true,
      newsTips: newsTips ?? true,
    };

    const settings = await prisma.notificationSettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...data,
      },
      update: data,
    });

    return NextResponse.json({
      emailNotifications: settings.emailNotifications,
      productUpdates: settings.productUpdates,
      offersPromotions: settings.offersPromotions,
      newsTips: settings.newsTips,
    });
  } catch (error) {
    console.error("PUT notification settings error:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
