import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Category, GroupWithCount, memberCount, supabase } from '../../lib/supabase';
import { Button, CATEGORIES, Chip, GroupCard, IconCircle, colors, fonts, s, t } from '../../lib/ui';

export default function Discover() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupWithCount[]>([]);
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<Category | null>(null);

  const load = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    const [g, m] = await Promise.all([
      supabase.from('groups').select('*, group_members(count)').eq('is_public', true).order('created_at', { ascending: false }),
      supabase.from('group_members').select('group_id').eq('user_id', u.user!.id),
    ]);
    setGroups((g.data as GroupWithCount[]) ?? []);
    setMine(new Set((m.data ?? []).map((r) => r.group_id)));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function join(id: string) {
    const { error } = await supabase.from('group_members').insert({ group_id: id });
    if (error) Alert.alert('Fehler', error.message); else router.push(`/group/${id}`);
  }

  const shown = groups
    .filter((g) => !category || g.category === category)
    .filter((g) => `${g.name} ${g.description ?? ''}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <FlatList
      style={s.screen}
      contentContainerStyle={s.content}
      data={shown}
      keyExtractor={(g) => g.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={{ marginBottom: 4 }}>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={t.h1}>Öffentliche Gruppen</Text>
              <Text style={t.bodyMuted}>Finde neue Runden und Communitys</Text>
            </View>
            <IconCircle icon="explore" size={48} />
          </View>
          <View style={[s.card, { flexDirection: 'row', alignItems: 'center', paddingVertical: 0, paddingHorizontal: 12, marginTop: 16, marginBottom: 0 }]}>
            <MaterialIcons name="search" size={22} color={colors.outline} />
            <TextInput
              style={{ flex: 1, height: 48, marginLeft: 8, color: colors.text, fontFamily: fonts.regular, fontSize: 15 }}
              placeholder="Gruppe oder Thema suchen"
              placeholderTextColor={colors.placeholder}
              value={q}
              onChangeText={setQ}
            />
            {q ? <MaterialIcons name="close" size={20} color={colors.muted} onPress={() => setQ('')} /> : null}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginVertical: 14 }}>
            <Chip label="Alle" active={!category} onPress={() => setCategory(null)} />
            {CATEGORIES.map((c) => (
              <Chip key={c.key} label={c.label} icon={c.icon} active={category === c.key} onPress={() => setCategory(c.key)} />
            ))}
          </ScrollView>
          <Text style={[t.overline, { marginBottom: 10 }]}>{shown.length} {shown.length === 1 ? 'Gruppe' : 'Gruppen'}</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
          <IconCircle icon="search-off" size={64} color={colors.outline} bg={colors.surface} />
          <Text style={[t.h3, { marginTop: 12 }]}>Keine passende Gruppe gefunden</Text>
          <Text style={[t.bodyMuted, { textAlign: 'center', marginVertical: 8 }]}>Versuche einen anderen Suchbegriff oder gründe deine eigene Gruppe.</Text>
          <Button icon="add-circle" title="Eigene Gruppe gründen" onPress={() => router.push('/group/new')} />
        </View>
      }
      renderItem={({ item: g }) => (
        <GroupCard
          group={g}
          memberCount={memberCount(g)}
          onPress={() => router.push(`/group/${g.id}`)}
          action={
            mine.has(g.id) ? (
              <View style={[s.row, { gap: 4 }]}>
                <MaterialIcons name="check-circle" size={18} color={colors.publicText} />
                <Text style={[t.label, { color: colors.publicText }]}>Beigetreten</Text>
              </View>
            ) : (
              <Pressable onPress={() => join(g.id)} style={[s.btn, { height: 40, marginVertical: 0, paddingHorizontal: 16, borderRadius: 12 }]}>
                <MaterialIcons name="group-add" size={18} color={colors.onPrimary} />
                <Text style={[t.label, { color: colors.onPrimary }]}>Beitreten</Text>
              </Pressable>
            )
          }
        />
      )}
    />
  );
}
