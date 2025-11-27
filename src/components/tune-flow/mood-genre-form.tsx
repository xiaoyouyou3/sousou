'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { moods, genres } from '@/lib/tuneflow-data';
import { WandSparkles } from 'lucide-react';
import { Textarea } from '../ui/textarea';

const FormSchema = z.object({
  mood: z.string({ required_error: '気分を選択してください。' }),
  genre: z.string({ required_error: 'ジャンルを選択してください。' }),
  feeling: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

export function MoodGenreForm({ defaultValues }: { defaultValues?: Partial<FormValues> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      mood: defaultValues?.mood || '',
      genre: defaultValues?.genre || '',
      feeling: defaultValues?.feeling || '',
    },
  });

  function onSubmit(data: FormValues) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set('mood', data.mood);
      params.set('genre', data.genre);
      if (data.feeling) {
        params.set('feeling', data.feeling);
      } else {
        params.delete('feeling');
      }
      router.push(`/?${params.toString()}`);
    });
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">曲を作成</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>気分</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="どんな気分ですか？" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {moods.map(({ value, label, Icon }) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span>{label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ジャンル</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="音楽のスタイルを選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genres.map(({ value, label, Icon }) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span>{label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="feeling"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    今の気持ち (オプション)
                    <span className="ml-2 text-xs text-muted-foreground">AIがより気持ちに寄り添った曲を生成します。</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="例：新しいプロジェクトが成功して、チームみんなで喜びを分かち合っている感じ！"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-2">
              <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                {isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-primary-foreground"></div>
                    生成中...
                  </>
                ) : (
                  <>
                    <WandSparkles />
                    音楽を生成
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
