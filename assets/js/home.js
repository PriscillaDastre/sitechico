/* ============================================================
   home.js — hero, filtros, grid, bairros
   ============================================================ */
(function () {
  'use strict';
  var A = window.App, I = A.ICONS, $ = A.$, esc = A.esc, fmt = A.fmt;
  var PER_PAGE = 12;

  A.mountChrome({ ativo: 'Início' });
  A.mountFooter();
  A.mountWA();

  /* ---------- hero: preencher selects ---------- */
  var f = A.faceis();
  var todos = A.Store.all();

  function opts(sel, arr, ph) {
    sel.innerHTML = '<option value="">' + ph + '</option>' +
      arr.map(function (v) { return '<option value="' + esc(v) + '">' + esc(v) + '</option>'; }).join('');
  }
  opts($('#qTipo'), f.tipos, 'Tipo de imóvel');
  opts($('#qLocal'), f.cidades.concat(f.bairros).sort(), 'Onde procurar');

  var precoOpts = [
    [150000, 'Até R$ 150 mil'], [300000, 'Até R$ 300 mil'], [500000, 'Até R$ 500 mil'],
    [800000, 'Até R$ 800 mil'], [1200000, 'Até R$ 1,2 mi'], [2000000, 'Até R$ 2 mi'],
    [5000000, 'Até R$ 5 mi']
  ];
  $('#qPreco').innerHTML = '<option value="">Até quanto?</option>' +
    precoOpts.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join('');

  /* ---------- stats ---------- */
  var stats = {
    total: todos.length,
    venda: todos.filter(function (p) { return p.finalidade === 'venda'; }).length,
    aluguel: todos.filter(function (p) { return p.finalidade === 'aluguel'; }).length,
    cidades: f.cidades.length
  };
  Object.keys(stats).forEach(function (k) {
    var n = $('[data-stat="' + k + '"]');
    if (n) countUp(n, stats[k]);
  });
  function countUp(node, target) {
    var t0 = performance.now(), dur = 750;
    (function step(t) {
      var p = Math.min(1, (t - t0) / dur);
      node.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- estado dos filtros ---------- */
  var S = {
    tipo: '', fim: '', cidade: '', bairro: '',
    pmin: '', pmax: '', quartos: '', area: '',
    destaque: false, fav: false,
    ordem: 'relevancia', view: 'grid', shown: PER_PAGE
  };

  /* ---------- chips de tipo ---------- */
  function renderChips() {
    var counts = {};
    todos.forEach(function (p) { counts[p.tipo] = (counts[p.tipo] || 0) + 1; });
    var box = $('#tipoChips');
    box.innerHTML = '<button class="chip' + (S.tipo ? '' : ' on') + '" data-tipo="">Todos' +
      '<span class="n">' + todos.length + '</span></button>' +
      f.tipos.map(function (t) {
        return '<button class="chip' + (S.tipo === t ? ' on' : '') + '" data-tipo="' + esc(t) + '">' +
          esc(t) + '<span class="n">' + (counts[t] || 0) + '</span></button>';
      }).join('');
  }

  /* ---------- painel de filtros ---------- */
  $('#fCidade').innerHTML = '<option value="">Todas</option>' +
    f.cidades.map(function (c) { return '<option value="' + esc(c) + '">' + esc(c) + '</option>'; }).join('');
  $('#fBairro').innerHTML = '<option value="">Todos</option>' +
    f.bairros.map(function (b) { return '<option value="' + esc(b) + '">' + esc(b) + '</option>'; }).join('');
  $('#fPrecoMin').innerHTML = '<option value="">mín.</option>' +
    precoOpts.map(function (o) { return '<option value="' + o[0] + '">' + o[1].replace('Até ', '') + '</option>'; }).join('');
  $('#fPrecoMax').innerHTML = '<option value="">máx.</option>' +
    precoOpts.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join('');

  /* ---------- filtrar ---------- */
  function filtrar() {
    var out = A.Store.all();
    if (S.tipo) out = out.filter(function (p) { return p.tipo === S.tipo; });
    if (S.fim) out = out.filter(function (p) { return p.finalidade === S.fim; });
    if (S.cidade) out = out.filter(function (p) { return p.cidade === S.cidade; });
    if (S.bairro) out = out.filter(function (p) { return p.bairro === S.bairro; });
    if (S.pmin) out = out.filter(function (p) { return p.preco != null && p.preco >= +S.pmin; });
    if (S.pmax) out = out.filter(function (p) { return p.preco != null && p.preco <= +S.pmax; });
    if (S.quartos) out = out.filter(function (p) { return (p.quartos || 0) >= +S.quartos; });
    if (S.area) out = out.filter(function (p) { return (p.area || 0) >= +S.area; });
    if (S.destaque) out = out.filter(function (p) { return p.destaque; });
    if (S.fav) out = out.filter(function (p) { return A.Favs.has(p.id); });

    out.sort(function (a, b) {
      if (S.ordem === 'menor') return (a.preco == null ? 1e15 : a.preco) - (b.preco == null ? 1e15 : b.preco);
      if (S.ordem === 'maior') return (b.preco == null ? -1e15 : b.preco) - (a.preco == null ? -1e15 : a.preco);
      if (S.ordem === 'area') return (b.area || 0) - (a.area || 0);
      if (S.ordem === 'novo') return (b.criadoEm || 0) - (a.criadoEm || 0);
      // relevancia: destaque, depois com foto, depois menor preço
      var da = (a.destaque ? 0 : 1), db = (b.destaque ? 0 : 1);
      if (da !== db) return da - db;
      return (a.preco == null ? 1e15 : a.preco) - (b.preco == null ? 1e15 : b.preco);
    });
    return out;
  }

  function nFiltros() {
    return ['tipo', 'fim', 'cidade', 'bairro', 'pmin', 'pmax', 'quartos', 'area']
      .filter(function (k) { return S[k]; }).length + (S.destaque ? 1 : 0) + (S.fav ? 1 : 0);
  }

  /* ---------- render ---------- */
  var grid = $('#grid'), emptyBox = $('#emptyBox');

  function render() {
    var lista = filtrar();
    var vis = lista.slice(0, S.shown);

    // chips
    A.$$('#tipoChips .chip').forEach(function (c) {
      c.classList.toggle('on', (c.getAttribute('data-tipo') || '') === S.tipo);
    });
    A.$$('.chip[data-fim]').forEach(function (c) {
      c.classList.toggle('on', c.getAttribute('data-fim') === S.fim);
    });

    // contador
    var txt = '<b>' + lista.length + '</b> imóvel' + (lista.length === 1 ? '' : 'is') +
      (lista.length ? ' encontrado' + (lista.length === 1 ? '' : 's') : ' encontrado' + (lista.length === 1 ? '' : 's'));
    if (nFiltros()) txt += ' <span style="opacity:.6">· filtrado</span>';
    $('#resultCount').innerHTML = txt;

    // badge do botão de filtros
    var n = nFiltros();
    $('#btnFiltros').innerHTML = I.filter + 'Filtros' + (n ? '<span class="n">' + n + '</span>' : '');
    $('#btnFiltros').classList.toggle('on', n > 0);

    // grade
    grid.className = 'grid' + (S.view === 'list' ? ' list' : '');
    if (!lista.length) {
      grid.innerHTML = '';
      emptyBox.hidden = false;
      emptyBox.innerHTML =
        '<div class="empty">' +
          '<div class="ico">' + I.search + '</div>' +
          '<h3>Nenhum imóvel com esses filtros</h3>' +
          '<p>Tente aumentar o valor máximo, tirar o filtro de dormitórios ou limpar tudo para ver o portfólio completo.</p>' +
          '<button class="btn btn-primary" id="emptyLimpar">Limpar filtros</button>' +
        '</div>';
      var eb = $('#emptyLimpar');
      if (eb) eb.addEventListener('click', limpar);
      $('#moreBox').hidden = true;
      return;
    }
    emptyBox.hidden = true;
    grid.innerHTML = A.gridHTML(vis);
    var resta = lista.length - S.shown, n = Math.max(0, Math.min(PER_PAGE, resta));
    $('#moreBox').hidden = resta <= 0;
    $('#moreBox').style.display = resta <= 0 ? 'none' : '';   // garante que some mesmo com CSS próprio
    $('#btnMais').textContent = 'Carregar mais ' + n + (n === 1 ? ' imóvel' : ' imóveis');
  }

  /* skeleton no primeiro render */
  (function skeleton() {
    grid.innerHTML = new Array(6).join('x').split('x').map(function () {
      return '<div class="skel"><div class="s-media"></div><div class="s-body">' +
        '<div class="s-bar w60"></div><div class="s-bar w40"></div></div></div>';
    }).join('');
    setTimeout(render, 220);
  })();

  /* ---------- eventos ---------- */
  $('#tipoChips').addEventListener('click', function (e) {
    var c = e.target.closest('.chip'); if (!c) return;
    S.tipo = c.getAttribute('data-tipo'); S.shown = PER_PAGE; render();
  });
  A.$$('.chip[data-fim]').forEach(function (c) {
    c.addEventListener('click', function () {
      S.fim = S.fim === c.getAttribute('data-fim') ? '' : c.getAttribute('data-fim');
      S.shown = PER_PAGE; render();
    });
  });

  var filtros = $('#filtros');
  $('#btnFiltros').addEventListener('click', function () {
    var on = filtros.classList.toggle('open');
    this.setAttribute('aria-expanded', on);
  });
  $('#btnFecharFiltros').addEventListener('click', function () {
    filtros.classList.remove('open');
    $('#btnFiltros').setAttribute('aria-expanded', 'false');
  });
  $('#btnLimpar').addEventListener('click', limpar);
  $('#verTodos').addEventListener('click', function () { limpar(); });

  function limpar() {
    S.tipo = ''; S.fim = ''; S.cidade = ''; S.bairro = ''; S.pmin = ''; S.pmax = '';
    S.quartos = ''; S.area = ''; S.destaque = false; S.fav = false; S.shown = PER_PAGE;
    ['#fCidade', '#fBairro', '#fPrecoMin', '#fPrecoMax', '#fQuartos', '#fArea'].forEach(function (s) { $(s).value = ''; });
    $('#fDestaque').checked = false; $('#fFav').checked = false;
    render();
  }

  [['#fCidade', 'cidade'], ['#fBairro', 'bairro'], ['#fPrecoMin', 'pmin'], ['#fPrecoMax', 'pmax'],
  ['#fQuartos', 'quartos'], ['#fArea', 'area']].forEach(function (p) {
    $(p[0]).addEventListener('change', function () { S[p[1]] = this.value; S.shown = PER_PAGE; render(); });
  });
  $('#fDestaque').addEventListener('change', function () { S.destaque = this.checked; S.shown = PER_PAGE; render(); });
  $('#fFav').addEventListener('change', function () { S.fav = this.checked; S.shown = PER_PAGE; render(); });
  $('#fOrdem').addEventListener('change', function () { S.ordem = this.value; render(); });
  $('#btnMais').addEventListener('click', function () { if ($('#moreBox').hidden) return; S.shown += PER_PAGE; render(); });

  A.$$('.viewtoggle button').forEach(function (b) {
    b.addEventListener('click', function () {
      A.$$('.viewtoggle button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on'); S.view = b.getAttribute('data-view'); render();
    });
  });

  /* ---------- busca rápida do hero ---------- */
  $('#quickSearch').addEventListener('submit', function (e) {
    e.preventDefault();
    var t = this.tipo.value, fim = this.finalidade.value, loc = this.local.value, pre = this.preco.value;
    S.tipo = t || ''; S.fim = fim || '';
    S.cidade = f.cidades.indexOf(loc) > -1 ? loc : '';
    S.bairro = f.bairros.indexOf(loc) > -1 ? loc : '';
    S.pmax = pre || ''; S.pmin = ''; S.quartos = ''; S.area = ''; S.destaque = false; S.fav = false;
    S.shown = PER_PAGE;
    ['#fCidade', '#fBairro', '#fPrecoMin', '#fPrecoMax', '#fQuartos', '#fArea'].forEach(function (s) { $(s).value = ''; });
    $('#fCidade').value = S.cidade; $('#fBairro').value = S.bairro; $('#fPrecoMax').value = S.pmax;
    render();
    document.getElementById('imoveis').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------- bairros ---------- */
  /* Capos verificados (Unsplash). Se o Unsplash remover uma foto, o fallback
     .img-fallback segura o layout — mas vale trocar a lista periodicamente. */
  var FOTOS_BAIRRO = [
    '1448630360428-65456885c650', '1560518883-ce09059eeffa', '1512917774080-9991f1c4c750',
    '1523217582562-09d0def993a6', '1570129477492-45c003edd2be', '1568605114967-8130f3a36994',
    '1449844908441-8829872d2607', '1616486338812-3dadae4b4ace'
  ];
  var cntB = {};
  todos.forEach(function (p) { cntB[p.bairro] = (cntB[p.bairro] || 0) + 1; });
  var top = Object.keys(cntB).sort(function (a, b) { return cntB[b] - cntB[a]; }).slice(0, 8);
  $('#neighGrid').innerHTML = top.map(function (b, i) {
    return '<a href="#imoveis" data-bairro="' + esc(b) + '">' +
      '<img src="https://images.unsplash.com/photo-' + FOTOS_BAIRRO[i % FOTOS_BAIRRO.length] + '?auto=format&fit=crop&w=600&q=66" alt="" loading="lazy">' +
      '<b>' + esc(b) + '</b><span>' + cntB[b] + ' imóvel' + (cntB[b] > 1 ? 'is' : '') + '</span></a>';
  }).join('');
  $('#neighGrid').addEventListener('click', function (e) {
    var a = e.target.closest('[data-bairro]'); if (!a) return;
    e.preventDefault();
    limpar();
    S.bairro = a.getAttribute('data-bairro'); $('#fBairro').value = S.bairro;
    render();
    document.getElementById('imoveis').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------- WhatsApp ---------- */
  var waMsg = 'Olá Chico! Vim pelo site e gostaria de ajuda para encontrar um imóvel.';
  $('#heroWa').href = fmt.wa(waMsg);
  $('#ctaWa').href = fmt.wa(waMsg);

  /* ---------- url sync ---------- */
  function fromURL() {
    var t = A.qs('tipo'), b = A.qs('bairro'), c = A.qs('cidade'), fm = A.qs('finalidade');
    if (t) S.tipo = t; if (b) S.bairro = b; if (c) S.cidade = c; if (fm) S.fim = fm;
    if (S.cidade) $('#fCidade').value = S.cidade;
    if (S.bairro) $('#fBairro').value = S.bairro;
  }
  fromURL();

  /* ---------- ícones estáticos ---------- */
  A.$$('[data-ic]').forEach(function (n) { n.innerHTML = I[n.getAttribute('data-ic')] || ''; });
  $('#vGrid').innerHTML = I.grid;
  $('#vList').innerHTML = I.list;
  renderChips();
  render();

  // re-renderiza ao voltar dos favoritos em outra aba
  window.addEventListener('storage', function (e) { if (e.key && e.key.indexOf('cm-') === 0) render(); });
})();
