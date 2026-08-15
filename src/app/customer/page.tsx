import { redirect } from 'next/navigation';

export default function Home() {
  // Redireciona o cliente diretamente para o cardápio digital
  redirect('/cardapio'); // ou '/cardapio', conforme a sua rota
}