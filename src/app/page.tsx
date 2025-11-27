'use client';

import { useState, useTransition, useEffect } from 'react';
import * as Tone from 'tone';
import { Music, LogOut, User as UserIcon, LogIn, Download } from 'lucide-react';
import { MoodGenreForm } from '@/components/tune-flow/mood-genre-form';
import MusicPlayer from '@/components/tune-flow/music-player';
import { generateSheetMusicFromMoodAndGenre, GenerateSheetMusicInput, GenerateSheetMusicOutput } from '@/ai/flows/generate-sheet-music-from-mood-and-genre';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const SEGMENT_DURATION = 15; // 15 seconds per segment

export default function Home() {
  const [isPending, startTransition] = useTransition();
  const [musicOutput, setMusicOutput] = useState<GenerateSheetMusicOutput | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [formValues, setFormValues] = useState<Partial<GenerateSheetMusicInput>>({});
  const [generationProgress, setGenerationProgress] = useState(0);

  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleFormSubmit = (values: GenerateSheetMusicInput) => {
    setMusicOutput(undefined);
    setError(undefined);
    setFormValues(values);
    setGenerationProgress(0);

    startTransition(async () => {
      try {
        const [minDurationStr, maxDurationStr] = values.duration!.split('-');
        const minDuration = parseInt(minDurationStr, 10);
        const maxDuration = parseInt(maxDurationStr, 10);
        const targetDuration = (minDuration + maxDuration) / 2;
        const totalSegments = Math.ceil(targetDuration / SEGMENT_DURATION);
        
        const generationPromises = Array.from({ length: totalSegments }, (_, i) => {
          const promise = generateSheetMusicFromMoodAndGenre({
            ...values,
            duration: String(SEGMENT_DURATION),
            segmentIndex: i,
            totalSegments: totalSegments,
          });
          promise.then(() => {
            setGenerationProgress(prev => prev + 1);
          });
          return promise;
        });

        const results = await Promise.all(generationPromises);

        if (!results || results.some(r => !r || !r.parts || !r.title)) {
          setError('楽譜の一部の生成に失敗しました。もう一度お試しください。');
          return;
        }

        const finalTitle = results[0].title;
        const combinedParts: { [instrument: string]: any[] } = {};
        const instrumentNames = new Set<string>();

        results.forEach((result, segmentIndex) => {
          const segmentOffset = segmentIndex * SEGMENT_DURATION;
          result.parts.forEach(part => {
            instrumentNames.add(part.instrument);
            if (!combinedParts[part.instrument]) {
              combinedParts[part.instrument] = [];
            }
            part.notes.forEach(note => {
              const noteTime = Tone.Time(note.time).toSeconds();
              const newTime = noteTime + segmentOffset;
              combinedParts[part.instrument].push({
                ...note,
                time: newTime,
              });
            });
          });
        });
        
        const finalParts = Array.from(instrumentNames).map(instrument => ({
            instrument,
            notes: combinedParts[instrument] || [],
        }));
        
        setMusicOutput({ title: finalTitle, parts: finalParts });

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

  const handleSaveScore = async () => {
    if (!user || !musicOutput) return;

    try {
      const postsCollectionRef = collection(firestore, `users/${user.uid}/posts`);
      await addDocumentNonBlocking(postsCollectionRef, {
        userId: user.uid,
        title: musicOutput.title,
        mood: formValues.mood,
        genre: formValues.genre,
        feeling: formValues.feeling,
        score: JSON.stringify(musicOutput.parts),
        createdAt: serverTimestamp(),
      });
      toast({
        title: '成功',
        description: '楽曲を保存しました。',
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: '楽曲の保存に失敗しました。',
      });
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl space-y-8">
        <header className="flex w-full items-center justify-between">
          <div/>
          <div className="text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary p-4">
              <Music className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              TuneFlow
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              気分や好きなジャンルから、あなただけのメロディーを奏でよう。
            </p>
          </div>
          <div className="flex items-center gap-2 self-start">
            {isUserLoading ? (
              <div className="h-9 w-24 animate-pulse rounded-md bg-muted"></div>
            ) : user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="ログアウト">
                  <LogOut />
                </Button>
              </>
            ) : (
              <Button onClick={() => router.push('/login')}>
                <LogIn />
                ログイン
              </Button>
            )}
          </div>
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
                    <span>傑作を生成中です... ({generationProgress} / {formValues.duration ? Math.ceil(((parseInt(formValues.duration.split('-')[0], 10) + parseInt(formValues.duration.split('-')[1], 10)) / 2) / SEGMENT_DURATION) : 1})</span>
                </div>
            </div>
        )}

        {error && !isPending && (
          <div className="rounded-lg border border-destructive/50 bg-card p-8 text-center text-destructive shadow-sm">
            <p>{error}</p>
          </div>
        )}
        
        {musicOutput && musicOutput.parts && musicOutput.title && !isPending && (
          <>
            <MusicPlayer title={musicOutput.title} parts={musicOutput.parts} />
            {user && (
              <div className="flex justify-center">
                <Button onClick={handleSaveScore}>
                  <Download />
                  この楽曲を保存する
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
