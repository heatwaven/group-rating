import 'package:flutter/material.dart';
import 'package:group_rating/models/rating.dart';
import 'package:uuid/uuid.dart';
import 'package:group_rating/models/entry.dart';

class AddEntryScreen extends StatefulWidget {
  final String groupId;

  const AddEntryScreen({super.key, required this.groupId});

  @override
  State<AddEntryScreen> createState() => _AddEntryScreenState();
}

class _AddEntryScreenState extends State<AddEntryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _addressController = TextEditingController();
  final _commentController = TextEditingController();
  final _uuid = Uuid();
  double _rating = 7.0;
  bool _isSubmitting = false;

  void showErrorSnackBar(String message) {
    if (mounted) {
      // Get colorScheme from the current context
      final colorScheme = Theme.of(context).colorScheme;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(
                Icons.error_outline,
                color: colorScheme.onError,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  message,
                  style: TextStyle(
                    color: colorScheme.onError,
                  ),
                ),
              ),
            ],
          ),
          backgroundColor: colorScheme.error,
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          action: SnackBarAction(
            label: 'Dismiss',
            textColor: colorScheme.onError,
            onPressed: () {
              ScaffoldMessenger.of(context).hideCurrentSnackBar();
            },
          ),
        ),
      );
    }
  }

  void showSuccessSnackBar(String message) {
    if (mounted) {
      // Get colorScheme from the current context
      final colorScheme = Theme.of(context).colorScheme;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(
                Icons.check_circle_outline,
                color: colorScheme.onPrimary,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  message,
                  style: TextStyle(
                    color: colorScheme.onPrimary,
                  ),
                ),
              ),
            ],
          ),
          backgroundColor: colorScheme.primary,
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          action: SnackBarAction(
            label: 'OK',
            textColor: colorScheme.onPrimary,
            onPressed: () {
              ScaffoldMessenger.of(context).hideCurrentSnackBar();
            },
          ),
        ),
      );
    }
  }

  void _submitEntry() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isSubmitting = true;
      });

      try {
        final userRating = Rating(
          value: _rating,
          comment: _commentController.text.trim(),
          createdAt: DateTime.now(),
          userId: 'currentUserId', // Replace with actual user ID
          userName: 'Current User', // Replace with actual user name
        );

        final newEntry = Entry(
          id: _uuid.v4(),
          name: _nameController.text,
          address: _addressController.text,
          ratings: {'currentUserId': userRating}, // Initial rating from creator
          createdAt: DateTime.now(),
          createdById: 'currentUserId', // Replace with actual user ID
        );

        if (mounted) {
          showSuccessSnackBar('Entry added successfully!');
          Navigator.pop(context, newEntry);
        }
      } catch (e) {
        if (mounted) {
          showErrorSnackBar('Error adding entry: ${e.toString()}');
        }
      } finally {
        if (mounted) {
          setState(() {
            _isSubmitting = false;
          });
        }
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _addressController.dispose();
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: colorScheme.surface,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: colorScheme.surface,
        leading: IconButton(
          icon: Icon(
            Icons.close_rounded,
            color: colorScheme.primary,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Add New Entry',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: colorScheme.onSurface,
              ),
        ),
        actions: [
          FilledButton(
            onPressed: _isSubmitting ? null : _submitEntry,
            style: FilledButton.styleFrom(
              backgroundColor: colorScheme.primary,
              foregroundColor: colorScheme.onPrimary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
            ).copyWith(
              elevation: ButtonStyleButton.allOrNull(0),
            ),
            child: _isSubmitting
                ? SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: colorScheme.onPrimary,
                    ),
                  )
                : const Text('Save'),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),
              _buildRatingSection(colorScheme),
              _buildInputForm(colorScheme),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRatingSection(ColorScheme colorScheme) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(24),
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
                _rating.toStringAsFixed(1),
                style: Theme.of(context).textTheme.displayMedium?.copyWith(
                      color: colorScheme.primary,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              Text(
                '/10',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      color: colorScheme.primary.withOpacity(0.5),
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Text(
                '1.0',
                style: TextStyle(
                  color: colorScheme.primary.withOpacity(0.5),
                  fontWeight: FontWeight.bold,
                ),
              ),
              Expanded(
                child: SliderTheme(
                  data: SliderThemeData(
                    activeTrackColor: colorScheme.primary,
                    inactiveTrackColor: colorScheme.primary.withOpacity(0.2),
                    thumbColor: colorScheme.primary,
                    overlayColor: colorScheme.primary.withOpacity(0.1),
                    trackHeight: 4,
                  ),
                  child: Slider(
                    value: _rating,
                    min: 1.0,
                    max: 10.0,
                    divisions: 90, // For 0.1 increments
                    onChanged: (value) {
                      setState(() {
                        _rating = value;
                      });
                    },
                  ),
                ),
              ),
              Text(
                '10.0',
                style: TextStyle(
                  color: colorScheme.primary.withOpacity(0.5),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Slide to rate or tap number to edit',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: colorScheme.primary.withOpacity(0.5),
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputForm(ColorScheme colorScheme) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildTextField(
            controller: _nameController,
            label: 'Name',
            hint: 'e.g., Pizza Palace',
            icon: Icons.storefront_rounded,
            colorScheme: colorScheme,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter a name';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _addressController,
            label: 'Address',
            hint: 'e.g., 123 Main Street',
            icon: Icons.location_on_rounded,
            colorScheme: colorScheme,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter an address';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _commentController,
            label: 'Comments',
            hint: 'Share your thoughts...',
            icon: Icons.comment_rounded,
            colorScheme: colorScheme,
            maxLines: 4,
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    required ColorScheme colorScheme,
    String? Function(String?)? validator,
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: colorScheme.onSurface,
              ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          validator: validator,
          maxLines: maxLines,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(
              color: colorScheme.onSurface.withOpacity(0.5),
            ),
            prefixIcon: Icon(
              icon,
              color: colorScheme.primary,
            ),
            filled: true,
            fillColor: colorScheme.surface,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: colorScheme.outline.withOpacity(0.3),
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: colorScheme.outline.withOpacity(0.3),
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: colorScheme.primary,
                width: 2,
              ),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: colorScheme.error,
              ),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: colorScheme.error,
                width: 2,
              ),
            ),
            contentPadding: const EdgeInsets.all(16),
          ),
        ),
      ],
    );
  }
}
