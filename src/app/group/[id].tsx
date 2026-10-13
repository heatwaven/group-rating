import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, Share, Text, TextInput, View } from 'react-native';
import { GroupWithCount, memberCount, supabase } from '../../lib/supabase';
import { Avatar, Badge, Button, EmojiBox, IconCircle, Pill, ScorePill, SectionHeader, Stars, average, colors, fonts, s, t } from '../../lib/ui';

type Row = {
  id: string; name: string; created_at: string;
  ratings: { stars: number; comment: string | null; created_at: string; profiles: { display_name: string; avatar_url: string | null } | null }[];
};
type Sort = 'best' | 'newest';

export default function GroupDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const [group, setGroup] = useState<GroupWithCount | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [items, setItems] = useState<Row[]>([]);
  const [newName, setNewName] = useState('');
  const [sort, setSort] = useState<Sort>('best');
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    const [g, m, i] = await Promise.all([
      supabase.from('groups').select('*, group_members(count)').eq('id', id).single(),
      supabase.from('group_members').select('user_id').eq('group_id', id).eq('user_id', u.user!.id).maybeSingle(),
      supabase.from('items').select('id, name, created_at, ratings(stars, comment, created_at, profiles(display_name, avatar_url))').eq('group_id', id),
    ]);
    setGroup(g.data as GroupWithCount);
    setIsMember(!!m.data);
    setItems((i.data as unknown as Row[]) ?? []);
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  useEffect(() => { if (group) navigation.setOptions({ title: group.name }); }, [group, navigation]);

  async function join() {
    const { error } = await supabase.from('group_members').insert({ group_id: id });
    if (error) Alert.alert('Fehler', error.message); else load();
  }
  async function leave() {
    const { data: u } = await supabase.auth.getUser();
    await supabase.from('group_members').delete().eq('group_id', id).eq('user_id', u.user!.id);
    router.replace('/');
  }
  async function addItem() {
    if (!newName.trim()) return;
    const { error } = await supabase.from('items').insert({ group_id: id, name: newName.trim() });
    if (error) Alert.alert('Fehler', error.message); else { setNewName(''); load(); }
  }
  async function copyCode() {
    await Clipboard.setStringAsync(group!.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  const share = () => Share.share({ message: `Tritt meiner Gruppe "${group!.name}" bei! Einladungscode: ${group!.invite_code}` });

  if (!group) return <View style={[s.screen, s.content]}><Text style={t.bodyMuted}>Lädt…</Text></View>;

  const scored = items.map((it) => ({ ...it, avg: average(it.ratings.map((r) => r.stars)) }));
  const sorted = [...scored].sort((a, b) =>
    sort === 'best' ? b.avg - a.avg || b.ratings.length - a.ratings.length : b.created_at.localeCompare(a.created_at));
  const top = Math.max(0, ...scored.map((x) => x.avg));
  const members = memberCount(group);

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <FlatList
        contentContainerStyle={s.content}
        data={sorted}
        keyExtractor={(i) => i.id}
        ListHeaderComponent={
          <View>
            <View style={[s.row, { marginBottom: 12 }]}>
              <View style={[s.row, { gap: 8 }]}>
                <Badge isPublic={group.is_public} />
                <Pill icon="groups" label={`${members} ${members === 1 ? 'Mitglied' : 'Mitglieder'}`} />
              </View>
              {isMember && (
                <Pressable onPress={share} style={s.roundBtn}><MaterialIcons name="share" size={18} color={colors.text} /></Pressable>
              )}
            </View>

            <View style={s.card}>
              <View style={[s.row, { alignItems: 'flex-start', justifyContent: 'flex-start', gap: 14 }]}>
                <EmojiBox emoji={group.emoji} size={64} />
                <View style={{ flex: 1 }}>
                  <Text style={t.h1}>{group.name}</Text>
                  {group.description ? <Text style={t.bodyMuted}>{group.description}</Text> : null}
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <StatBox icon="rate-review" label="Einträge" value={String(items.length)} />
                <StatBox icon="star" label="Top Score" value={top ? `Ø ${top.toFixed(1)}` : '–'} gold />
              </View>

              {isMember ? (
                <>
                  <View style={{ backgroundColor: colors.surfaceLow, borderRadius: 14, padding: 12, marginTop: 12 }}>
                    <View style={[s.row, { justifyContent: 'flex-start', gap: 6, marginBottom: 8 }]}>
                      <MaterialIcons name="vpn-key" size={16} color={colors.primary} />
                      <Text style={t.labelSm}>Einladungscode für Freunde</Text>
                    </View>
                    <View style={[s.row, { backgroundColor: colors.card, borderRadius: 12, paddingLeft: 14, paddingRight: 6, height: 52 }]}>
                      <Text style={{ fontFamily: fonts.bold, fontSize: 18, letterSpacing: 2, color: colors.text }}>{group.invite_code.toUpperCase()}</Text>
                      <Pressable onPress={copyCode} style={[s.btn, { height: 40, marginVertical: 0, paddingHorizontal: 12, borderRadius: 10 }]}>
                        <MaterialIcons name={copied ? 'check' : 'content-copy'} size={16} color={colors.onPrimary} />
                        <Text style={[t.labelSm, { color: colors.onPrimary }]}>{copied ? 'Kopiert' : 'Code kopieren'}</Text>
                      </Pressable>
                    </View>
                  </View>
                  <Pressable onPress={leave} style={[s.row, { alignSelf: 'flex-end', gap: 4, marginTop: 12 }]}>
                    <MaterialIcons name="logout" size={16} color={colors.muted} />
                    <Text style={t.labelSm}>Gruppe verlassen</Text>
                  </Pressable>
                </>
              ) : (
                <Button icon="group-add" title="Gruppe beitreten" onPress={join} style={{ marginTop: 14 }} />
              )}
            </View>

            <SectionHeader
              title="Bewertete Einträge"
              subtitle={sort === 'best' ? 'Top-Spots der Gruppe' : 'Zuletzt hinzugefügt'}
              right={
                <Pressable onPress={() => setSort(sort === 'best' ? 'newest' : 'best')} style={[s.pill, { backgroundColor: colors.surface, height: 34, paddingHorizontal: 12 }]}>
                  <MaterialIcons name="swap-vert" size={16} color={colors.text} />
                  <Text style={[t.labelSm, { color: colors.text }]}>{sort === 'best' ? 'Beste zuerst' : 'Neueste'}</Text>
                </Pressable>
              }
            />
          </View>
        }
        ListEmptyComponent={<Text style={t.bodyMuted}>Noch keine Einträge. {isMember ? 'Füge unten den ersten hinzu!' : ''}</Text>}
        renderItem={({ item, index }) => {
          const latest = [...item.ratings].filter((r) => r.comment).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
          const raters = item.ratings.map((r) => ({ name: r.profiles?.display_name ?? '?', avatarUrl: r.profiles?.avatar_url ?? null }));
          return (
            <Pressable onPress={() => router.push(`/item/${item.id}`)} style={({ pressed }) => [s.card, pressed && { opacity: 0.92 }]}>
              <View style={[s.row, { alignItems: 'flex-start', gap: 10 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={t.h2}>{item.name}</Text>
                  {sort === 'best' && index === 0 && item.ratings.length > 0 && (
                    <View style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                      <Pill icon="emoji-events" label="#1 Favorit" bg={colors.goldSoft} color={colors.secondary} />
                    </View>
                  )}
                </View>
                <ScorePill value={item.avg} count={item.ratings.length} />
              </View>
              <View style={{ marginTop: 10 }}>
                {item.ratings.length ? <Stars value={item.avg} size={20} /> : <Text style={t.small}>Noch keine Bewertung – sei der/die Erste!</Text>}
              </View>
              {item.ratings.length > 0 && (
                <View style={[s.row, { backgroundColor: colors.surfaceLow, borderRadius: 12, padding: 10, marginTop: 12, gap: 10 }]}>
                  <View style={{ flexDirection: 'row' }}>
                    {raters.slice(0, 2).map((rt, i) => (
                      <View key={i} style={{ marginLeft: i ? -8 : 0, borderWidth: 2, borderColor: colors.surfaceLow, borderRadius: 16 }}><Avatar name={rt.name} uri={rt.avatarUrl} size={28} /></View>
                    ))}
                    {raters.length > 2 && (
                      <View style={{ marginLeft: -8, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceHigh, borderWidth: 2, borderColor: colors.surfaceLow, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={[t.labelSm, { fontSize: 10 }]}>+{raters.length - 2}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[t.body, { flex: 1, fontStyle: 'italic', color: colors.muted }]} numberOfLines={1}>
                    {latest ? `„${latest.comment}“` : `${item.ratings.length} ${item.ratings.length === 1 ? 'Bewertung' : 'Bewertungen'}`}
                  </Text>
                  <View style={[s.roundBtn, { width: 30, height: 30, backgroundColor: colors.card }]}>
                    <MaterialIcons name="chevron-right" size={20} color={colors.primary} />
                  </View>
                </View>
              )}
            </Pressable>
          );
        }}
      />
      {isMember && (
        <View style={{ flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg }}>
          <View style={[s.input, { flex: 1, flexDirection: 'row', alignItems: 'center', marginVertical: 0, paddingHorizontal: 12 }]}>
            <MaterialIcons name="add-location-alt" size={20} color={colors.outline} />
            <TextInput
              style={{ flex: 1, marginLeft: 8, color: colors.text, fontFamily: fonts.regular, fontSize: 15, height: 48 }}
              placeholder="Neuen Eintrag hinzufügen"
              placeholderTextColor={colors.placeholder}
              value={newName}
              onChangeText={setNewName}
              onSubmitEditing={addItem}
              returnKeyType="done"
            />
          </View>
          <Button icon="add" title="Hinzufügen" onPress={addItem} style={{ marginVertical: 0 }} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

function StatBox({ icon, label, value, gold }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; value: string; gold?: boolean }) {
  return (
    <View style={[s.row, { flex: 1, justifyContent: 'flex-start', gap: 10, backgroundColor: gold ? '#fef7ea' : colors.surfaceLow, borderRadius: 14, padding: 12 }]}>
      <IconCircle icon={icon} size={34} color={gold ? colors.secondary : colors.primary} bg={gold ? colors.goldSoft : colors.primarySoft} />
      <View>
        <Text style={t.small}>{label}</Text>
        <Text style={[t.h3, { fontSize: 18 }]}>{value}</Text>
      </View>
    </View>
  );
}
