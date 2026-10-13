import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { Button, Stepper, ToggleRow, colors, fonts, s, t } from '../../../lib/ui';

export default function GroupSettings() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [inviteCode, setInviteCode] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [allowInvite, setAllowInvite] = useState(true);
  const [unlimited, setUnlimited] = useState(true);
  const [maxMembers, setMaxMembers] = useState(20);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useFocusEffect(useCallback(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data: g } = await supabase.from('groups')
        .select('owner_id, is_public, allow_member_invite, max_members, invite_code, group_members(count)')
        .eq('id', id).single();
      if (!g) return;
      setIsOwner(g.owner_id === u.user!.id);
      setIsPublic(g.is_public);
      setAllowInvite(g.allow_member_invite);
      setUnlimited(g.max_members === null);
      setMaxMembers(g.max_members ?? 20);
      setInviteCode(g.invite_code);
      setMemberCount((g.group_members as { count: number }[])?.[0]?.count ?? 0);
      setLoaded(true);
    })();
  }, [id]));

  async function save() {
    setSaving(true);
    const { error } = await supabase.from('groups').update({
      is_public: isPublic,
      allow_member_invite: allowInvite,
      max_members: unlimited ? null : Math.max(maxMembers, memberCount),
    }).eq('id', id);
    setSaving(false);
    if (error) return Alert.alert('Fehler', error.message);
    router.back();
  }

  async function copyCode() {
    await Clipboard.setStringAsync(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function confirmDelete() {
    Alert.alert(
      'Gruppe unwiderruflich löschen',
      'Alle Einträge, Bewertungen und gemeinsame Tasting-Listen werden permanent gelöscht.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Löschen', style: 'destructive', onPress: deleteGroup },
      ],
    );
  }

  async function deleteGroup() {
    const { error } = await supabase.from('groups').delete().eq('id', id);
    if (error) return Alert.alert('Fehler', error.message);
    router.replace('/');
  }

  if (!loaded) return <View style={[s.screen, s.content]}><Text style={t.bodyMuted}>Lädt…</Text></View>;
  if (!isOwner) return <View style={[s.screen, s.content]}><Text style={t.bodyMuted}>Nur die Admin-Person kann diese Gruppe verwalten.</Text></View>;

  return (
    <ScrollView style={s.screen} contentContainerStyle={[s.content, { paddingBottom: 100 }]}>
      <View style={s.card}>
        <View style={[s.row, { marginBottom: 12 }]}>
          <Text style={t.h3}>Sichtbarkeit der Gruppe</Text>
          <MaterialIcons name="visibility" size={20} color={colors.primary} />
        </View>
        <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceHigh, borderRadius: 14, padding: 4 }}>
          {[true, false].map((pub) => {
            const active = isPublic === pub;
            return (
              <Pressable
                key={String(pub)}
                onPress={() => setIsPublic(pub)}
                style={[s.row, { flex: 1, justifyContent: 'center', gap: 6, height: 44, borderRadius: 10, backgroundColor: active ? colors.card : 'transparent' }]}
              >
                <MaterialIcons name={pub ? 'public' : 'lock'} size={18} color={active ? colors.primary : colors.muted} />
                <Text style={[t.label, { color: active ? colors.primary : colors.muted }]}>{pub ? 'Öffentlich' : 'Privat'}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={[s.row, { alignItems: 'flex-start', justifyContent: 'flex-start', gap: 12, backgroundColor: colors.surfaceLow, borderRadius: 14, padding: 14, marginTop: 12 }]}>
          <MaterialIcons name={isPublic ? 'public' : 'lock'} size={22} color={isPublic ? colors.publicText : colors.privateText} />
          <Text style={[t.small, { flex: 1 }]}>
            {isPublic
              ? 'Jeder kann diese Gruppe im Entdecken-Tab finden und sofort beitreten.'
              : 'Nur wer den Einladungscode hat, kann beitreten. Die Gruppe ist für andere unsichtbar.'}
          </Text>
        </View>
      </View>

      <View style={s.card}>
        <View style={[s.row, { marginBottom: 4 }]}>
          <Text style={t.h3}>Einladungen & Freigaben</Text>
          <MaterialIcons name="share" size={20} color={colors.secondary} />
        </View>
        <ToggleRow
          label="Mitglieder dürfen den Link teilen"
          description="Wenn deaktiviert, kannst nur du als Admin den Einladungscode teilen."
          value={allowInvite}
          onChange={setAllowInvite}
        />
        <View style={[s.row, { backgroundColor: colors.surfaceLow, borderRadius: 14, padding: 12, marginTop: 12 }]}>
          <View style={[s.row, { justifyContent: 'flex-start', gap: 10 }]}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialIcons name="vpn-key" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={t.small}>Gruppen-Code</Text>
              <Text style={{ fontFamily: fonts.extrabold, fontSize: 18, letterSpacing: 2, color: colors.text }}>{inviteCode.toUpperCase()}</Text>
            </View>
          </View>
          <Pressable onPress={copyCode} style={[s.btn, { height: 40, marginVertical: 0, paddingHorizontal: 12, borderRadius: 10 }]}>
            <MaterialIcons name={copied ? 'check' : 'content-copy'} size={16} color={colors.onPrimary} />
            <Text style={[t.labelSm, { color: colors.onPrimary }]}>{copied ? 'Kopiert' : 'Kopieren'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={s.card}>
        <View style={[s.row, { marginBottom: 4 }]}>
          <Text style={t.h3}>Maximale Mitgliederanzahl</Text>
          <MaterialIcons name="group" size={20} color={colors.primary} />
        </View>
        <View style={{ marginVertical: 16 }}>
          {unlimited
            ? <Text style={[t.score, { textAlign: 'center' }]}>∞</Text>
            : <Stepper value={maxMembers} onChange={setMaxMembers} min={Math.max(1, memberCount)} max={500} />}
        </View>
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Pressable
            onPress={() => setUnlimited(!unlimited)}
            style={[s.pill, { height: 34, paddingHorizontal: 14, backgroundColor: unlimited ? colors.primary : colors.surface }]}
          >
            <MaterialIcons name="all-inclusive" size={16} color={unlimited ? colors.onPrimary : colors.muted} />
            <Text style={[t.labelSm, { color: unlimited ? colors.onPrimary : colors.muted }]}>Unbegrenzt</Text>
          </Pressable>
          <Text style={t.small}>
            {unlimited ? `${memberCount} aktive Mitglieder (kein Limit)` : `${memberCount} von ${maxMembers} Mitgliedern belegt`}
          </Text>
        </View>
      </View>

      <View style={{ backgroundColor: colors.errorSoft, borderRadius: 16, padding: 16 }}>
        <View style={[s.row, { justifyContent: 'flex-start', gap: 8, marginBottom: 12 }]}>
          <MaterialIcons name="warning" size={20} color={colors.error} />
          <Text style={[t.h3, { color: colors.error }]}>Gefahrenzone</Text>
        </View>
        <Pressable onPress={confirmDelete} style={[s.row, { justifyContent: 'center', gap: 8, backgroundColor: colors.card, height: 48, borderRadius: 12 }]}>
          <MaterialIcons name="delete-forever" size={20} color={colors.error} />
          <Text style={[t.label, { color: colors.error }]}>Gruppe unwiderruflich löschen</Text>
        </Pressable>
      </View>

      <Button title="Änderungen speichern" icon="check" onPress={save} disabled={saving} style={{ marginTop: 16 }} />
    </ScrollView>
  );
}
