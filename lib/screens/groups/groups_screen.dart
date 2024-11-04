import 'package:flutter/material.dart';
import 'package:group_rating/models/group.dart';
import 'package:group_rating/screens/groups/create_group_screen.dart';
import 'package:group_rating/screens/groups/group_detail_screen.dart';

class GroupsScreen extends StatefulWidget {
  @override
  _GroupsScreenState createState() => _GroupsScreenState();
}

class _GroupsScreenState extends State<GroupsScreen> {
  List<Group> groups = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadGroups();
  }

  Future<void> _loadGroups() async {
    setState(() => isLoading = true);

    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 500));

    // TODO: Replace with actual data fetching logic
    setState(() {
      groups = [
        Group(
          id: '1',
          name: 'Pizza Reviews',
          memberIds: ['user1', 'user2'],
          entries: [],
          createdById: 'user1', // Der Ersteller der Gruppe
          createdAt: DateTime.now()
              .subtract(const Duration(days: 7)), // Beispiel-Datum
        ),
        Group(
          id: '2',
          name: 'Coffee Shops',
          memberIds: ['user1', 'user3'],
          entries: [],
          createdById: 'user1',
          createdAt: DateTime.now().subtract(const Duration(days: 3)),
        ),
      ];
      isLoading = false;
    });
  }

  void _addNewGroup(Group newGroup) {
    setState(() {
      groups.add(newGroup);
    });
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: colorScheme.background,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: colorScheme.background,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'My Rating Groups',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: colorScheme.onBackground,
                  ),
            ),
            Text(
              '${groups.length} ${groups.length == 1 ? 'group' : 'groups'}',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onBackground.withOpacity(0.7),
                  ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(
              Icons.refresh_rounded,
              color: colorScheme.primary,
            ),
            onPressed: _loadGroups,
          ),
        ],
      ),
      body: isLoading
          ? Center(
              child: CircularProgressIndicator(
                color: colorScheme.primary,
              ),
            )
          : groups.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.group_rounded,
                        size: 64,
                        color: colorScheme.primary.withOpacity(0.5),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No Groups Yet',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              color: colorScheme.onBackground.withOpacity(0.7),
                            ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Create your first group by tapping the + button',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: colorScheme.onBackground.withOpacity(0.5),
                            ),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadGroups,
                  color: colorScheme.primary,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: groups.length,
                    itemBuilder: (context, index) {
                      final group = groups[index];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: colorScheme.surface,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: colorScheme.shadow.withOpacity(0.05),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(16),
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) =>
                                      GroupDetailScreen(group: group),
                                ),
                              );
                            },
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Row(
                                children: [
                                  Container(
                                    width: 48,
                                    height: 48,
                                    decoration: BoxDecoration(
                                      color: colorScheme.primaryContainer,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Center(
                                      child: Icon(
                                        _getGroupIcon(group.name),
                                        color: colorScheme.primary,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          group.name,
                                          style: Theme.of(context)
                                              .textTheme
                                              .titleMedium
                                              ?.copyWith(
                                                fontWeight: FontWeight.bold,
                                                color: colorScheme.onSurface,
                                              ),
                                        ),
                                        const SizedBox(height: 4),
                                        Row(
                                          children: [
                                            Icon(
                                              Icons.people_rounded,
                                              size: 16,
                                              color: colorScheme.onSurface
                                                  .withOpacity(0.5),
                                            ),
                                            const SizedBox(width: 4),
                                            Text(
                                              '${group.memberIds.length} ${group.memberIds.length == 1 ? 'member' : 'members'}',
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyMedium
                                                  ?.copyWith(
                                                    color: colorScheme.onSurface
                                                        .withOpacity(0.7),
                                                  ),
                                            ),
                                            const SizedBox(width: 16),
                                            Icon(
                                              Icons.star_rounded,
                                              size: 16,
                                              color: colorScheme.onSurface
                                                  .withOpacity(0.5),
                                            ),
                                            const SizedBox(width: 4),
                                            Text(
                                              '${group.entries.length} ${group.entries.length == 1 ? 'rating' : 'ratings'}',
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyMedium
                                                  ?.copyWith(
                                                    color: colorScheme.onSurface
                                                        .withOpacity(0.7),
                                                  ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                  Icon(
                                    Icons.chevron_right_rounded,
                                    color:
                                        colorScheme.onSurface.withOpacity(0.5),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final Group? newGroup = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => CreateGroupScreen(),
            ),
          );

          if (newGroup != null) {
            _addNewGroup(newGroup);
          }
        },
        icon: Icon(
          Icons.add_rounded,
          color: colorScheme.onPrimary,
        ),
        label: Text(
          'Create Group',
          style: TextStyle(
            color: colorScheme.onPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: colorScheme.primary,
      ),
    );
  }

  IconData _getGroupIcon(String groupName) {
    final nameLower = groupName.toLowerCase();
    if (nameLower.contains('pizza') || nameLower.contains('food')) {
      return Icons.local_pizza_rounded;
    } else if (nameLower.contains('coffee') || nameLower.contains('cafe')) {
      return Icons.coffee_rounded;
    } else if (nameLower.contains('movie') || nameLower.contains('film')) {
      return Icons.movie_rounded;
    } else if (nameLower.contains('book') || nameLower.contains('read')) {
      return Icons.book_rounded;
    } else if (nameLower.contains('game') || nameLower.contains('gaming')) {
      return Icons.sports_esports_rounded;
    }
    return Icons.star_rounded;
  }
}
