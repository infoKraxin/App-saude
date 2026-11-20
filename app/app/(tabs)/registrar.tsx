import { Redirect } from 'expo-router';

// A aba central só abre a folha de registro (ver _layout). Se alguém chegar aqui por link, redireciona.
export default function Registrar() {
  return <Redirect href="/registro" />;
}
