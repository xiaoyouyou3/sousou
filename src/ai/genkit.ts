import {genkit, Plugin, definePrompt as coreDefinePrompt, PromptOptions, MessageData, GenerationCommonUsage, z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import Handlebars from 'handlebars';

// Define and register the 'math' helper
const handlebars = Handlebars.create();
handlebars.registerHelper('math', function(lvalue, operator, rvalue) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);
        
    return {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": lvalue / rvalue,
        "%": lvalue % rvalue
    }[operator];
});
handlebars.registerHelper('ifEquals', function<T>(this: T, arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
handlebars.registerHelper('gt', function<T>(this: T, arg1, arg2, options) {
  return (arg1 > arg2) ? options.fn(this) : options.inverse(this);
});


// Custom definePrompt wrapper that uses our Handlebars instance
export function definePrompt<
  I extends z.ZodTypeAny = z.ZodTypeAny,
  O extends z.ZodTypeAny = z.ZodTypeAny
>(
  options: PromptOptions<I, O>
): ((input: z.infer<I>) => Promise<{
    output: z.infer<O> | undefined;
    history: MessageData[];
    usage: GenerationCommonUsage;
}>) {
  return coreDefinePrompt({
    ...options,
    template: {
      engine: handlebars,
      source: options.prompt!,
    },
    prompt: undefined, // prompt is now passed via template
  }) as any;
}


export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
