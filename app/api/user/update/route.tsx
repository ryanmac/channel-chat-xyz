// app/api/user/update/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth"
import UserController from "@/controllers/UserController";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { username, name, image } = await req.json();
    const userController = new UserController();
    
    const updatedUser = await userController.updateUser(session.user.id, { username, name, image });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}