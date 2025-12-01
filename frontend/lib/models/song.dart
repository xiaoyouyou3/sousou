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
    required this.likes,
  });

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

  factory Song.fromMap(Map<String, dynamic> map, String documentId) {
    return Song(
      id: documentId,
      userId: map['userId'] ?? '',
      userDisplayName: map['userDisplayName'] ?? '',
      userPhotoUrl: map['userPhotoUrl'],
      theme: map['theme'] ?? '',
      songUrl: map['songUrl'] ?? '',
      createdAt: map['createdAt'] ?? Timestamp.now(),
      likes: map['likes']?.toInt() ?? 0,
    );
  }
}
