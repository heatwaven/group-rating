import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Rating, supabase } from '../../lib/supabase';
import { Avatar, Badge, Button, Input, Pill, SCORE_LABELS, ScorePill, SectionHeader, Stars, average, colors, s, t, timeAgo } from '../../lib/ui';

type ItemWithGroup = { id: string; name: string; group_id: string; groups: { name: string; is_public: boolean; owner_id: string } | null };

export default function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [item, setItem] = useState<ItemWithGroup | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [uid, setUid] = useState('');
  const [canRate, setCanRate] = useState(false);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');

  const load = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    const me = u.user!.id;
    setUid(me);
    const { data: it } = await supabase.from('items').select('id, name, group_id, groups(name, is_public, owner_id)').eq('id', id).single();
    if (!it) return;
    setItem(it as unknown as ItemWithGroup);
    const [r, m] = await Promise.all([
      supabase.from('ratings').select('*, profiles(display_name)').eq('item_id', id).order('created_at', { ascending: false }),
      supabase.from('group_members').select('user_id').eq('group_id', it.group_id).eq('user_id', me).maybeSingle(),
    ]);
    const list = (r.data as Rating[]) ?? [];
    setRatings(list);
    setCanRate(!!m.data);
    const mine = list.find((x) => x.user_id === me);
    if (mine) { setStars(mine.stars); setComment(mine.comment ?? ''); }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (item) navigation.setOptions({ title: item.name }); }, [item, navigation]);

  async function save() {
    if (!stars) return Alert.alert('Bitte zuerst Sterne vergeben');
    const { error } = await supabase.from('ratings')
      .upsert({ item_id: id, user_id: uid, stars, comment: comment.trim() || null }, { onConflict: 'item_id,user_id' });
    if (error) Alert.alert('Fehler', error.message); else load();
  }

  if (!item) return <View style={[s.screen, s.content]}><Text style={t.bodyMuted}>Lädt…</Text></View>;

  const avg = average(ratings.map((r) => r.stars));
  const hasMine = ratings.some((r) => r.user_id === uid);
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, count: ratings.filter((r) => r.stars === n).length }));

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          {item.groups && (
            <View style={[s.row, { justifyContent: 'flex-start', gap: 8 }]}>
              <Badge isPublic={item.groups.is_public} />
            </View>
          )}
          <Text style={[t.h1, { marginTop: 8 }]}>{item.name}</Text>
          {item.groups ? <Text style={t.bodyMuted}>{item.groups.name}</Text> : null}

          <View style={{ backgroundColor: colors.surfaceLow, borderRadius: 16, padding: 14, marginTop: 14 }}>
            <View style={[s.row, { justifyContent: 'flex-start', gap: 14 }]}>
              <View style={{ backgroundColor: colors.card, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' }}>
                <Text style={t.score}>{ratings.length ? avg.toFixed(1) : '–'}</Text>
                <Text style={t.small}>von 5.0</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Stars value={avg} size={26} />
                <Text style={[t.small, { marginTop: 4 }]}>
                  {ratings.length} {ratings.length === 1 ? 'Bewertung' : 'Bewertungen'} von Mitgliedern
                </Text>
              </View>
            </View>
            {ratings.length > 0 && (
              <View style={{ marginTop: 12, gap: 6 }}>
                {dist.map(({ n, count }) => (
                  <View key={n} style={[s.row, { gap: 8 }]}>
                    <Text style={[t.labelSm, { width: 24 }]}>{n}★</Text>
                    <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.surfaceHigh, overflow: 'hidden' }}>
                      <View style={{ width: `${(count / ratings.length) * 100}%`, height: '100%', backgroundColor: colors.star, borderRadius: 4 }} />
                    </View>
                    <Text style={[t.labelSm, { width: 36, textAlign: 'right' }]}>{Math.round((count / ratings.length) * 100)}%</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {canRate && (
          <View style={s.card}>
            <View style={s.row}>
              <View style={[s.row, { gap: 8 }]}>
                <MaterialIcons name="rate-review" size={22} color={colors.primary} />
                <Text style={t.h2}>Deine Bewertung</Text>
              </View>
              {hasMine && <Pill label="● Bereits bewertet" bg={colors.goldSoft} color={colors.secondary} />}
            </View>
            <Text style={[t.small, { marginTop: 2 }]}>Tippe auf die Sterne, um deine Punktzahl {hasMine ? 'anzupassen' : 'zu vergeben'}.</Text>
            <View style={{ backgroundColor: colors.surfaceLow, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 12 }}>
              <Stars value={stars} onChange={setStars} size={40} gap={10} />
            </View>
            {stars > 0 && (
              <Text style={[t.label, { color: colors.primary, textAlign: 'center', marginTop: 10 }]}>
                {stars}.0 von 5.0 • {SCORE_LABELS[stars]}
              </Text>
            )}
            <Text style={[t.label, { marginTop: 14 }]}>Deine Notiz für {item.groups?.name ?? 'die Gruppe'}</Text>
            <Input value={comment} onChangeText={setComment} placeholder="Was hat dir gefallen, was nicht?" multiline />
            <Button icon="check-circle" title={hasMine ? 'Bewertung aktualisieren' : 'Bewertung speichern'} onPress={save} />
          </View>
        )}

        <SectionHeader
          title="Bewertungen der Gruppe"
          subtitle={item.groups ? `Stimmen aus ${item.groups.name}` : undefined}
          right={ratings.length ? <Pill label={`${ratings.length} ${ratings.length === 1 ? 'Stimme' : 'Stimmen'}`} /> : undefined}
        />
        {ratings.length === 0 && <Text style={t.bodyMuted}>Noch keine Bewertungen.</Text>}
        {ratings.map((r) => {
          const name = r.profiles?.display_name ?? 'Unbekannt';
          return (
            <View key={r.id} style={s.card}>
              <View style={[s.row, { gap: 12 }]}>
                <Avatar name={name} size={44} />
                <View style={{ flex: 1 }}>
                  <View style={[s.row, { justifyContent: 'flex-start', gap: 6 }]}>
                    <Text style={t.h3}>{name}</Text>
                    {item.groups?.owner_id === r.user_id && <Pill label="Admin" bg={colors.surfaceHigh} />}
                    {r.user_id === uid && <Pill label="Du" bg={colors.primarySoft} color={colors.primary} />}
                  </View>
                  <Text style={t.small}>{timeAgo(r.created_at)}</Text>
                </View>
                <ScorePill value={r.stars} />
              </View>
              {r.comment ? <Text style={[t.body, { marginTop: 10, fontSize: 15, lineHeight: 22 }]}>{r.comment}</Text> : null}
            </View>
          );
        })}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
