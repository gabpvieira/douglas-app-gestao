/**
 * Componente para seleção do protocolo de avaliação física
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Ruler, Calculator } from 'lucide-react';

interface SelecionarProtocoloStepProps {
  onSelect: (protocolo: 'pollock_7_dobras' | 'pollock_3_dobras' | 'manual') => void;
}

export default function SelecionarProtocoloStep({ onSelect }: SelecionarProtocoloStepProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => onSelect('pollock_7_dobras')}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Pollock 7 Dobras</CardTitle>
          </div>
          <CardDescription>Protocolo completo (1984)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Protocolo mais preciso com 7 medidas de dobras cutâneas.
          </p>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Tríceps</li>
            <li>• Subescapular</li>
            <li>• Peitoral</li>
            <li>• Axilar Média</li>
            <li>• Supra-ilíaca</li>
            <li>• Abdominal</li>
            <li>• Coxa</li>
          </ul>
          <Button className="w-full mt-4" onClick={() => onSelect('pollock_7_dobras')}>
            Selecionar
          </Button>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => onSelect('pollock_3_dobras')}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            <CardTitle>Pollock 3 Dobras</CardTitle>
          </div>
          <CardDescription>Protocolo simplificado (1978)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Protocolo rápido com 3 medidas específicas por gênero.
          </p>
          <div className="text-sm space-y-2 text-muted-foreground">
            <div>
              <strong>Homens:</strong>
              <ul className="ml-4">
                <li>• Peitoral</li>
                <li>• Abdominal</li>
                <li>• Coxa</li>
              </ul>
            </div>
            <div>
              <strong>Mulheres:</strong>
              <ul className="ml-4">
                <li>• Tríceps</li>
                <li>• Supra-ilíaca</li>
                <li>• Coxa</li>
              </ul>
            </div>
          </div>
          <Button className="w-full mt-4" onClick={() => onSelect('pollock_3_dobras')}>
            Selecionar
          </Button>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:border-primary transition-colors md:col-span-2" onClick={() => onSelect('manual')}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>Avaliação Manual</CardTitle>
          </div>
          <CardDescription>Entrada manual de dados</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Insira manualmente peso, medidas e percentual de gordura já calculado.
          </p>
          <Button className="w-full" onClick={() => onSelect('manual')}>
            Selecionar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
