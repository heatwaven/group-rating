import { MaterialIcons } from '@expo/vector-icons';
import { ReactNode, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import type { Category } from './supabase';

type IconName = keyof typeof MaterialIcons.glyphMap;

// Design-Tokens aus Stitch ("Warm Social Tasting")
export const colors = {
  primary: '#a23a00',
  primaryContainer: '#cb4a00',
  primarySoft: '#ffdbce',
  onPrimary: '#ffffff',
  bg: '#fff8f5',
  card: '#ffffff',
  text: '#221a14',
  muted: '#5a4138',
  outline: '#8e7166',
  placeholder: '#a89b91',
  border: '#f0e6de',
  surfaceLow: '#fff1e9',
  surface: '#fbebe1',
  surfaceHigh: '#f5e5dc',
  star: '#f5a524',
  starEmpty: '#e8ddd5',
  goldSoft: '#ffddb5',
  secondary: '#835400',
  publicBg: '#ebfbee',
  publicText: '#2b8a3e',
  privateBg: '#f3f4f6',
  privateText: '#4b5563',
  error: '#ba1a1a',
  errorSoft: '#ffdad6',
};

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
};

export const t = StyleSheet.create({
  h1: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 34, letterSpacing: -0.5, color: colors.text },
  h2: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 28, letterSpacing: -0.2, color: colors.text },
  h3: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 24, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.text },
  bodyMuted: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.muted },
  small: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: colors.muted },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 18, color: colors.text },
  labelSm: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.2, color: colors.muted },
  overline: { fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted },
  score: { fontFamily: fonts.extrabold, fontSize: 32, lineHeight: 38, letterSpacing: -0.6, color: colors.primary },
});

export const CATEGORIES: { key: Category; label: string; icon: IconName }[] = [
  { key: 'food', label: 'Essen & Restaurants', icon: 'restaurant' },
  { key: 'cafe', label: 'Cafés & Röstereien', icon: 'local-cafe' },
  { key: 'bar', label: 'Bars & Wein', icon: 'local-bar' },
  { key: 'streetfood', label: 'Streetfood', icon: 'fastfood' },
  { key: 'other', label: 'Sonstiges', icon: 'category' },
];

export const EMOJIS = ['🍕', '🍔', '☕', '🌮', '🍷', '🍦', '🍣', '🍜', '🍺', '🥐', '🎬', '📚', '⭐'];

export function timeAgo(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'gerade eben';
  if (min < 60) return `vor ${min} Min.`;
  const h = Math.floor(min / 60);
  if (h < 24) return `vor ${h} Std.`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'gestern';
  if (d < 7) return `vor ${d} Tagen`;
  const w = Math.floor(d / 7);
  if (w < 5) return w === 1 ? 'vor 1 Woche' : `vor ${w} Wochen`;
  return new Date(iso).toLocaleDateString('de-DE');
}

export const SCORE_LABELS = ['', 'Enttäuschend', 'Geht so', 'Solide', 'Sehr gut', 'Absolutes Highlight!'];

export const average = (stars: number[]) => (stars.length ? stars.reduce((a, b) => a + b, 0) / stars.length : 0);

export function Button({ title, onPress, variant = 'primary', icon, disabled, style }: {
  title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger'; icon?: IconName; disabled?: boolean; style?: ViewStyle;
}) {
  const fg = variant === 'primary' ? colors.onPrimary : variant === 'danger' ? colors.error : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [s.btn, variant !== 'primary' && s[variant], disabled && { opacity: 0.5 }, pressed && { opacity: 0.85 }, style]}
    >
      {icon ? <MaterialIcons name={icon} size={20} color={fg} /> : null}
      <Text style={[t.label, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

export function Input(p: TextInputProps) {
  const [focus, setFocus] = useState(false);
  return (
    <TextInput
      placeholderTextColor={colors.placeholder}
      {...p}
      onFocus={(e) => { setFocus(true); p.onFocus?.(e); }}
      onBlur={(e) => { setFocus(false); p.onBlur?.(e); }}
      style={[s.input, p.multiline && { minHeight: 96, textAlignVertical: 'top', paddingTop: 12 }, focus && { borderColor: colors.primaryContainer }, p.style]}
    />
  );
}

export const Card = ({ children, style }: { children: ReactNode; style?: ViewStyle }) => <View style={[s.card, style]}>{children}</View>;

export function Stars({ value, onChange, size = 20, gap = 2 }: { value: number; onChange?: (n: number) => void; size?: number; gap?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const icon = <MaterialIcons name={filled ? 'star' : 'star-border'} size={size} color={filled ? colors.star : colors.starEmpty} />;
        return onChange
          ? <Pressable key={n} onPress={() => onChange(n)} hitSlop={6}>{icon}</Pressable>
          : <View key={n}>{icon}</View>;
      })}
    </View>
  );
}

