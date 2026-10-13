import { MaterialIcons } from '@expo/vector-icons';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSession } from '../../lib/session';
import { supabase } from '../../lib/supabase';
import { Avatar, Button, colors, s, t } from '../../lib/ui';

async function readAsBytes(uri: string) {
  // fetch().arrayBuffer() liefert bei nativen file://-URIs oft nur ein paar Bytes
  // (bekannte RN-Einschraenkung). Im Web funktioniert fetch fuer blob:-URIs dagegen zuverlaessig.
  if (Platform.OS === 'web') {
    const res = await fetch(uri);
    return await res.arrayBuffer();
  }
  return await new File(uri).bytes();
}

type Status = 'idle' | 'uploading' | 'error';

export default function AvatarScreen() {
  const router = useRouter();
  const { session } = useSession();
  const user = session?.user;
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  useFocusEffect(useCallback(() => {
    if (!user) return;
    supabase.from('profiles').select('display_name, avatar_url').eq('id', user.id).single()
      .then(({ data }) => { setName(data?.display_name ?? ''); setAvatarUrl(data?.avatar_url ?? null); });
  }, [user]));

  async function pick(source: 'camera' | 'library') {
    const perm = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Zugriff benötigt', 'Bitte erlaube den Zugriff in den Geräteeinstellungen.');

    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (result.canceled) return;
    upload(result.assets[0].uri);
  }

  async function upload(uri: string) {
    if (!user) return;
    setStatus('uploading');
    try {
      const bytes = await readAsBytes(uri);
      const path = `${user.id}/avatar.jpg`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, bytes, { contentType: 'image/jpeg', upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      const { error: updErr } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
      if (updErr) throw updErr;
      setAvatarUrl(url);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  async function remove() {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
    if (error) return Alert.alert('Fehler', error.message);
    await supabase.storage.from('avatars').remove([`${user.id}/avatar.jpg`]);
    setAvatarUrl(null);
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={[s.content, { alignItems: 'center' }]}>
      <View style={{ alignItems: 'center', marginTop: 12 }}>
        <View style={{ width: 160, height: 160 }}>
          <Avatar name={name || '?'} size={160} uri={status === 'error' ? null : avatarUrl} />
          {status === 'uploading' && (
            <View style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 80,
              backgroundColor: 'rgba(34,26,20,0.65)', alignItems: 'center', justifyContent: 'center',
            }}>
              <ActivityIndicator color={colors.onPrimary} />
            </View>
          )}
          <Pressable
            onPress={() => pick('camera')}
            style={{
              position: 'absolute', bottom: 0, right: 0, width: 44, height: 44, borderRadius: 22,
              backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
              borderWidth: 3, borderColor: colors.bg,
            }}
          >
            <MaterialIcons name="photo-camera" size={20} color={colors.onPrimary} />
          </Pressable>
        </View>
        <Text style={[t.h3, { marginTop: 16 }]}>{name}</Text>
        {status === 'error' && (
          <View style={{ backgroundColor: colors.errorSoft, borderRadius: 14, padding: 14, marginTop: 12, flexDirection: 'row', gap: 10, alignSelf: 'stretch' }}>
            <MaterialIcons name="error-outline" size={20} color={colors.error} />
            <View style={{ flex: 1 }}>
              <Text style={[t.label, { color: colors.error }]}>Upload fehlgeschlagen</Text>
              <Text style={[t.small, { color: colors.error }]}>Die Datei konnte nicht verarbeitet werden. Bitte erneut versuchen.</Text>
            </View>
          </View>
        )}
      </View>

      <View style={[s.card, { alignSelf: 'stretch', paddingVertical: 4, marginTop: 20 }]}>
        <Pressable onPress={() => pick('camera')} style={[s.row, { gap: 14, paddingVertical: 12 }]}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialIcons name="photo-camera" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={t.h3}>Foto aufnehmen</Text>
            <Text style={t.small}>Mit der Kamera ein neues Bild machen</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={colors.outline} />
        </Pressable>
        <View style={{ height: 1, backgroundColor: colors.border }} />
        <Pressable onPress={() => pick('library')} style={[s.row, { gap: 14, paddingVertical: 12 }]}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialIcons name="photo-library" size={20} color={colors.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={t.h3}>Aus Galerie wählen</Text>
            <Text style={t.small}>Ein vorhandenes Foto auswählen</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={colors.outline} />
        </Pressable>
      </View>

      {avatarUrl && (
        <Pressable onPress={remove} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, padding: 8 }}>
          <MaterialIcons name="delete-outline" size={18} color={colors.error} />
          <Text style={[t.label, { color: colors.error }]}>Profilbild entfernen</Text>
        </Pressable>
      )}

      <Text style={[t.small, { textAlign: 'center', marginTop: 16 }]}>JPG oder PNG, max. 5 MB.</Text>

      <Button title="Fertig" onPress={() => router.back()} style={{ alignSelf: 'stretch', marginTop: 20 }} />
    </ScrollView>
  );
}
