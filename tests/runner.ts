import fs from 'fs';
import path from 'path';

// --- Configuração ---
const BASE_URL = 'http://localhost:3000'; // Ajuste se sua porta for 3333
const REPORT_DIR = path.resolve(__dirname, '..', '..', 'reports');
const REPORT_FILE = path.join(REPORT_DIR, 'test-report.html');

// --- Estrutura para guardar resultados ---
type TestResult = {
    name: string;
    status: 'PASS' | 'FAIL';
    message?: string;
    duration: number;
};

const results: TestResult[] = [];

// --- Função Auxiliar de Asserção (O nosso "expect") ---
function assert(condition: boolean, message: string) {
    if (!condition) {
        throw new Error(message);
    }
}

// --- Função que roda um teste ---
async function runTest(name: string, testFn: () => Promise<void>) {
    const start = performance.now();
    try {
        process.stdout.write(`Rodando: ${name}... `);
        await testFn();
        console.log('✅ PASS');
        results.push({ name, status: 'PASS', duration: performance.now() - start });
    } catch (error: any) {
        console.log('❌ FAIL');
        console.error(`   Erro: ${error.message}`);
        results.push({ 
            name, 
            status: 'FAIL', 
            message: error.message, 
            duration: performance.now() - start 
        });
    }
}

// --- Geração do HTML ---
function generateHTML() {
    const total = results.length;
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = total - passed;
    const color = failed === 0 ? '#4caf50' : '#f44336'; // Verde ou Vermelho

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Relatório de Testes (Manual)</title>
        <style>
            body { font-family: sans-serif; padding: 20px; background: #f0f2f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            h1 { text-align: center; color: #333; }
            .summary { display: flex; justify-content: space-around; padding: 20px; background: #eee; border-radius: 8px; margin-bottom: 20px; }
            .badge { padding: 5px 10px; border-radius: 4px; color: white; font-weight: bold; }
            .pass { background-color: #4caf50; }
            .fail { background-color: #f44336; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8f9fa; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Relatório de Execução</h1>
            <div class="summary" style="border-left: 5px solid ${color}">
                <div>Total: <strong>${total}</strong></div>
                <div style="color: #4caf50">Sucesso: <strong>${passed}</strong></div>
                <div style="color: #f44336">Falhas: <strong>${failed}</strong></div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Teste</th>
                        <th>Duração</th>
                        <th>Erro</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(r => `
                        <tr>
                            <td><span class="badge ${r.status.toLowerCase()}">${r.status}</span></td>
                            <td>${r.name}</td>
                            <td>${r.duration.toFixed(2)}ms</td>
                            <td style="color: #f44336; font-size: 0.9em;">${r.message || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p style="text-align: center; margin-top: 20px; color: #777;">Gerado automaticamente via Script Manual</p>
        </div>
    </body>
    </html>
    `;

    // Garante que a pasta existe
    if (!fs.existsSync(REPORT_DIR)) {
        fs.mkdirSync(REPORT_DIR, { recursive: true });
    }

    fs.writeFileSync(REPORT_FILE, html);
    console.log(`\n📄 Relatório gerado em: ${REPORT_FILE}`);
}

// --- EXECUÇÃO DOS CASOS DE TESTE ---
async function main() {
    console.log('🚀 Iniciando bateria de testes manuais...\n');

    // Teste 1: Rota simples (Health Check)
    // Nota: O servidor DEVE estar rodando em outro terminal
    await runTest('GET / (Verificar se API está online)', async () => {
        // Usamos o fetch nativo do Node 18+
        // Tente acessar uma rota que existe, ex: /barbeiros ou uma rota raiz
        const response = await fetch(`${BASE_URL}/barbeiros`);
        
        // Verifica se conectou
        assert(response.ok, `Esperado status 200-299, recebeu ${response.status}`);
    });

    // Teste 2: Listagem de Barbeiros
    await runTest('GET /barbeiros deve retornar array', async () => {
        const response = await fetch(`${BASE_URL}/barbeiros`);
        const dados = await response.json();

        assert(Array.isArray(dados), 'A resposta deveria ser uma lista (array)');
        if (dados.length > 0) {
            assert('nome_profissional' in dados[0], 'O barbeiro deve ter nome_profissional');
        }
    });

    // Teste 3: Tentar rota inexistente (Erro 404)
    await runTest('GET /rota-inexistente deve dar 404', async () => {
        const response = await fetch(`${BASE_URL}/rota-muito-louca`);
        assert(response.status === 404, `Esperado 404, recebeu ${response.status}`);
    });

    // Finaliza e gera relatório
    generateHTML();
}

main();