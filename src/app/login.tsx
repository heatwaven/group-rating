import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, IconCircle, Input, colors, s, t } from '../lib/ui';

export default function Login() {
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const { error } = signup
      ? await supabase.auth.signUp({ email, password, options: { data: { display_name: name.trim() || email.split('@')[0] } } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) Alert.alert('Fehler', error.message);
    else if (signup) Alert.alert('Fast geschafft', 'Falls E-Mail-Bestätigung aktiv ist, bitte erst den Link in der Mail öffnen.');
  }

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[s.content, { flexGrow: 1, justifyContent: 'center' }]} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <IconCircle icon="groups" size={72} color={colors.onPrimary} bg={colors.primaryContainer} />
          <Text style={[t.overline, { color: colors.primary, marginTop: 16 }]}>Group Rating</Text>
          <Text style={[t.h1, { textAlign: 'center' }]}>{signup ? 'Konto erstellen' : 'Willkommen zurück'}</Text>
          <Text style={[t.bodyMuted, { textAlign: 'center' }]}>Gemeinsam bewerten, gemeinsam entdecken.</Text>
        </View>
        <View style={s.card}>
          {signup && <Input placeholder="Anzeigename" value={name} onChangeText={setName} />}
          <Input placeholder="E-Mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <Input placeholder="Passwort (mind. 6 Zeichen)" secureTextEntry value={password} onChangeText={setPassword} />
          <Button title={signup ? 'Registrieren' : 'Anmelden'} icon={signup ? 'person-add' : 'login'} onPress={submit} disabled={busy || !email || !password} style={{ marginTop: 8 }} />
        </View>
        <Pressable onPress={() => setSignup(!signup)} style={{ alignItems: 'center', padding: 12 }}>
          <Text style={t.bodyMuted}>
            {signup ? 'Schon ein Konto? ' : 'Neu hier? '}
            <Text style={[t.label, { color: colors.primary }]}>{signup ? 'Anmelden' : 'Konto erstellen'}</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
