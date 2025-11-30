import 'package:flutter/material.dart';
import 'home_screen.dart';

// In-memory user store for demonstration purposes
final Map<String, String> _users = {};

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('ようこそ'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'サインイン'),
              Tab(text: '新規登録'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            SignInForm(),
            SignUpForm(),
          ],
        ),
      ),
    );
  }
}

class SignInForm extends StatefulWidget {
  const SignInForm({super.key});

  @override
  State<SignInForm> createState() => _SignInFormState();
}

class _SignInFormState extends State<SignInForm> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  void _signIn() {
    if (_formKey.currentState!.validate()) {
      final email = _emailController.text;
      final password = _passwordController.text;

      if (_users.containsKey(email) && _users[email] == password) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const HomeScreen()),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('メールアドレスまたはパスワードが違います。')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextFormField(
              controller: _emailController,
              decoration: const InputDecoration(labelText: 'メールアドレス'),
              validator: (value) {
                if (value == null || value.isEmpty || !value.contains('@')) {
                  return '有効なメールアドレスを入力してください。';
                }
                return null;
              },
            ),
            TextFormField(
              controller: _passwordController,
              decoration: const InputDecoration(labelText: 'パスワード'),
              obscureText: true,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'パスワードを入力してください。';
                }
                return null;
              },
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _signIn,
              child: const Text('サインイン'),
            ),
          ],
        ),
      ),
    );
  }
}

class SignUpForm extends StatefulWidget {
  const SignUpForm({super.key});

  @override
  State<SignUpForm> createState() => _SignUpFormState();
}

class _SignUpFormState extends State<SignUpForm> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  void _signUp() {
    if (_formKey.currentState!.validate()) {
      final email = _emailController.text;
      final password = _passwordController.text;
      
      if (_users.containsKey(email)) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('このメールアドレスは既に使用されています。')),
        );
        return;
      }

      // Save to in-memory store
      _users[email] = password;
      
      print('New user registered: $email'); // For debugging

      // Navigate to home screen
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const HomeScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextFormField(
              controller: _emailController,
              decoration: const InputDecoration(labelText: 'メールアドレス'),
              validator: (value) {
                if (value == null || value.isEmpty || !value.contains('@')) {
                  return '有効なメールアドレスを入力してください。';
                }
                return null;
              },
            ),
            TextFormField(
              controller: _passwordController,
              decoration: const InputDecoration(labelText: 'パスワード'),
              obscureText: true,
              validator: (value) {
                if (value == null || value.isEmpty || value.length < 8) {
                  return 'パスワードは8文字以上で入力してください。';
                }
                // Simplified policy for now
                return null;
              },
            ),
            TextFormField(
              controller: _confirmPasswordController,
              decoration: const InputDecoration(labelText: 'パスワード（確認）'),
              obscureText: true,
              validator: (value) {
                if (value != _passwordController.text) {
                  return 'パスワードが一致しません。';
                }
                return null;
              },
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _signUp,
              child: const Text('新規登録'),
            ),
          ],
        ),
      ),
    );
  }
}