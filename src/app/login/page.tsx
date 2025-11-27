'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { FirebaseError } from 'firebase/app';
import { Music } from 'lucide-react';
import { useEffect } from 'react';

const FormSchema = z.object({
  email: z.string().email({ message: '有効なメールアドレスを入力してください。' }),
  password: z.string().min(6, { message: 'パスワードは6文字以上で入力してください。' }),
});

type FormValues = z.infer<typeof FormSchema>;

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);


  const handleAuthError = (error: FirebaseError) => {
    setIsSubmitting(false);
    switch (error.code) {
      case 'auth/user-not-found':
        setAuthError('このメールアドレスのユーザーは見つかりませんでした。');
        break;
      case 'auth/wrong-password':
        setAuthError('パスワードが間違っています。');
        break;
      case 'auth/email-already-in-use':
        setAuthError('このメールアドレスは既に使用されています。');
        break;
      case 'auth/invalid-email':
        setAuthError('無効なメールアドレスです。');
        break;
      default:
        setAuthError('エラーが発生しました。もう一度お試しください。');
        break;
    }
  };

  const handleSignUp = async (values: FormValues) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await initiateEmailSignUp(auth, values.email, values.password);
      // The onAuthStateChanged listener in the provider will handle the redirect
    } catch (error) {
       if (error instanceof FirebaseError) {
         handleAuthError(error);
       } else {
         setIsSubmitting(false);
         setAuthError('予期せぬエラーが発生しました。');
       }
    }
  };

  const handleLogin = async (values: FormValues) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await initiateEmailSignIn(auth, values.email, values.password);
      // The onAuthStateChanged listener in the provider will handle the redirect
    } catch (error) {
       if (error instanceof FirebaseError) {
         handleAuthError(error);
       } else {
         setIsSubmitting(false);
         setAuthError('予期せぬエラーが発生しました。');
       }
    }
  };

  if (isUserLoading || user) {
    return (
       <div className="flex h-screen w-full flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">読み込み中...</p>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
       <div className="mb-6 flex flex-col items-center text-center">
         <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary p-3">
           <Music className="h-8 w-8 text-primary-foreground" />
         </div>
         <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
           TuneFlowへようこそ
         </h1>
       </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">ログインまたは新規登録</CardTitle>
          <CardDescription>
            メールアドレスとパスワードを入力してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メールアドレス</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>パスワード</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {authError && (
                <p className="text-sm font-medium text-destructive">{authError}</p>
              )}

              <div className="flex flex-col space-y-2 pt-2">
                 <Button 
                    type="button" 
                    onClick={form.handleSubmit(handleLogin)}
                    className="w-full"
                    disabled={isSubmitting}>
                    {isSubmitting ? '処理中...' : 'ログイン'}
                </Button>
                <Button 
                    type="button" 
                    onClick={form.handleSubmit(handleSignUp)}
                    variant="outline" 
                    className="w-full"
                    disabled={isSubmitting}>
                    {isSubmitting ? '処理中...' : '新規登録'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
