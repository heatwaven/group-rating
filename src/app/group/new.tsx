import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Category, supabase } from '../../lib/supabase';
import { Button, CATEGORIES, Chip, EMOJIS, IconCircle, Input, colors, s, t } from '../../lib/ui';

export default function NewGroup() {
  const router = useRouter();
  const [emoji, setEmoji] = useState('🍕');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('food');
  const [isPublic, setIsPublic] = useState(true);
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!name.trim()) return Alert.alert('Bitte einen Gruppennamen eingeben');
    setBusy(true);
    const { data, error } = await supabase.from('groups')
      .insert({ name: name.trim(), description: description.trim() || null, is_public: isPublic, emoji, category })
      .select('id').single();
    setBusy(false);
    if (error) return Alert.alert('Fehler', error.message);
    router.replace(`/group/${data.id}`);
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <View style={[s.card, s.row, { backgroundColor: colors.surfaceHigh, borderWidth: 0, justifyContent: 'flex-start', gap: 14 }]}>
        <IconCircle icon="group-add" size={56} color={colors.onPrimary} bg={colors.primaryContainer} />
        <View style={{ flex: 1 }}>
          <Text style={t.h2}>Gemeinsam bewerten</Text>
          <Text style={t.bodyMuted}>Erstelle eine Runde für Feinschmecker, Freunde oder Kollegen.</Text>
        </View>
      </View>

      <View style={s.card}>
        <Text style={t.h3}>Gruppen-Icon wählen</Text>
        <View style={[s.row, { marginTop: 12, gap: 12 }]}>
          <View style={{ width: 80, height: 80, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 42 }}>{emoji}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ flex: 1 }}>
            {EMOJIS.map((e) => (
              <Pressable
                key={e}
                onPress={() => setEmoji(e)}
                style={{ width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: e === emoji ? colors.primarySoft : colors.surfaceLow, borderWidth: 2, borderColor: e === emoji ? colors.primaryContainer : 'transparent' }}
              >
                <Text style={{ fontSize: 24 }}>{e}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={s.card}>
        <View style={s.row}>
          <Text style={t.h3}>Gruppenname</Text>
          <Text style={[t.label, { color: colors.primary }]}>*</Text>
        </View>
        <Input placeholder="z.B. Pizza Verein Köln" value={name} onChangeText={setName} />
        <Text style={t.small}>Ein treffender Name für deine Crew.</Text>
      </View>

      <View style={s.card}>
        <View style={s.row}>
          <Text style={t.h3}>Beschreibung</Text>
          <Text style={t.small}>Optional</Text>
        </View>
        <Input placeholder="Worum geht es in dieser Gruppe?" value={description} onChangeText={setDescription} multiline />
        <Text style={t.small}>Hilf anderen zu verstehen, welche Kriterien euch wichtig sind.</Text>
      </View>

      <View style={s.card}>
        <Text style={t.h3}>Kategorie</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {CATEGORIES.map((c) => (
            <Chip key={c.key} label={c.label} icon={c.icon} active={category === c.key} onPress={() => setCategory(c.key)} />
          ))}
        </View>
      </View>

      <View style={s.card}>
        <Text style={t.h3}>Sichtbarkeit der Gruppe</Text>
        <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceHigh, borderRadius: 14, padding: 4, marginTop: 12 }}>
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
          <MaterialIcons name={isPublic ? 'public' : 'lock'} size={24} color={isPublic ? colors.publicText : colors.privateText} />
          <View style={{ flex: 1 }}>
            <Text style={t.label}>{isPublic ? 'Öffentliche Gruppe' : 'Private Gruppe'}</Text>
            <Text style={t.small}>
              {isPublic
                ? 'Jeder kann diese Gruppe im Entdecken-Tab finden und sofort beitreten.'
                : 'Nur wer den Einladungscode hat, kann beitreten. Die Gruppe ist für andere unsichtbar.'}
            </Text>
          </View>
        </View>
      </View>

      <View style={[s.row, { backgroundColor: '#fef7ea', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12 }]}>
        <View style={[s.row, { gap: 6 }]}>
          <MaterialIcons name="verified" size={18} color={colors.secondary} />
          <Text style={t.label}>Gründer-Status</Text>
        </View>
        <Text style={[t.labelSm, { color: colors.secondary }]}>Du bist Admin</Text>
      </View>

      <Button icon="add-circle" title="Gruppe jetzt erstellen" onPress={create} disabled={busy || !name.trim()} />
      <Text style={[t.small, { textAlign: 'center', marginTop: 6 }]}>Du kannst Mitglieder direkt nach der Erstellung einladen.</Text>
    </ScrollView>
  );
}
