// Quiz de quem ainda não fez: é exatamente o quiz do site. Na web, vai para a página do quiz
// (mesmo domínio, que devolve para /app/entrar); no app nativo, abre numa WebView.
import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QUIZ_URL, saveLocalQuiz } from '@/lib/quizLead';

export default function Quiz() {
  const router = useRouter();
  useEffect(() => {
    if (Platform.OS === 'web') window.location.href = '/?from=app';
  }, []);
  if (Platform.OS === 'web') return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { WebView } = require('react-native-webview');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F5' }} edges={['top']}>
      <WebView
        source={{ uri: QUIZ_URL }}
        onMessage={(e: { nativeEvent: { data: string } }) => {
          try {
            const m = JSON.parse(e.nativeEvent.data);
            if (m?.type === 'evura_quiz') { saveLocalQuiz(m.payload); router.replace('/entrar'); }
          } catch { /* mensagem desconhecida */ }
        }}
      />
    </SafeAreaView>
  );
}
