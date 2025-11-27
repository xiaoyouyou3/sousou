'use server';

/**
 * @fileOverview Generates sheet music based on the selected mood and genre.
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
});
export type GenerateSheetMusicInput = z.infer<typeof GenerateSheetMusicInputSchema>;

const GenerateSheetMusicOutputSchema = z.object({
  sheetMusic: z.string().describe('The generated sheet music in a format compatible with Tone.js. This should be a JSON string.'),
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

  Based on the user's mood and desired music genre, generate sheet music that reflects their choices. Return the sheet music in a valid JSON format that is compatible with Tone.js.

  Do not include any other text or formatting in your response, only the JSON object.

  Mood: {{{mood}}}
  Genre: {{{genre}}}

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