export function Pill({ icon, label, bg = colors.surface, color = colors.muted }: { icon?: IconName; label: string; bg?: string; color?: string }) {
  return (
    <View style={[s.pill, { backgroundColor: bg }]}>
      {icon ? <MaterialIcons name={icon} size={14} color={color} /> : null}
      <Text style={[t.labelSm, { color }]}>{label}</Text>
    </View>
  );
}

export const Badge = ({ isPublic }: { isPublic: boolean }) =>
  isPublic
    ? <Pill icon="public" label="Öffentlich" bg={colors.publicBg} color={colors.publicText} />
    : <Pill icon="lock" label="Privat" bg={colors.privateBg} color={colors.privateText} />;

export function ScorePill({ value, count }: { value: number; count?: number }) {
  return (
    <View style={{ alignItems: 'flex-end' }}>
      <View style={[s.pill, { backgroundColor: '#fef7ea' }]}>
        <MaterialIcons name="star" size={15} color={colors.star} />
        <Text style={[t.label, { color: colors.text }]}>{value ? value.toFixed(1) : '–'}</Text>
      </View>
      {count !== undefined ? <Text style={[t.small, { marginTop: 2 }]}>({count} {count === 1 ? 'Stimme' : 'Stimmen'})</Text> : null}
    </View>
  );
}

export function Chip({ label, icon, active, onPress }: { label: string; icon?: IconName; active?: boolean; onPress: () => void }) {
  const color = active ? colors.onPrimary : colors.muted;
  return (
    <Pressable onPress={onPress} style={[s.chip, active && { backgroundColor: colors.primary }]}>
      {icon ? <MaterialIcons name={icon} size={16} color={color} /> : null}
      <Text style={[t.labelSm, { color, fontSize: 13 }]}>{label}</Text>
    </Pressable>
  );
}

const AVATAR_COLORS = ['#fdcb9e', '#f6a88d', '#d0debb', '#f7dca3'];
export function Avatar({ name, size = 40, uri }: { name: string; size?: number; uri?: string | null }) {
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: AVATAR_COLORS[hash % AVATAR_COLORS.length], alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: size * 0.36, color: colors.text }}>{initials}</Text>
    </View>
  );
}

export function EmojiBox({ emoji, size = 48 }: { emoji: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 4, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
}

export function IconCircle({ icon, color = colors.primary, bg = colors.primarySoft, size = 40 }: { icon: IconName; color?: string; bg?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <MaterialIcons name={icon} size={size * 0.5} color={color} />
    </View>
  );
}

export function SectionHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <View style={[s.row, { marginTop: 24, marginBottom: 12 }]}>
      <View style={{ flex: 1 }}>
        <Text style={t.h2}>{title}</Text>
        {subtitle ? <Text style={t.small}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function GroupCard({ group, memberCount, onPress, action }: {
  group: { name: string; description: string | null; is_public: boolean; emoji: string }; memberCount: number; onPress: () => void; action?: ReactNode;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.card, pressed && { opacity: 0.92 }]}>
      <View style={[s.row, { alignItems: 'flex-start', gap: 10 }]}>
        <View style={[s.row, { flex: 1, justifyContent: 'flex-start', gap: 12 }]}>
          <EmojiBox emoji={group.emoji} />
          <View style={{ flex: 1 }}>
            <Text style={t.h3} numberOfLines={1}>{group.name}</Text>
            {group.description ? <Text style={t.small} numberOfLines={2}>{group.description}</Text> : null}
          </View>
        </View>
        <Badge isPublic={group.is_public} />
      </View>
      <View style={[s.row, { marginTop: 14 }]}>
        <View style={[s.row, { gap: 4 }]}>
          <MaterialIcons name="groups" size={16} color={colors.primary} />
          <Text style={t.small}>{memberCount} {memberCount === 1 ? 'Mitglied' : 'Mitglieder'}</Text>
        </View>
        {action ?? <View style={s.roundBtn}><MaterialIcons name="arrow-forward" size={18} color={colors.muted} /></View>}
      </View>
    </Pressable>
  );
}

const shadow = { shadowColor: '#3c1e0a', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 2 };

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 32 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border, ...shadow },
  btn: { backgroundColor: colors.primary, height: 50, paddingHorizontal: 18, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginVertical: 5 },
  secondary: { backgroundColor: colors.surfaceHigh },
  danger: { backgroundColor: colors.errorSoft },
  input: { backgroundColor: colors.surfaceLow, borderWidth: 1.5, borderColor: 'transparent', borderRadius: 12, paddingHorizontal: 16, minHeight: 50, marginVertical: 6, color: colors.text, fontFamily: fonts.regular, fontSize: 15 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 28, paddingHorizontal: 10, borderRadius: 14 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 14, borderRadius: 18, backgroundColor: colors.surface },
  roundBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
});
