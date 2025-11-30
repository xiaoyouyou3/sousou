import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:audioplayers/audioplayers.dart';
import '../../models/song.dart';

class UserProfileScreen extends StatefulWidget {
  const UserProfileScreen({super.key});

  @override
  State<UserProfileScreen> createState() => _UserProfileScreenState();
}

class _UserProfileScreenState extends State<UserProfileScreen> {
  final User? _currentUser = FirebaseAuth.instance.currentUser;
  late final Stream<QuerySnapshot> _userSongsStream;

  @override
  void initState() {
    super.initState();
    if (_currentUser != null) {
      _userSongsStream = FirebaseFirestore.instance
          .collection('songs')
          .where('userId', isEqualTo: _currentUser.uid)
          .orderBy('createdAt', descending: true)
          .snapshots();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_currentUser == null) {
      return const Center(child: Text("Please log in to see your profile."));
    }

    return Column(
      children: [
        const SizedBox(height: 20),
        CircleAvatar(
          radius: 50,
          backgroundImage: NetworkImage(
              _currentUser.photoURL ?? 'https://example.com/default_avatar.png'),
        ),
        const SizedBox(height: 12),
        Text(
          _currentUser.displayName ?? _currentUser.email ?? 'Anonymous',
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        ElevatedButton(
          onPressed: () => FirebaseAuth.instance.signOut(),
          child: const Text('Sign Out'),
        ),
        const Divider(height: 40),
        const Text(
          'My Posts',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 10),
        Expanded(
          child: StreamBuilder<QuerySnapshot>(
            stream: _userSongsStream,
            builder: (context, snapshot) {
              if (snapshot.hasError) {
                return const Center(child: Text('Error loading songs.'));
              }
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }

              final songs = snapshot.data!.docs.map((doc) => Song.fromDocument(doc)).toList();

              if (songs.isEmpty) {
                return const Center(child: Text("You haven't posted any songs yet."));
              }

              return GridView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 8,
                  mainAxisSpacing: 8,
                ),
                itemCount: songs.length,
                itemBuilder: (context, index) {
                  return SongGridItem(song: songs[index]);
                },
              );
            },
          ),
        ),
      ],
    );
  }
}

class SongGridItem extends StatefulWidget {
  final Song song;

  const SongGridItem({super.key, required this.song});

  @override
  State<SongGridItem> createState() => _SongGridItemState();
}

class _SongGridItemState extends State<SongGridItem> {
  final AudioPlayer _audioPlayer = AudioPlayer();
  bool _isPlaying = false;

   @override
  void initState() {
    super.initState();
    _audioPlayer.onPlayerStateChanged.listen((state) {
      if (mounted) {
        setState(() {
          _isPlaying = state == PlayerState.playing;
        });
      }
    });
  }

  @override
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }

  void _togglePlay() {
    if (_isPlaying) {
      _audioPlayer.pause();
    } else {
      _audioPlayer.play(UrlSource(widget.song.songUrl));
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _togglePlay,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.grey[300],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Center(
          child: Icon(
            _isPlaying ? Icons.pause : Icons.play_arrow,
            size: 40,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}
