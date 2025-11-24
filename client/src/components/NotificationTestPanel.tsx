/**
 * Painel de teste para o sistema de notificações
 * Use este componente para testar todos os tipos de notificações e sons
 */

import { useState } from 'react';
import { useNotification } from '@/hooks/useNotification';
import { soundManager } from '@/lib/soundManager';
import { Volume2, VolumeX, Play } from 'lucide-react';

export function NotificationTestPanel() {
  const { notify } = useNotification();
  const [volume, setVolume] = useState(soundManager.getVolume());
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    soundManager.setVolume(newVolume);
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundManager.setEnabled(newState);
  };

  const testNotifications = [
    {
      type: 'success' as const,
      title: 'Operação concluída!',
      description: 'A ficha de treino foi criada com sucesso',
      color: 'bg-green-500',
    },
    {
      type: 'error' as const,
      title: 'Erro ao salvar',
      description: 'Não foi possível salvar as alterações',
      color: 'bg-red-500',
    },
    {
      type: 'warning' as const,
      title: 'Atenção necessária',
      description: 'Verifique os campos antes de continuar',
      color: 'bg-yellow-500',
    },
    {
      type: 'info' as const,
      title: 'Informação',
      description: 'Você tem 3 mensagens não lidas',
      color: 'bg-blue-500',
    },
    {
      type: 'create' as const,
      title: 'Novo item criado!',
      description: 'O plano alimentar foi adicionado',
      color: 'bg-purple-500',
    },
    {
      type: 'system' as const,
      title: 'Atualização disponível',
      description: 'Uma nova versão está disponível',
      color: 'bg-gray-500',
    },
  ];

  return (
    <div className="fixed bottom-4 left-4 z-50 w-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Teste de Notificações
        </h3>
        <button
          onClick={toggleSound}
          className="p-2 rounded-md hover:bg-gray-800 transition-colors"
          title={soundEnabled ? 'Desativar sons' : 'Ativar sons'}
        >
          {soundEnabled ? (
            <Volume2 className="h-5 w-5 text-white" />
          ) : (
            <VolumeX className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Volume Control */}
      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-2 block">
          Volume: {Math.round(volume * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>

      {/* Test Buttons */}
      <div className="space-y-2">
        {testNotifications.map((test) => (
          <div key={test.type} className="flex items-center gap-2">
            <button
              onClick={() => notify[test.type](test.title, test.description)}
              className={`flex-1 px-4 py-2 rounded-md text-white font-medium transition-all hover:opacity-90 ${test.color}`}
            >
              {test.type.charAt(0).toUpperCase() + test.type.slice(1)}
            </button>
            <button
              onClick={() => soundManager.play(test.type)}
              className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
              title="Testar apenas o som"
            >
              <Play className="h-4 w-4 text-white" />
            </button>
          </div>
        ))}
      </div>

      {/* Advanced Tests */}
      <div className="mt-6 pt-6 border-t border-gray-700 space-y-2">
        <button
          onClick={() => {
            notify.success('Operação concluída!', 'Clique para ver detalhes', {
              action: {
                label: 'Ver detalhes',
                onClick: () => alert('Ação executada!'),
              },
            });
          }}
          className="w-full px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors"
        >
          Teste com Ação
        </button>

        <button
          onClick={() => {
            const id = notify.info('Processando...', 'Aguarde', {
              duration: Infinity,
            });
            setTimeout(() => {
              notify.dismiss(id);
              notify.success('Concluído!');
            }, 3000);
          }}
          className="w-full px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors"
        >
          Teste Loading → Success
        </button>

        <button
          onClick={() => {
            notify.success('Notificação 1');
            setTimeout(() => notify.info('Notificação 2'), 200);
            setTimeout(() => notify.warning('Notificação 3'), 400);
            setTimeout(() => notify.error('Notificação 4'), 600);
            setTimeout(() => notify.create('Notificação 5'), 800);
          }}
          className="w-full px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors"
        >
          Teste Múltiplas (5x)
        </button>

        <button
          onClick={() => notify.dismissAll()}
          className="w-full px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm transition-colors"
        >
          Fechar Todas
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Sons gerados com Web Audio API
          <br />
          Sem arquivos externos necessários
        </p>
      </div>
    </div>
  );
}
