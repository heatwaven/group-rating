import 'package:flutter/material.dart';
import 'package:group_rating/models/entry.dart';
import 'package:group_rating/models/rating.dart';
import 'package:group_rating/widgets/ratings/add_rating_dialog.dart';

class EntryDetailScreen extends StatelessWidget {
  final Entry entry;
  final String currentUserId;
  final Function(Entry) onEntryUpdated;

  const EntryDetailScreen({
    super.key,
    required this.entry,
    required this.currentUserId,
    required this.onEntryUpdated,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final ratings = entry.ratings.values.toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

    return Scaffold(
      backgroundColor: colorScheme.surface,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: colorScheme.surface,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_new_rounded,
            color: colorScheme.primary,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          entry.name,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: colorScheme.onSurface,
              ),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: colorScheme.primaryContainer.withOpacity(0.3),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        entry.averageRating.toStringAsFixed(1),
                        style:
                            Theme.of(context).textTheme.displayMedium?.copyWith(
                                  color: colorScheme.primary,
                                  fontWeight: FontWeight.bold,
                                ),
                      ),
                      Text(
                        '/10',
                        style: Theme.of(context)
                            .textTheme
                            .headlineMedium
                            ?.copyWith(
                              color: colorScheme.primary.withOpacity(0.5),
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${entry.ratings.length} ${entry.ratings.length == 1 ? 'rating' : 'ratings'}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: colorScheme.primary.withOpacity(0.7),
                        ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Icon(
                    Icons.location_on_rounded,
                    size: 20,
                    color: colorScheme.primary,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    entry.address,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: colorScheme.onBackground,
                        ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                'Ratings & Reviews',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: colorScheme.onBackground,
                    ),
              ),
            ),
            const SizedBox(height: 16),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: ratings.length,
              itemBuilder: (context, index) {
                final rating = ratings[index];
                final isCurrentUser = rating.userId == currentUserId;

                return Container(
                  margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: colorScheme.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: isCurrentUser
                        ? Border.all(color: colorScheme.primary, width: 2)
                        : null,
                    boxShadow: [
                      BoxShadow(
                        color: colorScheme.shadow.withOpacity(0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            backgroundColor: colorScheme.primaryContainer,
                            child: Text(
                              rating.userName[0],
                              style: TextStyle(
                                color: colorScheme.primary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  rating.userName,
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleMedium
                                      ?.copyWith(
                                        fontWeight: FontWeight.bold,
                                        color: colorScheme.onSurface,
                                      ),
                                ),
                                Text(
                                  _formatDate(rating.createdAt),
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(
                                        color: colorScheme.onSurface
                                            .withOpacity(0.5),
                                      ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: colorScheme.primaryContainer,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.star_rounded,
                                  size: 16,
                                  color: colorScheme.primary,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  rating.value.toStringAsFixed(1),
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleMedium
                                      ?.copyWith(
                                        fontWeight: FontWeight.bold,
                                        color: colorScheme.primary,
                                      ),
                                ),
                              ],
                            ),
                          ),
                          if (isCurrentUser) ...[
                            const SizedBox(width: 8),
                            IconButton(
                              icon: Icon(
                                Icons.edit_rounded,
                                color: colorScheme.primary,
                              ),
                              onPressed: () =>
                                  _showRatingDialog(context, rating),
                            ),
                          ],
                        ],
                      ),
                      if (rating.comment.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Text(
                          rating.comment,
                          style:
                              Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: colorScheme.onSurface,
                                  ),
                        ),
                      ],
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
      floatingActionButton: !entry.hasUserRated(currentUserId)
          ? FloatingActionButton.extended(
              onPressed: () => _showRatingDialog(context, null),
              icon: Icon(
                Icons.rate_review_rounded,
                color: colorScheme.onPrimary,
              ),
              label: Text(
                'Add Rating',
                style: TextStyle(
                  color: colorScheme.onPrimary,
                  fontWeight: FontWeight.bold,
                ),
              ),
              backgroundColor: colorScheme.primary,
            )
          : null,
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  Future<void> _showRatingDialog(
      BuildContext context, Rating? existingRating) async {
    final result = await showDialog<Rating>(
      context: context,
      builder: (context) => AddRatingDialog(
        existingRating: existingRating,
        currentUserId: currentUserId,
      ),
    );

    if (result != null) {
      final updatedEntry = Entry(
        id: entry.id,
        name: entry.name,
        address: entry.address,
        ratings: Map.from(entry.ratings)..['userId'] = result,
        createdAt: entry.createdAt,
        createdById: entry.createdById,
      );
      onEntryUpdated(updatedEntry);
    }
  }
}
