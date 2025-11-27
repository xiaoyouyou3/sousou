'use server';

/**
 * @fileOverview Generates sheet music and a title based on the selected mood, genre, and optional feeling.
 *
 * - generateSheetMusicFromMoodAndGenre - A function that handles the sheet music generation process.
 * - GenerateSheetMusicInput - The input type for the generateSheetMusicFromMoodAndGenre function.
 * - GenerateSheetMusicOutput - The return type for the generateSheetMusicFromMoodAndGenre function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSheetMusicInputSchema = z.object({
  mood: z.string().describe('The mood selected by the user (e.g., happy, sad, energetic).'),
  genre: z.string().describe('The music genre selected by the user (e.g., pop, classical, jazz).'),
  feeling: z.string().optional().describe('An optional text describing the user\'s current feeling.'),
  duration: z.string().optional().describe('The desired duration range of the music in seconds (e.g., "15-30").'),
});
export type GenerateSheetMusicInput = z.infer<typeof GenerateSheetMusicInputSchema>;

const NoteSchema = z.object({
  time: z.string().describe("The time at which the note should be played, in Tone.js transport time format (e.g., '0:0', '0:1.5')."),
  note: z.string().describe("The pitch of the note (e.g., 'C4', 'F#5'). Can also be a chord with notes separated by spaces."),
  duration: z.string().describe("The duration of the note in Tone.js notation (e.g., '8n', '4n', '1m')."),
});

const InstrumentPartSchema = z.object({
  instrument: z.string().describe("The name of the instrument (e.g., 'Piano', 'Guitar', 'Drums')."),
  notes: z.array(NoteSchema).describe("The sheet music for this instrument as an array of note objects."),
});

const GenerateSheetMusicOutputSchema = z.object({
  title: z.string().describe('A creative song title based on the user\'s input.'),
  parts: z.array(InstrumentPartSchema).describe('An array of musical parts, one for each instrument. The number of instruments should be between 1 and 3, appropriate for the genre.'),
});
export type GenerateSheetMusicOutput = z.infer<typeof GenerateSheetMusicOutputSchema>;

export async function generateSheetMusicFromMoodAndGenre(input: GenerateSheetMusicInput): Promise<GenerateSheetMusicOutput> {
  return generateSheetMusicFromMoodAndGenreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSheetMusicPrompt',
  input: {schema: GenerateSheetMusicInputSchema},
  output: {schema: GenerateSheetMusicOutputSchema},
  prompt: `You are a talented composer that creates multi-instrument sheet music for Tone.js.

  Based on the user's mood, desired music genre, and their current feeling, generate a creative song title and sheet music for 1 to 3 instruments that are appropriate for the genre.
  
  - For 'pop', use instruments like Synth, Bass, and Drums.
  - For 'classical', use instruments like Piano, Violin, and Cello.
  - For 'jazz', use instruments like Piano, Bass, and Saxophone.
  - For 'rock', use instruments like Guitar, Bass, and Drums.
  - For 'electronic', use instruments like Synth, Pad, and Arpeggiator.
  - For 'ambient', use instruments like Pad, Synth, and FX.
  - For 'lo-fi', use instruments like Electric Piano, Bass, and Drums with a relaxed feel.
  - For 'sci-fi', use futuristic sounds like Synth, Pad, and otherworldly FX.

  Return the title and sheet music as a valid JSON object. The JSON must contain:
  1. A 'title' key with a creative song title.
  2. A 'parts' key with an array of instrument parts. Each part object must have:
     - 'instrument': The name of the instrument.
     - 'notes': An array of note objects, each with 'time', 'note', and 'duration' properties.

  Example of the expected output format:
  {
    "title": "Cosmic Jazz",
    "parts": [
      {
        "instrument": "Piano",
        "notes": [
          {"time": "0:0", "note": "C4 E4 G4", "duration": "4n"},
          {"time": "0:2", "note": "D4 F4 A4", "duration": "4n"}
        ]
      },
      {
        "instrument": "Bass",
        "notes": [
          {"time": "0:0", "note": "C2", "duration": "2n"},
          {"time": "0:2", "note": "D2", "duration": "2n"}
        ]
      }
    ]
  }

  The total duration of the generated music should be approximately within the range specified in seconds.
  Ensure the generated sheet music is creative, harmonically interesting, and playable.
  Do not include any other text, formatting, or markdown backticks in your response, only the valid JSON object.

  Mood: {{{mood}}}
  Genre: {{{genre}}}
  {{#if duration}}
  Duration: within {{{duration}}} seconds
  {{/if}}
  {{#if feeling}}
  Feeling: {{{feeling}}}
  {{/if}}
  `
});

const generateSheetMusicFromMoodAndGenreFlow = ai.defineFlow(
  {
    name: 'generateSheetMusicFromMoodAndGenreFlow',
    inputSchema: GenerateSheetMusicInputSchema,
    outputSchema: GenerateSheetMusicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
