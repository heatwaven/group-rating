import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ColorValue } from 'react-native';
import { colors, fonts } from '../../lib/ui';

const icon = (name: keyof typeof MaterialIcons.glyphMap) =>
  ({ color }: { color: ColorValue }) => <MaterialIcons name={name} size={24} color={color} />;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 12 },
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Meine Gruppen', tabBarIcon: icon('group') }} />
      <Tabs.Screen name="discover" options={{ title: 'Entdecken', tabBarIcon: icon('explore') }} />
      <Tabs.Screen name="account" options={{ title: 'Konto', tabBarIcon: icon('person') }} />
    </Tabs>
  );
}
