import { fetchData } from "@/lib/functions";
import { postMedia } from "@/models/mediaModel";
import { MediaItem, UploadResponse } from "hybrid-types";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/authActions";

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title || !description) {
      return new NextResponse(
        JSON.stringify({ error: "Title and description are required." }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    // Get the token from the cookie
    const token = request.cookies.get("session")?.value as string;
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }

    // Send the form data to the upload server
    const options = {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    };

    const uploadResult = await fetchData<UploadResponse>(
      `${process.env.UPLOAD_SERVER}/upload`,
      options
    );

    // Validate upload response
    if (!uploadResult || !uploadResult.data) {
      return new NextResponse(
        JSON.stringify({ error: "Error uploading media." }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    const { filename, filesize, media_type } = uploadResult.data;

    // Get user_id from the session
    const session = await getSession();
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }

    const user_id = session.user_id;

    // Create media item object
    const mediaItem: Omit<
      MediaItem,
      "media_id" | "created_at" | "thumbnail" | "screenshots"
    > = {
      title,
      description,
      filename,
      filesize,
      media_type,
      user_id,
    };

    // Save media to the database
    const postResult = await postMedia(mediaItem);
    if (!postResult) {
      return new NextResponse(
        JSON.stringify({ error: "Error adding media to database." }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    // Return success response
    return new NextResponse(
      JSON.stringify({
        message: "Media added to database",
        data: postResult,
      }),
      { headers: { "content-type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new NextResponse(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
