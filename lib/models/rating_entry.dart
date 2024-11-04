class RatingEntry {
  final String id;
  final String name;
  final String address;
  Map<String, double> ratings; // userId: rating

  RatingEntry({
    required this.id,
    required this.name,
    required this.address,
    required this.ratings,
  });

  double get averageRating {
    if (ratings.isEmpty) return 0;
    return ratings.values.reduce((a, b) => a + b) / ratings.length;
  }
}
