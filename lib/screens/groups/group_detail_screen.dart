import 'package:flutter/material.dart';
import 'package:group_rating/models/entry.dart';
import 'package:group_rating/models/group.dart';
import 'package:group_rating/screens/groups/add_entry_screen.dart';
import 'package:group_rating/screens/groups/entry_detail_screen.dart';

class GroupDetailScreen extends StatefulWidget {
  final Group group;

  const GroupDetailScreen({super.key, required this.group});

  @override
  State<GroupDetailScreen> createState() => _GroupDetailScreenState();
}

class _GroupDetailScreenState extends State<GroupDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late List<Entry> entries;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    entries = widget.group.entries;
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _showAddMemberDialog() async {
    final TextEditingController memberController = TextEditingController();

    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Add Member'),
        content: TextField(
          controller: memberController,
          decoration: InputDecoration(hintText: "Member name"),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              if (memberController.text.isNotEmpty) {
                setState(() {
                  widget.group.memberIds.add(memberController.text);
                });
                Navigator.pop(context);
              }
            },
            child: Text('Add'),
          ),
        ],
      ),
    );
  }

  void _showMoreOptions() {
    final colorScheme = Theme.of(context).colorScheme;

    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: Icon(Icons.edit_rounded, color: colorScheme.primary),
              title: Text('Edit Group'),
              onTap: () {
                // TODO: Implement edit group
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: Icon(Icons.delete_rounded, color: colorScheme.error),
              title: Text('Delete Group'),
              onTap: () {
                // TODO: Implement delete group
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _handleNewEntry() async {
    final Entry? newEntry = await Navigator.push<Entry>(
      context,
      MaterialPageRoute(
        builder: (context) => AddEntryScreen(groupId: widget.group.id),
      ),
    );

    if (newEntry != null) {
      setState(() {
        entries.add(newEntry);
      });
    }
  }

  void _showEntryOptions(Entry entry) {
    final colorScheme = Theme.of(context).colorScheme;

    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: Icon(Icons.edit_rounded, color: colorScheme.primary),
              title: Text('Edit Entry'),
              onTap: () {
                // TODO: Implement edit entry
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: Icon(Icons.delete_rounded, color: colorScheme.error),
              title: Text('Delete Entry'),
              onTap: () {
                setState(() {
                  entries.remove(entry);
                });
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showEntryDetail(Entry entry) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EntryDetailScreen(
          entry: entry,
          currentUserId:
              'user1', // Ersetzen Sie dies mit der tatsächlichen User ID
          onEntryUpdated: (updatedEntry) {
            setState(() {
              final index = entries.indexWhere((e) => e.id == updatedEntry.id);
              if (index != -1) {
                entries[index] = updatedEntry;
              }
            });
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: colorScheme.background,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: colorScheme.background,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_new_rounded,
            color: colorScheme.primary,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.group.name,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: colorScheme.onBackground,
                  ),
            ),
            Text(
              '${widget.group.entries.length} ${widget.group.entries.length == 1 ? 'entry' : 'entries'} • ${widget.group.memberIds.length} ${widget.group.memberIds.length == 1 ? 'member' : 'members'}',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onBackground.withOpacity(0.7),
                  ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(
              Icons.person_add_rounded,
              color: colorScheme.primary,
            ),
            tooltip: 'Add Member',
            onPressed: () {
              // Show add member dialog
            },
          ),
          IconButton(
            icon: Icon(
              Icons.more_vert_rounded,
              color: colorScheme.primary,
            ),
            tooltip: 'More Options',
            onPressed: () {
              // Show more options menu
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: colorScheme.primary,
          indicatorWeight: 3,
          labelColor: colorScheme.primary,
          unselectedLabelColor: colorScheme.onBackground.withOpacity(0.7),
          labelStyle: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
          tabs: const [
            Tab(
              icon: Icon(Icons.rate_review_rounded),
              text: 'Entries',
            ),
            Tab(
              icon: Icon(Icons.people_rounded),
              text: 'Members',
            ),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Entries Tab
          entries.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.rate_review_rounded,
                        size: 64,
                        color: colorScheme.primary.withOpacity(0.5),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No Entries Yet',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              color: colorScheme.onBackground.withOpacity(0.7),
                            ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Add your first rating by tapping the + button',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: colorScheme.onBackground.withOpacity(0.5),
                            ),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: entries.length,
                  itemBuilder: (context, index) {
                    final entry = entries[index];
                    return InkWell(
                      onTap: () => _showEntryDetail(entry),
                      child: _buildEntryCard(context, entry, colorScheme),
                    );
                  },
                ),

          // Members Tab
          widget.group.memberIds.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.people_rounded,
                        size: 64,
                        color: colorScheme.primary.withOpacity(0.5),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No Members Yet',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              color: colorScheme.onBackground.withOpacity(0.7),
                            ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Add members by tapping the person icon above',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: colorScheme.onBackground.withOpacity(0.5),
                            ),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: widget.group.memberIds.length,
                  itemBuilder: (context, index) {
                    final member = widget.group.memberIds[index];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: colorScheme.surface,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: colorScheme.shadow.withOpacity(0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(16),
                        leading: CircleAvatar(
                          backgroundColor: colorScheme.primaryContainer,
                          radius: 24,
                          child: Text(
                            member[0],
                            style: TextStyle(
                              color: colorScheme.primary,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                        title: Text(
                          member,
                          style:
                              Theme.of(context).textTheme.titleMedium?.copyWith(
                                    color: colorScheme.onSurface,
                                    fontWeight: FontWeight.w500,
                                  ),
                        ),
                        trailing: IconButton(
                          icon: Icon(
                            Icons.more_vert_rounded,
                            color: colorScheme.onSurface.withOpacity(0.5),
                          ),
                          onPressed: () {
                            // Show member options
                          },
                        ),
                      ),
                    );
                  },
                ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed:
            _tabController.index == 0 ? _handleNewEntry : _showAddMemberDialog,
        icon: Icon(
          _tabController.index == 0
              ? Icons.add_rounded
              : Icons.person_add_rounded,
          color: colorScheme.onPrimary,
        ),
        label: Text(
          _tabController.index == 0 ? 'Add Entry' : 'Add Member',
          style: TextStyle(
            color: colorScheme.onPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: colorScheme.primary,
      ),
    );
  }

  Widget _buildEntryCard(
      BuildContext context, Entry entry, ColorScheme colorScheme) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            entry.name,
                            style: Theme.of(context)
                                .textTheme
                                .titleLarge
                                ?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: colorScheme.onSurface,
                                ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            entry.address,
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                                  color: colorScheme.onSurface.withOpacity(0.7),
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
                            size: 20,
                            color: colorScheme.primary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            entry.averageRating.toStringAsFixed(
                                1), // Verwendet die averageRating getter-Methode
                            style: Theme.of(context)
                                .textTheme
                                .titleMedium
                                ?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: colorScheme.primary,
                                ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '(${entry.ratings.length})', // Optional: Zeigt die Anzahl der Bewertungen
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(
                                  color: colorScheme.primary.withOpacity(0.7),
                                ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
