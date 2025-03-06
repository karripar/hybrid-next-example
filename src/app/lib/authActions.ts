import { getUserByUsername } from "@/models/userModel";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import CustomError from "../classes/CustomError";
import bcrypt from "bcryptjs";
import { TokenContent } from "hybrid-types/DBTypes";
import jwt from "jsonwebtoken";

export async function login(formData: FormData) {
  // Verify credentials && get the user
  if (!process.env.JWT_SECRET) {
    throw new CustomError("Missing JWT_SECRET", 500);
  }
  const key = process.env.JWT_SECRET as string;

  const userLogin = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  if (!userLogin.username || !userLogin.password) {
    throw new CustomError("Missing username or password", 400);
  }

  const user = await getUserByUsername(userLogin.username);

  if (!user || !bcrypt.compareSync(userLogin.password, user.password)) {
    throw new CustomError("Incorrect username/password", 403);
  }

  const tokenContent: TokenContent = {
    user_id: user.user_id,
    level_name: user.level_name,
  };

  // Create the session
  const expires = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7 days (in ms)
  const session = jwt.sign(tokenContent, key, {expiresIn: "7d"})

  // Save the session in a cookie
  const cookieStore = await cookies();
  cookieStore.set("session", session, { expires, httpOnly: true });
}

export async function logout() {
  // Destroy the session
  cookies().set("session", "", { expires: new Date(0) });
}

export async function getSession() {
  const session = cookies().get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 10 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}
