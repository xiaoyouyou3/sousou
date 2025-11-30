import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/song.dart';

class CreateSongScreen extends StatefulWidget {
  const CreateSongScreen({super.key});

  @override
  State<CreateSongScreen> createState() => _CreateSongScreenState();
}

class _CreateSongScreenState extends State<CreateSongScreen> {
  final _themeController = TextEditingController();
  bool _isGenerating = false;
  bool _isPosting = false;
  String? _generatedSongUrl;

  void _generateSong() {
    if (_themeController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a theme first!')),
      );
      return;
    }
    // TODO: Implement AI music generation logic with a backend call
    setState(() {
      _isGenerating = true;
    });

    // Simulate network request
    Future.delayed(const Duration(seconds: 3), () {
      setState(() {
        _isGenerating = false;
        _generatedSongUrl = "https://firebasestorage.googleapis.com/v0/b/your-project-id.appspot.com/o/sample_song.mp3?alt=media";
      });
    });
  }

  Future<void> _postSong() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('You must be logged in to post.')),
      );
      return;
    }

    if (_generatedSongUrl == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No song has been generated yet.')),
      );
      return;
    }

    setState(() {
      _isPosting = true;
    });

    try {
      final newSong = Song(
        id: '', // Firestore will generate this
        userId: user.uid,
        userDisplayName: user.displayName ?? user.email ?? 'Anonymous',
        userPhotoUrl: user.photoURL,
        theme: _themeController.text.trim(),
        songUrl: _generatedSongUrl!,
        createdAt: Timestamp.now(),
        likes: 0,
      );

      await FirebaseFirestore.instance.collection('songs').add(newSong.toMap());

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Song posted successfully!')),
      );

      // Reset screen
      setState(() {
        _themeController.clear();
        _generatedSongUrl = null;
      });

    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to post song: $e')),
      );
    } finally {
      setState(() {
        _isPosting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            '今の気持ちを音楽にしよう',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _themeController,
            decoration: const InputDecoration(
              labelText: 'テーマやムード (例：夏の終わりの夕暮れ)',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: _isGenerating || _isPosting ? null : _generateSong,
            icon: const Icon(Icons.auto_awesome),
            label: Text(_isGenerating ? '作曲中...' : 'AIで作曲する'),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
          ),
          const SizedBox(height: 32),
          if (_isGenerating)
            const Center(child: CircularProgressIndicator()),
          if (_generatedSongUrl != null)
            Column(
              children: [
                const Text(
                  '曲が完成しました！',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 16),
                const Icon(Icons.music_note, size: 60),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: _isPosting ? null : _postSong,
                  icon: _isPosting 
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 3)) 
                      : const Icon(Icons.send),
                  label: const Text('投稿する'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }
}
