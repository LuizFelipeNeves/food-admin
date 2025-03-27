import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: ReactNode;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Coluna da Esquerda - Informações sobre o Cardápio Digital */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-green-500">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        </div>
        
        <div className="relative w-full flex flex-col justify-center px-12 text-white">
          <div className="max-w-xl mx-auto space-y-12">
            <div className="text-center space-y-6">
              <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl p-3 mb-2">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z M7 7l0 0 M18 7l0 0 M7 18l0 0 M18 18l0 0"/>
                </svg>
              </div>
              <h1 className="text-5xl font-bold tracking-tight">Cardápio Digital</h1>
              <p className="text-xl text-white/90 max-w-lg mx-auto">
                Gerencie seu cardápio de forma simples e eficiente com nossa plataforma intuitiva.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors">
                <div className="bg-white/20 rounded-lg p-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 5h4v4H3V5m2 2 M11 5h4v4h-4V5m2 2 M19 5h2v4h-2V5 M3 13h4v4H3v-4m2 2 M11 13h4v4h-4v-4m2 2 M19 13h2v4h-2v-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">QR Code Único</h3>
                  <p className="text-white/75">Código exclusivo para cada mesa do seu estabelecimento</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors">
                <div className="bg-white/20 rounded-lg p-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Pedidos em Tempo Real</h3>
                  <p className="text-white/75">Atualizações instantâneas direto na cozinha</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors">
                <div className="bg-white/20 rounded-lg p-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Análise Detalhada</h3>
                  <p className="text-white/75">Acompanhe vendas e preferências dos clientes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coluna da Direita - Formulário */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h2>
            <div className="text-base text-gray-600">{subtitle}</div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            {children}
          </div>

          {/* Logo mobile */}
          <div className="lg:hidden text-center mt-8">
            <div className="inline-flex items-center space-x-2">
              <div className="bg-emerald-100 rounded-lg p-2">
                <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z M7 7l0 0 M18 7l0 0 M7 18l0 0 M18 18l0 0"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Cardápio Digital</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 