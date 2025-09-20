'use server';
/**
 * @fileOverview Predicts high-traffic routes where other players are likely to contest territory.
 *
 * - predictHighTrafficRoutes - A function that predicts high-traffic routes.
 * - PredictHighTrafficRoutesInput - The input type for the predictHighTrafficRoutes function.
 * - PredictHighTrafficRoutesOutput - The return type for the predictHighTrafficRoutes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictHighTrafficRoutesInputSchema = z.object({
  territoryMapData: z
    .string()
    .describe(
      'A territory map as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' /* example data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w+r8jUAAAP//SzJgIJ9EAAAADUlEQVQYV2P4//8/AwMDEwMDAwMDAxAQAAEQBUqbwAoUAAAAASUVORK5CYII= */
    ),
  userMovementPatterns: z
    .string()
    .describe(
      'A JSON string representing user movement patterns over time.'
    ),
});
export type PredictHighTrafficRoutesInput = z.infer<
  typeof PredictHighTrafficRoutesInputSchema
>;

const PredictHighTrafficRoutesOutputSchema = z.object({
  predictedRoutesOverlay: z
    .string()
    .describe(
      'A data URI representing an image overlay of predicted high-traffic routes. The format must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' /* example data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w+r8jUAAAP//SzJgIJ9EAAAADUlEQVQYV2P4//8/AwMDEwMDAwMDAxAQAAEQBUqbwAoUAAAAASUVORK5CYII= */
    ),
});
export type PredictHighTrafficRoutesOutput = z.infer<
  typeof PredictHighTrafficRoutesOutputSchema
>;

export async function predictHighTrafficRoutes(
  input: PredictHighTrafficRoutesInput
): Promise<PredictHighTrafficRoutesOutput> {
  return predictHighTrafficRoutesFlow(input);
}

const predictHighTrafficRoutesPrompt = ai.definePrompt({
  name: 'predictHighTrafficRoutesPrompt',
  input: {schema: PredictHighTrafficRoutesInputSchema},
  output: {schema: PredictHighTrafficRoutesOutputSchema},
  prompt: `You are an AI that can predict high-traffic routes on a territory map where players are likely to contest territory.

  Use the following information to predict these routes. Output the predicted routes as an image overlay with highlighted paths.

  Territory Map: {{media url=territoryMapData}}
  User Movement Patterns: {{{userMovementPatterns}}}
  `,
});

const predictHighTrafficRoutesFlow = ai.defineFlow(
  {
    name: 'predictHighTrafficRoutesFlow',
    inputSchema: PredictHighTrafficRoutesInputSchema,
    outputSchema: PredictHighTrafficRoutesOutputSchema,
  },
  async input => {
    const {output} = await predictHighTrafficRoutesPrompt(input);
    return output!;
  }
);
