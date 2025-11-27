'use server';

import { Music } from 'lucide-react';
import { MoodGenreForm } from '@/components/tune-flow/mood-genre-form';
import MusicPlayer from '@/components/tune-flow/music-player';
import { generateSheetMusicFromMoodAndGenre, GenerateSheetMusicInput } from '@/ai/flows/generate-sheet-music-from-mood-and-genre';

type PageState = {
  sheetMusic?: string;
  error?: string;
};

export default async function Home(
  { searchParams }: { searchParams: GenerateSheetMusicInput & { state?: string } }
) {
  const { mood, genre } = searchParams;
  let pageState: PageState = {};

  if (mood && genre) {
    const result = await generateSheetMusicFromMoodAndGenre({ mood, genre });
    if (result.sheetMusic) {
      pageState = { sheetMusic: result.sheetMusic };
    } else {
      pageState = { error: 'Failed to generate sheet music. Please try again.' };
    }
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary p-4">
            <Music className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            TuneFlow
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Craft a unique melody from your mood and favorite genre.
          </p>
        </header>

        <MoodGenreForm defaultValues={{ mood, genre }} />

        {mood && genre && !pageState.sheetMusic && !pageState.error && (
            <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-8 text-center shadow-sm">
                <div className="flex items-center space-x-2 text-muted-foreground">
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary"></div>
                    <span>Generating your masterpiece...</span>
                </div>
            </div>
        )}

        {pageState.error && (
          <div className="rounded-lg border border-destructive/50 bg-card p-8 text-center text-destructive shadow-sm">
            <p>{pageState.error}</p>
          </div>
        )}
        
        {pageState.sheetMusic && <MusicPlayer sheetMusic={pageState.sheetMusic} />}
      </div>
    </main>
  );
}
