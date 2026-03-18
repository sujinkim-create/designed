
export async function POST(req: Request) {
    try {
        const { topic, contentType = 'article', level } = await req.json();

        if (!topic) {
            return NextResponse.json(
                { error: 'Topic is required' },
                { status: 400 }
            );
        }

        // Type cast contentType if necessary or validate it
        const validContentTypes: ContentType[] = ['article', 'speech', 'conversation', 'fairytale'];
        const safeContentType = validContentTypes.includes(contentType) ? contentType : 'article';

        const articles = await generateArticles(topic, safeContentType, level);
        return NextResponse.json(articles);

    } catch (error: any) {
        console.error('Error generating articles:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate articles' },
            { status: 500 }
        );
    }
import { ContentType } from '@/types';

export const dynamic = 'force-dynamic';
