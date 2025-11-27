'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { Play, Pause, StopCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

type NoteEvent = {
  time: string;
  note: string;
  duration: string;
};

interface MusicPlayerProps {
  title: string;
  sheetMusic: NoteEvent[];
}

const NOTE_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const STAFF_LINES = 5;
const LINE_HEIGHT = 15;
const STAFF_HEIGHT = (STAFF_LINES - 1) * LINE_HEIGHT;
const NOTE_RADIUS = LINE_HEIGHT / 2 - 1;

// Maps a note name (e.g., C4, F#5) to a Y position on the staff
function noteToY(note: string): number {
  if (!note || typeof note !== 'string') return 0;
  const noteName = note.slice(0, -1).toUpperCase();
  const octave = parseInt(note.slice(-1), 10);
  if (isNaN(octave)) return 0;
  const noteWithoutAccidental = noteName.charAt(0);
  const positionInOctave = NOTE_ORDER.indexOf(noteWithoutAccidental);

  // Position for C4 is on the first ledger line below the staff
  const c4Position = STAFF_HEIGHT + LINE_HEIGHT;
  const noteOctaveOffset = (octave - 4) * 7 * (LINE_HEIGHT / 2);
  const notePositionOffset = positionInOctave * (LINE_HEIGHT / 2);
  
  return c4Position - noteOctaveOffset - notePositionOffset;
}


export default function MusicPlayer({ title, sheetMusic }: MusicPlayerProps) {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  const [isInitialized, setIsInitialized] = useState(false);

  const synth = useRef<Tone.PolySynth | null>(null);
  const part = useRef<Tone.Part<NoteEvent> | null>(null);
  
  const notes = useMemo<NoteEvent[]>(() => {
    if (!Array.isArray(sheetMusic)) {
       toast({
        variant: "destructive",
        title: "無効な音楽データ",
        description: "AIが無効な形式の楽譜を返しました。",
      });
      return [];
    }
    // Filter out any invalid notes
    return sheetMusic.filter(n => n && typeof n.time === 'string' && typeof n.note === 'string' && typeof n.duration === 'string');
  }, [sheetMusic, toast]);

  const totalDuration = useMemo(() => {
    if (notes.length === 0) return 0;
    try {
      const lastNote = notes[notes.length - 1];
      return Tone.Time(lastNote.time).toSeconds() + Tone.Time(lastNote.duration).toSeconds();
    } catch {
      return 0;
    }
  }, [notes]);
  
  const setupTone = useCallback(async () => {
    if (notes.length === 0 || synth.current) return;
    
    await Tone.start();

    synth.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fmsquare' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 1 },
    }).toDestination();

    part.current = new Tone.Part<NoteEvent>((time, note) => {
      if (note.note) {
        synth.current?.triggerAttackRelease(note.note, note.duration, time);
      }
      Tone.Draw.schedule(() => {
        const index = notes.findIndex(n => n.time === note.time && n.note === note.note);
        setCurrentNoteIndex(index);
      }, time);
    }, notes).start(0);

    part.current.loop = false;

    Tone.Transport.on('stop', () => {
      setIsPlaying(false);
      setCurrentNoteIndex(-1);
    });

    Tone.Transport.on('pause', () => {
      setIsPlaying(false);
    });

    Tone.Transport.on('start', () => {
      setIsPlaying(true);
    });
    
    setIsInitialized(true);
  }, [notes]);

  useEffect(() => {
    return () => {
      if (Tone.Transport.state !== 'stopped') {
        Tone.Transport.stop();
        Tone.Transport.cancel();
      }
      part.current?.dispose();
      synth.current?.dispose();
      part.current = null;
      synth.current = null;
      setIsInitialized(false);
      setIsPlaying(false);
      setCurrentNoteIndex(-1);
    };
  }, [sheetMusic]);

  const handlePlayPause = async () => {
    if (!isInitialized) {
      await setupTone();
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
    Tone.Transport.start();
  }
  
  const viewWidth = 800;
  const viewHeight = STAFF_HEIGHT + LINE_HEIGHT * 4;

  if (notes.length === 0) return null;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">生成された楽曲</CardTitle>
        <CardDescription className="text-lg font-semibold text-primary">{title}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full overflow-x-auto rounded-lg border bg-background/50 p-4">
          <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="min-w-[600px] w-full h-auto">
            <g transform={`translate(0, ${LINE_HEIGHT * 2})`}>
              {/* Staff lines */}
              {Array.from({ length: STAFF_LINES }).map((_, i) => (
                <line key={i} x1="0" y1={i * LINE_HEIGHT} x2={viewWidth} y2={i * LINE_HEIGHT} className="stroke-muted-foreground" strokeWidth="1" />
              ))}

              {/* Notes */}
              {notes.map((note, index) => {
                if (!note || !note.note || !note.time || totalDuration === 0) return null;
                const x = (Tone.Time(note.time).toSeconds() / totalDuration) * (viewWidth - 40) + 20;
                const y = noteToY(note.note);
                const isCurrent = index === currentNoteIndex;

                return (
                  <g key={index} transform={`translate(${x}, ${y})`}>
                    <circle
                      cx="0"
                      cy="0"
                      r={NOTE_RADIUS}
                      className={`transition-colors duration-100 ${isCurrent ? 'fill-primary' : 'fill-foreground'}`}
                    />
                    {/* Note Stem */}
                    <line x1="0" y1="0" x2="0" y2={y > STAFF_HEIGHT / 2 ? -25 : 25} className={`stroke-2 transition-colors duration-100 ${isCurrent ? 'stroke-primary' : 'stroke-foreground'}`}/>
                    {/* Ledger lines */}
                    {(y >= STAFF_HEIGHT + NOTE_RADIUS || y <= -NOTE_RADIUS) && (
                        <line x1={-NOTE_RADIUS - 2} y1="0" x2={NOTE_RADIUS + 2} y2="0" className="stroke-muted-foreground" strokeWidth="1.5" />
                    )}
                     {(y >= STAFF_HEIGHT + NOTE_RADIUS + LINE_HEIGHT || y <= -NOTE_RADIUS - LINE_HEIGHT) && (
                        <line x1={-NOTE_RADIUS - 2} y1={y > 0 ? LINE_HEIGHT : -LINE_HEIGHT} x2={NOTE_RADIUS + 2} y2={y > 0 ? LINE_HEIGHT : -LINE_HEIGHT} className="stroke-muted-foreground" strokeWidth="1.5" />
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
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
