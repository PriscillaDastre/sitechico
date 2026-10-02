# Site — Chico Marques · Corretor de Imóveis (Itajubá/MG)

Reconstrução completa do site antigo (Joomla + JEA) em HTML/CSS/JS puro, sem build,
sem framework e sem servidor. Abre com dois cliques.

**O que entrou:** layout novo, listagem com filtros de verdade, página de imóvel
com galeria e mapa, e uma **área do corretor para cadastrar imóveis novos**.

---

## O que tem aqui

| Arquivo | O que é |
|---|---|
| `index.html` | Home: hero com busca, filtros, grade de imóveis, bairros, sobre, FAQ |
| `imovel.html?id=CODIGO` | Página de um imóvel: galeria, medidas, mapa, WhatsApp, similares |
| `contato.html` | Contato: formulário que abre o WhatsApp com a mensagem pronta |
| `corretor.html` | **Área do corretor** (senha: `chico2026`) |
| `assets/css/styles.css` | Design system inteiro (tokens, componentes, responsivo, impressão) |
| `assets/js/data.js` | Os 65 imóveis migrados do site antigo — **gerado**, não editar à mão |
| `assets/js/app.js` | Núcleo: dados, formatação, header/footer, favoritos, card |
| `assets/js/home.js` | Filtros, ordenação e grid da home |
| `assets/js/detail.js` | Galeria, lightbox, mapa, imóveis similares |
| `assets/js/admin.js` | Painel: login, CRUD, upload de fotos, backup |
| `tools/build_data.py` | Script que gera o `data.js` a partir do inventário |
| `tools/smoke.js` | 65 testes automatizados num Chromium real |

## Como abrir

```bash
# qualquer servidor local serve
python3 -m http.server 8000
# depois abra http://localhost:8000
```

Não precisa de servidor nenhum pra ver, mas se abrir o `index.html` direto pelo
`file://` os filtros por URL podem não variar — por isso o comando acima.

---

## Banco de dados

A área do corretor usa **Supabase** (login, dados e fotos). Siga `COLOCAR-NO-AR.md`.

---

## Antes de publicar

1. **Criar o login do corretor** no Supabase (veja `COLOCAR-NO-AR.md`).
2. **Ajustar os dados de contato** — mesmo lugar, bloco `CONFIG`:
   nome, telefone/WhatsApp, e-mail, cidade e CRECI.
3. **Trocar as fotos** — as imagens atuais são de banco gratuito (Unsplash) e
   servem só para o layout ficar legível. As fotos reais dos imóveis estão no
   servidor antigo e não puderam ser baixadas: o site bloqueia requisição
   externa. Suba as verdadeiras pelo painel.
4. **Revisar metragem e dormitórios** — o JEA não publicava esses campos, então
   foram gerados como preenchimento provisório coerente com o tipo e o preço.
   Códigos, tipos, bairros, cidades e valores são reais. Ajuste no painel.

### Dois preços que valem conferência

- `AP-080` (Centro, R$ 2.600) e `IM-008` (Galpão Santa Helena, R$ 4.500) foram
  marcados como **aluguel** — o valor é claramente mensal, não de venda.
- `TR-071` e `TR-061` estão como **"Sob consulta"** (o site antigo não informava valor).

---

## Dados migrados

65 imóveis · 5 cidades · 27 bairros · 11 tipos

Itajubá, Pedralva, Piranguinho, Delfim Moreira, Santa Rita do Sapucaí e
São José do Alegre.

Para regerar o `assets/js/data.js` depois de ajustar o inventário, edite a lista
`INV` no `tools/build_data.py` e rode:

```bash
python3 tools/build_data.py
```

## Testes

```bash
npm i -g playwright && npx playwright install chromium
NODE_PATH=$(npm root -g) node tools/smoke.js
```

65 checagens: renderização das 4 páginas, filtros, ordenação, galeria, mapa,
login, cadastro, edição, ocultação, exclusão, lixeira, restore, exportação,
formulário de contato, responsivo em 390px e ausência de erros de JS.

---

## Acessibilidade e robustez

- teclado funciona na galeria (setas, Esc) e o lightbox fecha com Esc;
- campos com `<label>` ligado, erro de validação foca o primeiro campo inválido;
- menu mobile, `aria-label` nos botões só com ícone, foco visível;
- `prefers-reduced-motion` desliga as animações;
- folha de estilo de impressão;
- foto quebrada cai em um bloco com o nome do imóvel em vez de vazar layout;
- `noscript` não se aplica aqui (o site inteiro é JS) — se precisar de
  indexação, o próximo passo é gerar HTML estático dos imóveis.
