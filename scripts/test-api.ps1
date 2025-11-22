# Script para testar endpoints da API
$baseUrl = "https://douglaspersonal-three.vercel.app"

Write-Host "`n🚀 Testando endpoints da API..." -ForegroundColor Cyan
Write-Host "📍 Base URL: $baseUrl`n" -ForegroundColor Gray
Write-Host "=" * 60 -ForegroundColor Gray

$endpoints = @(
    @{ Name = "Test Supabase"; Url = "/api/test-supabase" },
    @{ Name = "Fichas Treino"; Url = "/api/fichas-treino" },
    @{ Name = "Students"; Url = "/api/admin/students" },
    @{ Name = "Blocos Horários"; Url = "/api/admin/blocos-horarios" },
    @{ Name = "Agendamentos"; Url = "/api/admin/agendamentos" },
    @{ Name = "Planos Alimentares"; Url = "/api/planos-alimentares" },
    @{ Name = "Treinos PDF"; Url = "/api/treinos-pdf" }
)

foreach ($endpoint in $endpoints) {
    Write-Host "`n🔵 Testando: $($endpoint.Name)" -ForegroundColor Blue
    Write-Host "   URL: $baseUrl$($endpoint.Url)" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$($endpoint.Url)" -Method GET -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($endpoint.Name): OK ($($response.StatusCode))" -ForegroundColor Green
            
            $data = $response.Content | ConvertFrom-Json
            if ($data -is [Array]) {
                Write-Host "   📊 Retornou $($data.Count) registros" -ForegroundColor Gray
            } elseif ($data.success) {
                Write-Host "   ✅ $($data.message)" -ForegroundColor Gray
            }
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "❌ $($endpoint.Name): ERRO ($statusCode)" -ForegroundColor Red
        
        try {
            $errorContent = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "   Erro: $($errorContent.error)" -ForegroundColor Red
            if ($errorContent.details) {
                Write-Host "   Detalhes: $($errorContent.details)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
Write-Host "✅ Testes concluídos!`n" -ForegroundColor Green
