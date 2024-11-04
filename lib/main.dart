import 'package:flutter/material.dart';
import 'package:group_rating/screens/groups/groups_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Rating Groups App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        // Add some nice visual defaults
        useMaterial3: true, // Use Material 3 design
        appBarTheme: const AppBarTheme(
          centerTitle: true,
          elevation: 0,
          backgroundColor: Colors.blue,
          foregroundColor: Colors.white,
        ),
        // Make FABs match the primary color
        floatingActionButtonTheme: const FloatingActionButtonThemeData(
          backgroundColor: Colors.blue,
          foregroundColor: Colors.white,
        ),
      ),
      home: GroupsScreen(),
      // Add debug banner removal if you want
      debugShowCheckedModeBanner: false,
    );
  }
}
