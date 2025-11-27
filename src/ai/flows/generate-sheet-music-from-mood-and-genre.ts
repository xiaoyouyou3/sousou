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
  duration: z.string().optional().describe('The desired duration of the music in seconds.'),
});
export type GenerateSheetMusicInput = z.infer<typeof GenerateSheetMusicInputSchema>;

const GenerateSheetMusicOutputSchema = z.object({
  sheetMusic: z.string().describe('The generated sheet music in a format compatible with Tone.js. This should be a JSON string representing an array of note objects, like `[{"time": "0:0", "note": "C4", "duration": "8n"}]`.'),
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
  
  Return the sheet music as a valid JSON string. The JSON should be an array of objects, where each object represents a note and has 'time', 'note', and 'duration' properties.
  Example: \`{"sheetMusic": "[{\\"time\\": \\"0:0\\", \\"note\\": \\"C4\\", \\"duration\\": \\"8n\\"}]"}\`

  The total duration of the generated music should be approximately the number of seconds specified.

  Do not include any other text, formatting, or markdown backticks in your response, only the JSON object.

  Mood: {{{mood}}}
  Genre: {{{genre}}}
  {{#if duration}}
  Duration: {{{duration}}} seconds
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