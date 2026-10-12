import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Button, IconCircle, Input, fonts, s, t } from '../../lib/ui';

export default function JoinByCode() {
  const router = useRouter();
  const [code, setCode] = useState('');

  async function join() {
    const { data, error } = await supabase.rpc('join_group_by_code', { code: code.trim().toLowerCase() });
    if (error) return Alert.alert('Fehler', error.message);
    router.replace(`/group/${data}`);
  }

  return (
    <View style={[s.screen, s.content]}>
      <View style={[s.card, { alignItems: 'center', paddingVertical: 28 }]}>
        <IconCircle icon="vpn-key" size={64} />
        <Text style={[t.h2, { marginTop: 14 }]}>Private Gruppe beitreten</Text>
        <Text style={[t.bodyMuted, { textAlign: 'center', marginTop: 4, marginBottom: 12 }]}>
          Gib den Einladungscode ein, den du von einem Mitglied bekommen hast.
        </Text>
        <Input
          placeholder="z.B. A1B2C3D4"
          autoCapitalize="characters"
          autoCorrect={false}
          value={code}
          onChangeText={setCode}
          style={{ alignSelf: 'stretch', textAlign: 'center', fontFamily: fonts.bold, fontSize: 20, letterSpacing: 3 }}
        />
        <Button icon="group-add" title="Beitreten" onPress={join} disabled={!code.trim()} style={{ alignSelf: 'stretch' }} />
      </View>
    </View>
  );
}
