import { requireAuth } from './../../../lib/authActions';
import { postTag } from '@/models/tagModel';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    requireAuth();

    try {
        const jsonData: {tag_name: string, media_id: string} = await request.json();

        if (!jsonData.tag_name || !jsonData.media_id) {
            return new NextResponse(
                JSON.stringify({ error: 'Tag name and media id are required.' }),
                { status: 400, headers: { 'content-type': 'application/json' } }
            );
        }

        const postResult = await postTag(jsonData.tag_name, Number(jsonData.media_id));

        if (!postResult) {
            return new NextResponse(
                JSON.stringify({ error: 'Error posting tag.' }),
                { status: 500, headers: { 'content-type': 'application/json' } }
            );
        }

        return new NextResponse(
            JSON.stringify({ message: postResult.message }),
            { status: 200, headers: { 'content-type': 'application/json' } }
        );

    } catch (error) {
        console.log((error as Error).message);
        return new NextResponse(
            JSON.stringify({ error: (error as Error).message }),
            { status: 500, headers: { 'content-type': 'application/json' } }
        );
    }
}