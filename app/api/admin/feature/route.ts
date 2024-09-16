// app/api/admin/feature/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import ChannelController from "@/controllers/ChannelController";

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
    const { search, sort, direction: directionParam, page, pageSize: pageSizeParam } = Object.fromEntries(
      req.nextUrl.searchParams.entries()
    );

    // Validate direction parameter
    let direction: 'asc' | 'desc' | undefined;
    if (directionParam === 'asc' || directionParam === 'desc') {
      direction = directionParam;
    } else {
      direction = undefined;
    }

    // Set default page size if not provided
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;

    const channelController = new ChannelController();
    const data = await channelController.getAllChannels({
      search,
      sort,
      direction,
      page: page ? parseInt(page, 10) : 1,
      pageSize,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching channels:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}