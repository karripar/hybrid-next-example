import { getUserByUsername } from "@/models/userModel";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import CustomError from "../classes/CustomError";
import bcrypt from "bcryptjs";
import { TokenContent } from "hybrid-types/DBTypes";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

export const login = async (formData: FormData) => {
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
  const session = jwt.sign(tokenContent, key, { expiresIn: "7d" });

  // Save the session in a cookie
  const cookieStore = await cookies();
  cookieStore.set("session", session, { expires, httpOnly: true });
};

export const logout = async () => {
  const cookieStore = await cookies();
  cookieStore.set("session", "", { expires: new Date(0) });
};

export const getSession = async () => {
  if (!process.env.JWT_SECRET) {
    throw new CustomError("Missing JWT_SECRET", 500);
  }
  const key = process.env.JWT_SECRET as string;

  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  return jwt.verify(session, key) as TokenContent;
};

export const updateSession = (request: NextRequest) => {
  if (!process.env.JWT_SECRET) {
    throw new CustomError("Missing JWT_SECRET", 500);
  }
  const key = process.env.JWT_SECRET as string;

  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const tokenContent = jwt.verify(session, key) as TokenContent;
  const expires = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7 days (in ms)
  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: jwt.sign(tokenContent, key, { expiresIn: "7d" }),
    httpOnly: true,
    expires: expires,
  });
  return res;
};

export const requireAuth = async () => {
  const session = await getSession();
  if (!session?.user_id) {
    redirect("/");
  }
};
