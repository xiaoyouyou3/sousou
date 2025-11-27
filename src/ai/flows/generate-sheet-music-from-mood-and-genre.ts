'use server';

/**
 * @fileOverview Generates sheet music based on the selected mood, genre, and optional feeling.
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
  note: z.string().describe("The pitch of the note (e.g., 'C4', 'F#5')."),
  duration: z.string().describe("The duration of the note in Tone.js notation (e.g., '8n', '4n', '1m')."),
});

const GenerateSheetMusicOutputSchema = z.object({
  sheetMusic: z.array(NoteSchema).describe('The generated sheet music as an array of note objects, compatible with Tone.js.'),
});
export type GenerateSheetMusicOutput = z.infer<typeof GenerateSheetMusicOutputSchema>;

export async function generateSheetMusicFromMoodAndGenre(input: GenerateSheetMusicInput): Promise<GenerateSheetMusicOutput> {
  return generateSheetMusicFromMoodAndGenreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSheetMusicPrompt',
  input: {schema: GenerateSheetMusicInputSchema},
  output: {schema: GenerateSheetMusicOutputSchema},
  prompt: `You are a composer that specializes in creating sheet music with Tone.js.

  Based on the user's mood, desired music genre, and their current feeling, generate sheet music that reflects their choices. 
  
  Return the sheet music as a valid JSON object. The JSON should contain a 'sheetMusic' key with an array of note objects. Each object must have 'time', 'note', and 'duration' properties.
  Example of the expected output format:
  {
    "sheetMusic": [
      {"time": "0:0", "note": "C4", "duration": "8n"},
      {"time": "0:1", "note": "E4", "duration": "8n"},
      {"time": "0:2", "note": "G4", "duration": "4n"}
    ]
  }

  The total duration of the generated music should be approximately within the range specified in seconds.

  Do not include any other text, formatting, or markdown backticks in your response, only the valid JSON object.

  Mood: {{{mood}}}
  Genre: {{{genre}}}
  {{#if duration}}
  Duration: within {{{duration}}} seconds
  {{/if}}
  {{#if feeling}}
  Feeling: {{{feeling}}}
  {{/if}}

  Ensure the generated sheet music is creative, reflects the user's choices, and is playable.
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
