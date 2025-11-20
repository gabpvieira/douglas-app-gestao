import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function PrintableSheet({
  aluno,
  objetivo,
  nivel,
  semanas,
  observacoes,
  dias,
}: {
  aluno: string;
  objetivo: string;
  nivel: string;
  semanas: number;
  observacoes: string;
  dias: Record<string, string>;
}) {
  const data = useMemo(() => new Date().toLocaleDateString(), []);

  return (
    <div className="bg-white text-black max-w-[794px] w-full mx-auto border print:border-0">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Plano de Treino</h1>
            <p className="text-sm">Gerado em {data}</p>
          </div>
          <div className="text-right">
            <p className="text-sm"><span className="font-semibold">Aluno:</span> {aluno || "-"}</p>
            <p className="text-sm"><span className="font-semibold">Nível:</span> {nivel || "-"}</p>
            <p className="text-sm"><span className="font-semibold">Objetivo:</span> {objetivo || "-"}</p>
            <p className="text-sm"><span className="font-semibold">Semanas:</span> {semanas || 1}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {Object.entries(dias).map(([dia, texto]) => (
          <div key={dia} className="p-4 border-b md:border-r">
            <h2 className="font-semibold mb-2">{dia}</h2>
            <div className="text-sm whitespace-pre-wrap leading-relaxed min-h-[160px]">
              {texto || "-"}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6">
        <h3 className="font-semibold mb-2">Observações</h3>
        <p className="text-sm whitespace-pre-wrap min-h-[80px]">{observacoes || "-"}</p>
      </div>
    </div>
  );
}

export function TreinosPdfPage() {
  const [aluno, setAluno] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [nivel, setNivel] = useState("Intermediário");
  const [semanas, setSemanas] = useState(4);
  const [observacoes, setObservacoes] = useState("");
  const [dias, setDias] = useState<Record<string, string>>({
    Segunda: "",
    Terça: "",
    Quarta: "",
    Quinta: "",
    Sexta: "",
    Sábado: "",
  });

  const printableRef = useRef<HTMLDivElement | null>(null);

  const handleDiaChange = (dia: string, value: string) => {
    setDias((prev) => ({ ...prev, [dia]: value }));
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Treinos PDF</h1>
        <div className="print:hidden flex gap-2">
          <Button onClick={handleImprimir}>Exportar PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm">Aluno</label>
                <Input value={aluno} onChange={(e) => setAluno(e.target.value)} placeholder="Nome do aluno" />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Nível</label>
                <Input value={nivel} onChange={(e) => setNivel(e.target.value)} placeholder="Iniciante / Intermediário / Avançado" />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Objetivo</label>
                <Input value={objetivo} onChange={(e) => setObjetivo(e.target.value)} placeholder="Hipertrofia, Emagrecimento, Resistência..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Semanas</label>
                <Input type="number" min={1} max={52} value={semanas} onChange={(e) => setSemanas(parseInt(e.target.value || "1"))} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(dias).map((dia) => (
                <div key={dia} className="space-y-2">
                  <label className="text-sm">{dia}</label>
                  <Textarea
                    value={dias[dia]}
                    onChange={(e) => handleDiaChange(dia, e.target.value)}
                    placeholder="Ex.: Agachamento 4x10\nSupino reto 4x8\nRemada curvada 3x12"
                    className="min-h-[140px]"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm">Observações</label>
              <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Instruções gerais, descanso, intervalos, técnica..." />
            </div>
          </CardContent>
        </Card>

        <div ref={printableRef} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <PrintableSheet aluno={aluno} objetivo={objetivo} nivel={nivel} semanas={semanas} observacoes={observacoes} dias={dias} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TreinosPdfPage;