'use client';

import { useState, useTransition } from 'react';
import { Music } from 'lucide-react';
import { MoodGenreForm } from '@/components/tune-flow/mood-genre-form';
import MusicPlayer from '@/components/tune-flow/music-player';
import { generateSheetMusicFromMoodAndGenre, GenerateSheetMusicInput, GenerateSheetMusicOutput } from '@/ai/flows/generate-sheet-music-from-mood-and-genre';

export default function Home() {
  const [isPending, startTransition] = useTransition();
  const [musicOutput, setMusicOutput] = useState<GenerateSheetMusicOutput | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [formValues, setFormValues] = useState<Partial<GenerateSheetMusicInput>>({});

  const handleFormSubmit = (values: GenerateSheetMusicInput) => {
    setMusicOutput(undefined);
    setError(undefined);
    setFormValues(values);

    startTransition(async () => {
      try {
        const result = await generateSheetMusicFromMoodAndGenre(values);
        if (result && result.parts && result.title) {
          setMusicOutput(result);
        } else {
          setError('楽譜の生成に失敗しました。もう一度お試しください。');
        }
      } catch (e: any) {
        console.error(e);
        const errorMessage = e.message || '';
        if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('overloaded') || errorMessage.toLowerCase().includes('service unavailable') || errorMessage.toLowerCase().includes('timed out')) {
          setError('現在、AIモデルが大変混み合っているか、応答に時間がかかりすぎています。しばらくしてから再度お試しください。');
        } else {
          setError('予期せぬエラーが発生しました。もう一度お試しください。');
        }
      }
    });
  };

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
            気分や好きなジャンルから、あなただけのメロディーを奏でよう。
          </p>
        </header>

        <MoodGenreForm 
          defaultValues={formValues} 
          isGenerating={isPending} 
          onSubmit={handleFormSubmit} 
        />

        {isPending && (
            <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-8 text-center shadow-sm">
                <div className="flex items-center space-x-2 text-muted-foreground">
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary"></div>
                    <span>傑作を生成中です...</span>
                </div>
            </div>
        )}

        {error && !isPending && (
          <div className="rounded-lg border border-destructive/50 bg-card p-8 text-center text-destructive shadow-sm">
            <p>{error}</p>
          </div>
        )}
        
        {musicOutput && musicOutput.parts && musicOutput.title && !isPending && (
          <MusicPlayer title={musicOutput.title} parts={musicOutput.parts} />
        )}
      </div>
    </main>
  );
}
