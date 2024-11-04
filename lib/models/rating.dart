class Rating {
  final double value;
  final String comment;
  final DateTime createdAt;
  final String userId;
  final String userName;

  Rating({
    required this.value,
    required this.comment,
    required this.createdAt,
    required this.userId,
    required this.userName,
  });

  Map<String, dynamic> toJson() {
    return {
      'value': value,
      'comment': comment,
      'createdAt': createdAt.toIso8601String(),
      'userId': userId,
      'userName': userName,
    };
  }

  factory Rating.fromJson(Map<String, dynamic> json) {
    return Rating(
      value: json['value'],
      comment: json['comment'],
      createdAt: DateTime.parse(json['createdAt']),
      userId: json['userId'],
      userName: json['userName'],
    );
  }
}
