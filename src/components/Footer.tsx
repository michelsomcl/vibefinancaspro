import React from 'react';
export default function Footer() {
  const currentYear = new Date().getFullYear();
  return <footer className="mt-auto py-4 px-6 border-t border-gray-200 bg-white">
      <div className="text-center text-sm text-gray-600">© Vibe Finanças Pro. Desenvolvido por Vibesys - Todos os direitos reservados.</div>
    </footer>;
}