'use client';

import { useState } from 'react';
import { Music } from 'lucide-react';
import { MoodGenreForm } from '@/components/tune-flow/mood-genre-form';
import MusicPlayer from '@/components/tune-flow/music-player';
import { generateSheetMusicFromMoodAndGenre, GenerateSheetMusicInput } from '@/ai/flows/generate-sheet-music-from-mood-and-genre';

type NoteEvent = {
  time: string;
  note: string;
  duration: string;
};

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sheetMusic, setSheetMusic] = useState<NoteEvent[] | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [formValues, setFormValues] = useState<Partial<GenerateSheetMusicInput>>({});

  const handleFormSubmit = async (values: GenerateSheetMusicInput) => {
    setIsGenerating(true);
    setSheetMusic(undefined);
    setError(undefined);
    setFormValues(values);

    try {
      const result = await generateSheetMusicFromMoodAndGenre(values);
      if (result.sheetMusic) {
        setSheetMusic(result.sheetMusic);
      } else {
        setError('楽譜の生成に失敗しました。もう一度お試しください。');
      }
    } catch (e: any) {
      console.error(e);
      if (e.message && (e.message.includes('503') || e.message.toLowerCase().includes('overloaded') || e.message.toLowerCase().includes('service unavailable'))) {
        setError('現在、AIモデルが大変混み合っています。しばらくしてから再度お試しください。');
      } else {
        setError('予期せぬエラーが発生しました。もう一度お試しください。');
      }
    } finally {
      setIsGenerating(false);
    }
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
          isGenerating={isGenerating} 
          onSubmit={handleFormSubmit} 
        />

        {isGenerating && (
            <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-8 text-center shadow-sm">
                <div className="flex items-center space-x-2 text-muted-foreground">
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary"></div>
                    <span>傑作を生成中です...</span>
                </div>
            </div>
        )}

        {error && !isGenerating && (
          <div className="rounded-lg border border-destructive/50 bg-card p-8 text-center text-destructive shadow-sm">
            <p>{error}</p>
          </div>
        )}
        
        {sheetMusic && !isGenerating && <MusicPlayer sheetMusic={sheetMusic} />}
      </div>
    </main>
  );
}
