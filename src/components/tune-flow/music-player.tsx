'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { Play, Pause, StopCircle, RefreshCw, Music2, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

type NoteEvent = {
  time: string;
  note: string;
  duration: string;
};

type InstrumentPart = {
  instrument: string;
  notes: NoteEvent[];
};

interface MusicPlayerProps {
  title: string;
  parts: InstrumentPart[];
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function MusicPlayer({ title, parts }: MusicPlayerProps) {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const synths = useRef<Map<string, Tone.PolySynth>>(new Map());
  const toneParts = useRef<Tone.Part[]>([]);
  const progressAnimationRef = useRef<number>();

  const isValidTime = (time: string) => {
    try {
      return Tone.Time(time).toSeconds() >= 0;
    } catch {
      return false;
    }
  };

  const validatedParts = useMemo<InstrumentPart[]>(() => {
    if (!Array.isArray(parts)) {
      toast({
        variant: 'destructive',
        title: '無効な音楽データ',
        description: 'AIが無効な形式の楽譜を返しました。',
      });
      return [];
    }
    return parts
      .map(part => ({
        ...part,
        notes: (part.notes || []).filter(
          n => 
            n && 
            typeof n.time === 'string' &&
            typeof n.note === 'string' &&
            typeof n.duration === 'string' &&
            isValidTime(n.time) &&
            isValidTime(n.duration) &&
            Tone.Time(n.duration).toSeconds() > 0.01 // Very short notes can cause clicks
        ),
      }))
      .filter(part => part.notes.length > 0);
  }, [parts, toast]);
  
  const totalDuration = useMemo(() => {
    if (validatedParts.length === 0) return 0;
    let maxDuration = 0;
    try {
      validatedParts.forEach(part => {
        part.notes.forEach(note => {
          const endTime = Tone.Time(note.time).toSeconds() + Tone.Time(note.duration).toSeconds();
          if (endTime > maxDuration) {
            maxDuration = endTime;
          }
        });
      });
    } catch (e) {
      console.error("Error calculating duration:", e);
      return 60; // fallback
    }
    return maxDuration;
  }, [validatedParts]);

  const instrumentNames = useMemo(() => validatedParts.map(p => p.instrument), [validatedParts]);

  const cleanupTone = useCallback(async () => {
    // Make sure transport is stopped before cleaning up
    if (Tone.Transport.state !== 'stopped') {
        Tone.Transport.stop();
        Tone.Transport.cancel();
    }
    
    if (progressAnimationRef.current) {
        cancelAnimationFrame(progressAnimationRef.current);
    }
    
    // Dispose all parts and synths
    toneParts.current.forEach(p => p.dispose());
    synths.current.forEach(s => s.dispose());

    toneParts.current = [];
    synths.current.clear();
    
    setIsInitialized(false);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    console.log('Tone.js resources cleaned up and reset.');
  }, []);
  
  const updateProgress = useCallback(() => {
    if (totalDuration > 0 && Tone.Transport.state === 'started') {
      const currentSeconds = Tone.Transport.seconds;
      setCurrentTime(currentSeconds);
      setProgress((currentSeconds / totalDuration) * 100);
      progressAnimationRef.current = requestAnimationFrame(updateProgress);
    }
  }, [totalDuration]);


  const setupTone = useCallback(async () => {
    await cleanupTone();
    if (validatedParts.length === 0) return;

    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    console.log('AudioContext started');
    
    validatedParts.forEach(partData => {
      let synth: any;
      // Adjust envelopes and volumes to prevent clipping and noise
      switch (partData.instrument.toLowerCase()) {
        case 'drums':
          synth = new Tone.PolySynth(Tone.MembraneSynth, {
            pitchDecay: 0.02,
            octaves: 8,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.005, decay: 0.3, sustain: 0.01, release: 0.8, attackCurve: 'exponential' },
            volume: -12
          }).toDestination();
          break;
        case 'bass':
           synth = new Tone.PolySynth(Tone.MonoSynth, {
            oscillator: { type: "fmsquare", modulationType: "sawtooth", modulationIndex: 0.2, harmonicity: 3.4 },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.4, release: 1 },
            filterEnvelope: { attack: 0.02, decay: 0.1, sustain: 0.6, release: 1, baseFrequency: 60, octaves: 4 },
            filter: { Q: 2, type: 'lowpass', rolloff: -24 },
            volume: -15
          }).toDestination();
          break;
        default: // For Piano, Synth, Guitar etc.
          synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'fmsine' },
            envelope: { attack: 0.02, decay: 0.2, sustain: 0.2, release: 0.5 },
            volume: -18
          }).toDestination();
          break;
      }
      synths.current.set(partData.instrument, synth);
      
