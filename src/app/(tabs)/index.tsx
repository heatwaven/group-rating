import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { useSession } from '../../lib/session';
import { GroupWithCount, memberCount, supabase } from '../../lib/supabase';
import { Button, Chip, GroupCard, IconCircle, colors, s, t } from '../../lib/ui';

type Filter = 'all' | 'public' | 'private';

export default function MyGroups() {
  const router = useRouter();
  const { session } = useSession();
  const [groups, setGroups] = useState<GroupWithCount[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

  const name = session?.user.user_metadata?.display_name ?? session?.user.email?.split('@')[0] ?? '';

  useFocusEffect(useCallback(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from('group_members').select('groups(*, group_members(count))').eq('user_id', u.user!.id);
      setGroups((data ?? []).map((r: any) => r.groups).filter(Boolean));
    })();
  }, []));

  const nPublic = groups.filter((g) => g.is_public).length;
  const shown = groups.filter((g) => filter === 'all' || (filter === 'public') === g.is_public);

  return (
    <FlatList
      style={s.screen}
      contentContainerStyle={s.content}
      data={shown}
      keyExtractor={(g) => g.id}
      ListHeaderComponent={
        <View style={{ marginBottom: 8 }}>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={t.h1}>Hallo {name} 👋</Text>
              <Text style={t.bodyMuted}>Deine Bewertungs-Gruppen im Überblick</Text>
            </View>
            <View style={[s.pill, { backgroundColor: colors.surface, gap: 6 }]}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />
              <Text style={t.labelSm}>{groups.length} Aktiv</Text>
            </View>
          </View>
          <View style={{ marginTop: 16 }}>
            <Button icon="add-circle" title="Neue Gruppe erstellen" onPress={() => router.push('/group/new')} />
            <Button variant="secondary" icon="vpn-key" title="Mit Einladungscode beitreten" onPress={() => router.push('/group/join')} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginVertical: 14 }}>
            <Chip label={`Alle (${groups.length})`} active={filter === 'all'} onPress={() => setFilter('all')} />
            <Chip label={`Öffentlich (${nPublic})`} active={filter === 'public'} onPress={() => setFilter('public')} />
            <Chip label={`Privat (${groups.length - nPublic})`} active={filter === 'private'} onPress={() => setFilter('private')} />
          </ScrollView>
        </View>
      }
      ListEmptyComponent={<Text style={t.bodyMuted}>Noch keine Gruppen. Erstelle eine oder tritt einer bei.</Text>}
      renderItem={({ item: g }) => <GroupCard group={g} memberCount={memberCount(g)} onPress={() => router.push(`/group/${g.id}`)} />}
      ListFooterComponent={
        <View style={[s.card, { backgroundColor: colors.surfaceHigh, borderWidth: 0, marginTop: 12 }]}>
          <View style={[s.row, { alignItems: 'flex-start', gap: 12 }]}>
            <IconCircle icon="travel-explore" size={48} />
            <View style={{ flex: 1 }}>
              <Text style={t.h3}>Hungrig nach mehr Inspiration?</Text>
              <Text style={t.bodyMuted}>Entdecke öffentliche Gruppen und bewerte mit.</Text>
            </View>
          </View>
          <Button variant="secondary" icon="east" title="Jetzt Gruppen entdecken" onPress={() => router.push('/discover')} style={{ backgroundColor: colors.card, marginTop: 12 }} />
        </View>
      }
    />
  );
}
