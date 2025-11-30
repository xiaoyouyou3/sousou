import 'package:cloud_firestore/cloud_firestore.dart';

class Song {
  final String id;
  final String userId;
  final String userDisplayName;
  final String? userPhotoUrl;
  final String theme;
  final String songUrl;
  final Timestamp createdAt;
  final int likes;

  Song({
    required this.id,
    required this.userId,
    required this.userDisplayName,
    this.userPhotoUrl,
    required this.theme,
    required this.songUrl,
    required this.createdAt,
    this.likes = 0,
  });

  // Firestore document to Song object
  factory Song.fromDocument(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Song(
      id: doc.id,
      userId: data['userId'] ?? '',
      userDisplayName: data['userDisplayName'] ?? 'Anonymous',
      userPhotoUrl: data['userPhotoUrl'],
      theme: data['theme'] ?? '',
      songUrl: data['songUrl'] ?? '',
      createdAt: data['createdAt'] ?? Timestamp.now(),
      likes: data['likes'] ?? 0,
    );
  }

  // Song object to map for Firestore
  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'userDisplayName': userDisplayName,
      'userPhotoUrl': userPhotoUrl,
      'theme': theme,
      'songUrl': songUrl,
      'createdAt': createdAt,
      'likes': likes,
    };
  }
}
