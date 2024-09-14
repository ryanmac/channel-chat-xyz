// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import UserController from "@/controllers/UserController";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Extract query parameters
    const { search, sort, direction: directionParam, page } = Object.fromEntries(
      req.nextUrl.searchParams.entries()
    );

    // Validate direction parameter
    let direction: 'asc' | 'desc' | undefined;
    if (directionParam === 'asc' || directionParam === 'desc') {
      direction = directionParam;
    } else {
      direction = undefined;
    }

    const userController = new UserController();
    const data = await userController.getAllUsers({
      search,
      sort,
      direction,
      page: page ? parseInt(page, 10) : 1,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}