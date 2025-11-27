'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { Play, Pause, StopCircle, RefreshCw, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

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

const STAFF_LINES = 5;
const LINE_HEIGHT = 15;
const STAFF_HEIGHT = (STAFF_LINES - 1) * LINE_HEIGHT;

export default function MusicPlayer({ title, parts }: MusicPlayerProps) {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const synths = useRef<Map<string, Tone.PolySynth>>(new Map());
  const toneParts = useRef<Tone.Part[]>([]);

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
          n => n && typeof n.time === 'string' && typeof n.note === 'string' && typeof n.duration === 'string'
        ),
      }))
      .filter(part => part.notes.length > 0);
  }, [parts, toast]);

  const instrumentNames = useMemo(() => validatedParts.map(p => p.instrument), [validatedParts]);

  const setupTone = useCallback(async () => {
    if (validatedParts.length === 0 || !Tone.Transport.stopped) return;

    await Tone.start();
    console.log('AudioContext started');
    
    // Cleanup old synths and parts
    synths.current.forEach(synth => synth.dispose());
    synths.current.clear();
    toneParts.current.forEach(p => p.dispose());
    toneParts.current = [];

    validatedParts.forEach(partData => {
      let synth: Tone.PolySynth;
      // Basic synth selection, can be expanded
      switch (partData.instrument.toLowerCase()) {
        case 'drums':
          synth = new Tone.PolySynth(Tone.MembraneSynth, {
            pitchDecay: 0.05,
            octaves: 10,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: 'exponential' },
          }).toDestination();
          break;
        case 'bass':
           synth = new Tone.PolySynth(Tone.MonoSynth, {
            oscillator: { type: "fmsquare", modulationType: "sawtooth", modulationIndex: 0.2, harmonicity: 3.4 },
            envelope: { attack: 0.001, decay: 0.1, sustain: 0.4, release: 2, attackCurve: "exponential" },
            filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 1.5, baseFrequency: 50, octaves: 4.4, exponent: 2 },
            filter: { Q: 2, type: 'lowpass', rolloff: -24 }
          }).toDestination();
          break;
        default: // Piano, Synth, Guitar etc.
          synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'fmsquare' },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 1 },
          }).toDestination();
          break;
      }
      synths.current.set(partData.instrument, synth);
      
      const tonePart = new Tone.Part<NoteEvent>((time, note) => {
        const notesToPlay = note.note.split(' ');
        synth.triggerAttackRelease(notesToPlay, note.duration, time);
      }, partData.notes).start(0);

      tonePart.loop = false;
      toneParts.current.push(tonePart);
    });

    Tone.Transport.on('stop', () => setIsPlaying(false));
    Tone.Transport.on('pause', () => setIsPlaying(false));
    Tone.Transport.on('start', () => setIsPlaying(true));

    setIsInitialized(true);
    console.log('Tone.js setup complete with', validatedParts.length, 'parts');

  }, [validatedParts]);


  useEffect(() => {
    return () => {
      if (Tone.Transport.state !== 'stopped') {
        Tone.Transport.stop();
        Tone.Transport.cancel();
      }
      toneParts.current.forEach(p => p.dispose());
      synths.current.forEach(s => s.dispose());
      toneParts.current = [];
      synths.current.clear();
      setIsInitialized(false);
      setIsPlaying(false);
    };
  }, [parts]); // Rerun cleanup when original parts change

  const handlePlayPause = async () => {
    if (!isInitialized) {
      await setupTone();
    }
    
    // Ensure Transport is running
    if (Tone.context.state !== 'running') {
      await Tone.start();
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
      await setupTone();
    }
    Tone.Transport.stop();
    // A small delay might help ensure stop is processed before start
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
        </div>
        <div className="flex items-center justify-center space-x-4">
          <Button onClick={handlePlayPause} size="lg" className="w-28">
            {isPlaying ? <Pause /> : <Play />}
            <span className="ml-2">{isPlaying ? '一時停止' : '再生'}</span>
          </Button>
          <Button onClick={handleStop} size="lg" variant="outline" disabled={!isInitialized}>
            <StopCircle />
          </Button>
          <Button onClick={handleRestart} size="lg" variant="outline" disabled={!isInitialized}>
            <RefreshCw />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
