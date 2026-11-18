# My Routine

Aplicativo pessoal de organização da rotina, com dados mantidos localmente no dispositivo.

## Requisitos

- Node.js 20.19+ ou 22.12+
- npm

## Executar

```bash
npm install
npm run dev
```

O Vite exibirá no terminal o endereço local para abrir no navegador.

## Build de produção

```bash
npm run build
npm run preview
```

## Dados e privacidade

Não há login, servidor ou sincronização. Os registros são salvos no IndexedDB deste navegador e dispositivo; preferências simples podem usar `localStorage`. Em Configurações, é possível exportar ou restaurar um backup JSON. Limpar os dados do navegador remove esses registros; mantenha uma cópia de backup para evitar perda.

O `vite-plugin-pwa` gera o manifesto de instalação e o service worker no build de produção, com cache dos arquivos da aplicação para uso offline após a primeira carga. O manifesto inclui ícones PNG de 192×192 e 512×512. A instalação e os recursos de service worker dependem de servir o build em HTTPS ou em `localhost`.

## Módulos

Dashboard, Agenda, Academia, Skin care, Alimentação, Hábitos, Evolução e Configurações. Os registros não são preenchidos com dados de demonstração.