import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSession } from '../../lib/session';
import { supabase } from '../../lib/supabase';
import { Avatar, Button, IconCircle, Input, average, colors, s, t } from '../../lib/ui';

export default function Account() {
  const { session } = useSession();
  const user = session?.user;
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [stats, setStats] = useState({ groups: 0, ratings: 0, avg: 0 });

  useFocusEffect(useCallback(() => {
    if (!user) return;
    (async () => {
      const [p, g, r] = await Promise.all([
        supabase.from('profiles').select('display_name').eq('id', user.id).single(),
        supabase.from('group_members').select('group_id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('ratings').select('stars').eq('user_id', user.id),
      ]);
      setName(p.data?.display_name ?? '');
      const stars = (r.data ?? []).map((x) => x.stars);
      setStats({ groups: g.count ?? 0, ratings: stars.length, avg: average(stars) });
    })();
  }, [user]));

  async function saveName() {
    const value = draft.trim();
    if (!value || !user) return;
    const { error } = await supabase.from('profiles').update({ display_name: value }).eq('id', user.id);
    if (error) return Alert.alert('Fehler', error.message);
    await supabase.auth.updateUser({ data: { display_name: value } });
    setName(value);
    setEditing(false);
  }

  const since = user ? new Date(user.created_at).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' }) : '';

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Text style={[t.overline, { marginBottom: 12 }]}>Mein Profil</Text>
      <View style={[s.card, s.row, { justifyContent: 'flex-start', gap: 16 }]}>
        <Avatar name={name || '?'} size={72} />
        <View style={{ flex: 1 }}>
          <Text style={t.h2}>{name}</Text>
          <Text style={t.bodyMuted}>{user?.email}</Text>
          <View style={[s.pill, { backgroundColor: colors.surfaceLow, alignSelf: 'flex-start', marginTop: 6 }]}>
            <MaterialIcons name="calendar-today" size={13} color={colors.muted} />
            <Text style={t.labelSm}>Mitglied seit {since}</Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        <Stat icon="groups" value={String(stats.groups)} label="Gruppen" />
        <Stat icon="rate-review" value={String(stats.ratings)} label="Bewertungen" />
        <Stat icon="star" value={stats.ratings ? stats.avg.toFixed(1) : '–'} label="Ø Sterne" />
      </View>

      <Text style={[t.overline, { marginTop: 12, marginBottom: 12 }]}>Einstellungen</Text>
      <View style={[s.card, { paddingVertical: 4 }]}>
        <Pressable onPress={() => { setDraft(name); setEditing(!editing); }} style={[s.row, { gap: 14, paddingVertical: 12 }]}>
          <IconCircle icon="badge" />
          <View style={{ flex: 1 }}>
            <Text style={t.h3}>Profil bearbeiten</Text>
            <Text style={t.small}>Anzeigenamen ändern</Text>
          </View>
          <MaterialIcons name={editing ? 'expand-less' : 'chevron-right'} size={24} color={colors.outline} />
        </Pressable>
        {editing && (
          <View style={{ paddingBottom: 12 }}>
            <Input value={draft} onChangeText={setDraft} placeholder="Anzeigename" autoFocus />
            <Button title="Speichern" icon="check" onPress={saveName} />
          </View>
        )}
      </View>

      <Button variant="danger" icon="logout" title="Abmelden" onPress={() => supabase.auth.signOut()} style={{ marginTop: 12 }} />
      <Text style={[t.small, { textAlign: 'center', marginTop: 16 }]}>Group Rating v1.0</Text>
    </ScrollView>
  );
}

function Stat({ icon, value, label }: { icon: keyof typeof MaterialIcons.glyphMap; value: string; label: string }) {
  return (
    <View style={[s.card, { flex: 1, alignItems: 'center', marginBottom: 0, paddingHorizontal: 8 }]}>
      <IconCircle icon={icon} size={36} />
      <Text style={[t.score, { fontSize: 26, lineHeight: 32, marginTop: 6, color: colors.text }]}>{value}</Text>
      <Text style={t.labelSm}>{label}</Text>
    </View>
  );
}