      const tonePart = new Tone.Part<NoteEvent>((time, note) => {
        const currentSynth = synths.current.get(partData.instrument);
        if (currentSynth) {
          const notesToPlay = note.note.split(' ');
          currentSynth.triggerAttackRelease(notesToPlay, note.duration, time);
        }
      }, partData.notes).start(0);

      tonePart.loop = false;
      toneParts.current.push(tonePart);
    });
    
    Tone.Transport.on('stop', () => {
      if (progressAnimationRef.current) {
        cancelAnimationFrame(progressAnimationRef.current);
      }
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    });

    Tone.Transport.on('pause', () => {
        if (progressAnimationRef.current) {
            cancelAnimationFrame(progressAnimation-ref.current);
        }
        setIsPlaying(false);
    });

    Tone.Transport.on('start', () => {
        setIsPlaying(true);
        progressAnimationRef.current = requestAnimationFrame(updateProgress);
    });

    Tone.Transport.scheduleOnce(time => {
        Tone.Draw.schedule(() => {
            if (Tone.Transport.state === 'started') {
                Tone.Transport.stop();
            }
        }, time);
    }, totalDuration);
    
    setIsInitialized(true);
    console.log('Tone.js setup complete with', validatedParts.length, 'parts');

  }, [validatedParts, cleanupTone, totalDuration, updateProgress]);


  useEffect(() => {
    // This effect now strictly handles setup and cleanup when parts change.
    if (parts && parts.length > 0) {
      setupTone();
    }
    
    return () => {
      cleanupTone();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parts]);


  const handlePlayPause = async () => {
    if (Tone.context.state !== 'running') {
      console.log('Audio context not running, starting...');
      await Tone.start();
      console.log('Audio context started.');
    }
    
    if (!isInitialized) {
      console.log('Player not initialized, setting up...');
      await setupTone();
      // Need a small delay to ensure setup is complete before starting
      setTimeout(() => Tone.Transport.start(), 100);
      return;
    }
    
    if (Tone.Transport.state === 'started') {
      Tone.Transport.pause();
    } else {
      Tone.Transport.start();
    }
  };

  const handleStop = () => {
    if (!isInitialized) return;
    Tone.Transport.stop();
  };

  const handleRestart = async () => {
    if (!isInitialized) {
       await handlePlayPause();
       return;
    }
    if (Tone.Transport.state !== 'stopped') {
        Tone.Transport.stop();
    }
    // Give a slight delay for stop to process before starting
    setTimeout(() => Tone.Transport.start(), 50);
  }
  
  if (validatedParts.length === 0) return null;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">生成された楽曲</CardTitle>
        <CardDescription className="text-lg font-semibold text-primary">{title}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full overflow-x-auto rounded-lg border bg-background/50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Music2 className="h-10 w-10 text-primary" />
              <div className="flex flex-col">
                <span className="text-muted-foreground">楽器構成:</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {instrumentNames.map(name => (
                    <Badge key={name} variant="secondary">{name}</Badge>
                  ))}
                </div>
              </div>
            </div>
             <div className="flex items-center gap-2 text-muted-foreground">
                <Timer className="h-5 w-5" />
                <span className="font-mono text-sm">{formatTime(totalDuration)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-end">
                <span className="font-mono text-sm text-muted-foreground">
                    {formatTime(currentTime)} / {formatTime(totalDuration)}
                </span>
            </div>
        </div>

        <div className="flex items-center justify-center space-x-4">
          <Button onClick={handlePlayPause} size="lg" className="w-28">
            {isPlaying ? <Pause /> : <Play />}
            <span className="ml-2">{isPlaying ? '一時停止' : '再生'}</span>
          </Button>
          <Button onClick={handleStop} size="lg" variant="outline" disabled={!isInitialized || (!isPlaying && Tone.Transport.state === 'stopped')}>
            <StopCircle />
          </Button>
          <Button onClick={handleRestart} size="lg" variant="outline">
            <RefreshCw />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
