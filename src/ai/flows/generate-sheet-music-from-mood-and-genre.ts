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
  duration: z.string().optional().describe('The desired duration of this music segment in seconds (e.g., "15").'),
  segmentIndex: z.number().optional().describe('The index of the current segment being generated.'),
  totalSegments: z.number().optional().describe('The total number of segments that will be generated for the whole song.'),
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
  title: z.string().describe('A creative song title based on the user\'s input. This should be consistent across all segments.'),
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

  Based on the user's mood, desired music genre, and their current feeling, you will generate a segment of a song.
  This is segment {{#if segmentIndex}}{{#math}}{{segmentIndex}} + 1{{/math}}{{else}}1{{/if}} of {{totalSegments}}.
  
  {{#ifEquals totalSegments 1}}
  Create a complete musical piece with a clear beginning, middle, and end.
  {{/ifEquals}}
  {{#if gt totalSegments 1}}
    {{#ifEquals segmentIndex 0}}
    This is the INTRODUCTORY part of the song. Create an engaging opening.
    {{else}}{{#ifEquals segmentIndex (math totalSegments '-' 1)}}
    This is the FINAL part of the song. Create a resolving and conclusive ending.
    {{else}}
    This is a MIDDLE part of the song. Continue the musical idea from the previous part and build on it.
    {{/ifEquals}}{{/ifEquals}}
  {{/if}}

  The title of the song should be creative and consistent across all segments.
  Generate sheet music for 1 to 3 instruments that are appropriate for the genre.
  
  - For 'pop', use instruments like Synth, Bass, and Drums.
  - For 'classical', use instruments like Piano, Violin, and Cello.
  - For 'jazz', use instruments like Piano, Bass, and Saxophone.
  - For 'rock', use instruments like Guitar, Bass, and Drums.
  - For 'electronic', use instruments like Synth, Bass, and Arpeggiator.
  - For 'ambient', use instruments like Pad, Synth, and FX.
  - For 'lo-fi', use instruments like Electric Piano, Bass, and Drums with a relaxed feel.
  - For 'sci-fi', use instruments like Synth, Pad, and Arpeggiator.

  Return the title and sheet music as a valid JSON object. The JSON must contain:
  1. A 'title' key with a creative song title.
  2. A 'parts' key with an array of instrument parts. Each part object must have:
     - 'instrument': The name of the instrument.
     - 'notes': An array of note objects, each with 'time', 'note', and 'duration' properties.

  The total duration of THIS SEGMENT should be approximately {{{duration}}} seconds.
  Ensure the generated sheet music is creative, harmonically interesting, and playable. Avoid creating notes that are too short, which can cause clicking sounds. Ensure that for a single instrument, notes do not overlap in time.
  Do not include any other text, formatting, or markdown backticks in your response, only the valid JSON object.

  Mood: {{{mood}}}
  Genre: {{{genre}}}
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
