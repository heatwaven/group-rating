import 'package:group_rating/models/entry.dart';

class Group {
  final String id;
  final String name;
  final List<String> memberIds;
  final List<Entry> entries;
  final DateTime createdAt;
  final String createdById;

  Group({
    required this.id,
    required this.name,
    required this.memberIds,
    List<Entry>? entries,
    DateTime? createdAt,
    required this.createdById,
  })  : entries = entries ?? [],
        createdAt = createdAt ?? DateTime.now();

  // Getter für Statistiken
  double get averageRating {
    if (entries.isEmpty) return 0.0;
    final validEntries = entries.where((e) => e.averageRating > 0).toList();
    if (validEntries.isEmpty) return 0.0;
    return validEntries.map((e) => e.averageRating).reduce((a, b) => a + b) /
        validEntries.length;
  }

  int get totalRatings {
    return entries.fold(0, (sum, entry) => sum + entry.ratings.length);
  }

  bool hasMember(String userId) {
    return memberIds.contains(userId);
  }

  bool isAdmin(String userId) {
    return createdById == userId;
  }

  // Hilfsmethoden für Entry-Management
  void addEntry(Entry entry) {
    entries.add(entry);
  }

  void updateEntry(Entry updatedEntry) {
    final index = entries.indexWhere((e) => e.id == updatedEntry.id);
    if (index != -1) {
      entries[index] = updatedEntry;
    }
  }

  void removeEntry(String entryId) {
    entries.removeWhere((e) => e.id == entryId);
  }

  // Member Management
  void addMember(String userId) {
    if (!memberIds.contains(userId)) {
      memberIds.add(userId);
    }
  }

  void removeMember(String userId) {
    memberIds.remove(userId);
  }

  // JSON Serialisierung
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'memberIds': memberIds,
      'entries': entries.map((e) => e.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'createdById': createdById,
    };
  }

  factory Group.fromJson(Map<String, dynamic> json) {
    return Group(
      id: json['id'],
      name: json['name'],
      memberIds: List<String>.from(json['memberIds']),
      entries: (json['entries'] as List)
          .map((e) => Entry.fromJson(e as Map<String, dynamic>))
          .toList(),
      createdAt: DateTime.parse(json['createdAt']),
      createdById: json['createdById'],
    );
  }

  // Kopieren mit Änderungen
  Group copyWith({
    String? id,
    String? name,
    List<String>? memberIds,
    List<Entry>? entries,
    DateTime? createdAt,
    String? createdById,
  }) {
    return Group(
      id: id ?? this.id,
      name: name ?? this.name,
      memberIds: memberIds ?? List.from(this.memberIds),
      entries: entries ?? List.from(this.entries),
      createdAt: createdAt ?? this.createdAt,
      createdById: createdById ?? this.createdById,
    );
  }

  // Sortierte Einträge
  List<Entry> getEntriesSorted({
    required SortCriteria criteria,
    bool ascending = true,
  }) {
    final sortedEntries = List<Entry>.from(entries);
    switch (criteria) {
      case SortCriteria.date:
        sortedEntries.sort((a, b) => ascending
            ? a.createdAt.compareTo(b.createdAt)
            : b.createdAt.compareTo(a.createdAt));
        break;
      case SortCriteria.rating:
        sortedEntries.sort((a, b) => ascending
            ? a.averageRating.compareTo(b.averageRating)
            : b.averageRating.compareTo(a.averageRating));
        break;
      case SortCriteria.name:
        sortedEntries.sort((a, b) =>
            ascending ? a.name.compareTo(b.name) : b.name.compareTo(a.name));
        break;
      case SortCriteria.popularity:
        sortedEntries.sort((a, b) => ascending
            ? a.ratings.length.compareTo(b.ratings.length)
            : b.ratings.length.compareTo(a.ratings.length));
        break;
    }
    return sortedEntries;
  }
}

// Enum für Sortierkriterien
enum SortCriteria {
  date,
  rating,
  name,
  popularity,
}
