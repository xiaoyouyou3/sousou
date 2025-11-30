import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:audioplayers/audioplayers.dart';
import '../../models/song.dart';

class HomeFeedScreen extends StatefulWidget {
  const HomeFeedScreen({super.key});

  @override
  State<HomeFeedScreen> createState() => _HomeFeedScreenState();
}

class _HomeFeedScreenState extends State<HomeFeedScreen> {
  late final Stream<QuerySnapshot> _songsStream;

  @override
  void initState() {
    super.initState();
    _songsStream = FirebaseFirestore.instance
        .collection('songs')
        .orderBy('createdAt', descending: true)
        .snapshots();
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot>(
      stream: _songsStream,
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return const Center(child: Text('Something went wrong'));
        }

        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        final songs = snapshot.data!.docs.map((doc) => Song.fromDocument(doc)).toList();

        if (songs.isEmpty) {
          return const Center(child: Text('No songs yet. Be the first to create one!'));
        }

        return PageView.builder(
          scrollDirection: Axis.vertical,
          itemCount: songs.length,
          itemBuilder: (context, index) {
            return SongCard(song: songs[index]);
          },
        );
      },
    );
  }
}

class SongCard extends StatefulWidget {
  final Song song;

  const SongCard({super.key, required this.song});

  @override
  State<SongCard> createState() => _SongCardState();
}

class _SongCardState extends State<SongCard> {
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
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                backgroundImage: NetworkImage(widget.song.userPhotoUrl ?? 'https://example.com/default_avatar.png'),
              ),
              const SizedBox(width: 8),
              Text(
                widget.song.userDisplayName,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            'Theme: ${widget.song.theme}',
            style: const TextStyle(fontSize: 18),
          ),
           const SizedBox(height: 32),
          Center(
            child: IconButton(
              icon: Icon(_isPlaying ? Icons.pause_circle_filled : Icons.play_circle_outline, size: 80),
              onPressed: _togglePlay,
            ),
          ),
        ],
      ),
    );
  }
}
