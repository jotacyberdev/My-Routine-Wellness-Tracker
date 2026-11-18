# 🌿 My Routine

**My Routine** é um aplicativo web instalável (**PWA**) de organização pessoal e bem-estar desenvolvido com foco em **privacidade e funcionamento offline**. Ele centraliza agenda, hábitos, treinos, rotina de skin care, alimentação e gráficos de evolução diretamente no dispositivo do usuário, sem exigir contas ou servidores externos.

## ✨ Funcionalidades e Módulos

* **📊 Visão Geral (Dashboard):**
  * Anel de progresso dinâmico com percentual das atividades concluídas no dia.
  * Lista unificada de tarefas de hoje, prévia dos próximos compromissos e acompanhamento rápido de hábitos.
  * Modal de **Adição Rápida (`+ Adicionar`)** acessível de qualquer tela.
* **📅 Agenda:** Planejamento de compromissos e atividades por data com horários e observações.
* **🏋️ Academia:** Registro de treinos, exercícios, séries e cargas para acompanhar a consistência física.
* **✨ Skin Care:** Organização das etapas de cuidados matinais e noturnos.
* **🥗 Alimentação & Hidratação:** Registro de refeições por categoria (*Café da manhã, Almoço, Lanche e Jantar*) e contador interativo de ingestão diária de água (`+250 ml` com reinício automático ao virar o dia).
* **🎯 Hábitos:** Criação e acompanhamento de metas diárias para construir constância.
* **📈 Evolução:**
  * Gráfico de área interativo (**Recharts**) exibindo a consistência diária nos últimos 7 dias.
  * Métricas acumuladas de atividades, hábitos e treinos concluídos.
  * Registro opcional de histórico de peso corporal.
* **⚙️ Configurações & Privacidade:**
  * **Zero rastreamento:** Não exige login nem envia dados para a nuvem.
  * **Persistência Local:** Armazenamento no navegador via **IndexedDB** e `localStorage`.
  * **Backup Portátil:** Exportação e restauração completa dos dados em arquivo `.json`.

## 🛠️ Tecnologias Utilizadas

* **React 18 & TypeScript:** Componentização e tipagem estática.
* **Vite 6 & `vite-plugin-pwa`:** Build otimizado, Service Worker e manifesto PWA para instalação em desktop e mobile com suporte offline.
* **Tailwind CSS v4:** Estilização moderna e responsiva.
* **Lucide React:** Biblioteca de ícones minimalistas.
* **Recharts:** Visualização gráfica da consistência semanal.
* **IndexedDB / Web Storage:** Persistência local dos registros.

## 🗂️ Estrutura do Projeto

```text
├── public/                 # Ícones do PWA (192x192, 512x512 e SVG)
├── src/
│   ├── services/
│   │   └── storage.ts      # Camada de persistência no IndexedDB / localStorage
│   ├── App.tsx             # Módulos, dashboard, gráficos e lógica principal
│   ├── main.tsx            # Ponto de entrada da aplicação React
│   └── index.css           # Estilos e tokens visuais
├── index.html              # Estrutura HTML base
├── package.json            # Dependências e scripts
├── tsconfig.json           # Configurações do TypeScript
└── vite.config.ts          # Configuração do Vite e do PWA
```

## 💻 Como Executar

### Pré-requisitos
* **Node.js** (versão `20.19+` ou `22.12+` recomendada) e **npm**.

### Passo a passo
1. Clone este repositório:
   ```bash
   git clone https://github.com
   ```
2. Acesse a pasta do projeto:
   ```bash
   cd My-Routine-Wellness-Tracker
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```
   *(O Vite exibirá no terminal o endereço local para abrir no navegador, geralmente `http://localhost:5173`).*

### Build de Produção e Teste de PWA
Para testar a instalação como aplicativo (PWA) e o funcionamento offline via Service Worker:
```bash
npm run build
npm run preview
```
