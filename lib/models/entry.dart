import 'package:group_rating/models/rating.dart';

class Entry {
  final String id;
  final String name;
  final String address;
  final Map<String, Rating> ratings;
  final DateTime createdAt;
  final String createdById;

  Entry({
    required this.id,
    required this.name,
    required this.address,
    Map<String, Rating>? ratings,
    required this.createdAt,
    required this.createdById,
  }) : ratings = ratings ?? {};

  // Prüft ob ein Benutzer bereits bewertet hat
  bool hasUserRated(String userId) {
    return ratings.containsKey(userId);
  }

  // Getter für den Durchschnitt aller Ratings
  double get averageRating {
    if (ratings.isEmpty) return 0.0;
    final sum = ratings.values.map((r) => r.value).reduce((a, b) => a + b);
    return sum / ratings.length;
  }

  // Optional: Getter für die Anzahl der Ratings
  int get ratingCount => ratings.length;

  // Optional: Getter für die Verteilung der Ratings
  Map<int, int> get ratingDistribution {
    final distribution = <int, int>{};
    for (final rating in ratings.values) {
      final roundedRating = rating.value.round();
      distribution[roundedRating] = (distribution[roundedRating] ?? 0) + 1;
    }
    return distribution;
  }

  // JSON Serialisierung
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'address': address,
      'ratings': ratings.map((key, value) => MapEntry(key, value.toJson())),
      'createdAt': createdAt.toIso8601String(),
      'createdById': createdById,
    };
  }

  // JSON Deserialisierung
  factory Entry.fromJson(Map<String, dynamic> json) {
    return Entry(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      address: json['address'] as String? ?? '',
      ratings: (json['ratings'] as Map<String, dynamic>?)?.map(
            (key, value) => MapEntry(
              key,
              Rating.fromJson(value as Map<String, dynamic>),
            ),
          ) ??
          {},
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      createdById: json['createdById'] as String? ?? '',
    );
  }

  // Hilfsmethode zum Kopieren mit Änderungen
  Entry copyWith({
    String? id,
    String? name,
    String? address,
    Map<String, Rating>? ratings,
    DateTime? createdAt,
    String? createdById,
  }) {
    return Entry(
      id: id ?? this.id,
      name: name ?? this.name,
      address: address ?? this.address,
      ratings: ratings ?? Map.from(this.ratings),
      createdAt: createdAt ?? this.createdAt,
      createdById: createdById ?? this.createdById,
    );
  }
}
