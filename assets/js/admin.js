/* ============================================================
   admin.js — área do corretor
   login · painel · CRUD de imóveis · fotos · backup
   ============================================================ */
(function () {
  'use strict';
  var A = window.App, I = A.ICONS, $ = A.$, $$ = A.$$, esc = A.esc, fmt = A.fmt, el = A.el;
  var app = $('#app');

  A.mountChrome({ ativo: '' });
  A.mountFooter();

  if (A.Auth.isLogged()) painel(); else login();

  /* ============================================================
     LOGIN
     ============================================================ */
  function login() {
    document.title = 'Entrar · Área do corretor';
    app.innerHTML =
      '<div class="admin-login"><div class="login-box">' +
        '<div class="lg">' + I.key + '</div>' +
        '<h2>Área do corretor</h2>' +
        '<p>Acesso restrito para gerenciar os imóveis.</p>' +
        '<form id="loginForm">' +
          '<div class="f" style="margin-bottom:14px"><label for="em">E-mail</label>' +
            '<input type="email" id="em" autocomplete="username" required autofocus></div>' +
          '<div class="f" style="margin-bottom:14px"><label for="pwd">Senha</label>' +
            '<input type="password" id="pwd" autocomplete="current-password" required></div>' +
          '<button class="btn btn-primary btn-block" type="submit">' + I.lock + 'Entrar</button>' +
        '</form>' +
      '</div></div>';

    $('#loginForm').addEventListener('submit', function (e) {
      e.preventDefault();
      A.Auth.login($('#em').value.trim(), $('#pwd').value).then(function () {
        A.toast('Bem-vindo de volta!');
        painel();
      }).catch(function () {
        A.toast('E-mail ou senha incorretos.', 'err');
        $('#pwd').value = ''; $('#pwd').focus();
      });
    });
  }

  /* ============================================================
     PAINEL
     ============================================================ */
  var V = 'dashboard';       // view atual
  var busca = '';
  var pagina = 1;
  var POR_PAG = 10;

  function painel() {
    app.innerHTML =
      '<div class="wrap"><div class="admin">' +
        '<aside class="aside">' +
          '<div class="aside-card">' +
            '<div style="font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:12px">Gerenciar</div>' +
            '<nav class="aside-nav" id="nav">' +
              navBtn('dashboard', I.chart, 'Painel') +
              navBtn('lista', I.box, 'Imóveis') +
              navBtn('novo', I.plus, 'Novo imóvel') +
            '</nav>' +
          '</div>' +
          '<div class="aside-card bot">' +
            '<div style="font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:12px">Conta</div>' +
            '<nav class="aside-nav" id="nav2">' +
              navBtn('ajustes', I.key, 'Ajustes e backup') +
            '</nav>' +
          '</div>' +
          '<div class="aside-card bot aside-meta">' +
            '<b>' + esc(A.CONFIG.nome) + '</b><br>' +
            A.CONFIG.fone + '<br>' +
            '<button class="btn btn-ghost btn-sm" id="sair" style="margin-top:12px;width:100%">' + I.out + 'Sair</button>' +
          '</div>' +
        '</aside>' +
        '<div id="view"></div>' +
      '</div></div>';

    $('#sair').addEventListener('click', function () {
      A.Auth.logout();
      A.toast('Sessão encerrada.'); login();
    });
    $$('#nav button, #nav2 button').forEach(function (b) {
      b.addEventListener('click', function () { ir(b.getAttribute('data-v')); });
    });
    ir(V);
  }

  function navBtn(v, icon, label) {
    return '<button data-v="' + v + '">' + icon + '<span>' + label + '</span></button>';
  }

  function ir(v) {
    V = v;
    $$('#nav button, #nav2 button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-v') === v);
    });
    if (v === 'dashboard') vDashboard();
    else if (v === 'lista') vLista();
    else if (v === 'novo') vForm(null);
    else if (v === 'editar') vForm(EDITANDO);
    else if (v === 'ajustes') vAjustes();
  }

  var view = function () { return $('#view'); };

  /* ============================================================
     DASHBOARD
     ============================================================ */
  function vDashboard() {
    var l = A.Store.allAdmin();
    var pub = l.filter(function (p) { return p.publicado !== false && !p.removido; });
    var venda = pub.filter(function (p) { return p.finalidade === 'venda'; });
    var aluguel = pub.filter(function (p) { return p.finalidade === 'aluguel'; });
    var semFoto = pub.filter(function (p) { return !p.fotos || !p.fotos.length; });
    var editable = l.filter(function (p) { return (A.Store.state().overrides[p.id] || p.origem !== 'site-antigo'); }).length;

    view().innerHTML =
      '<div class="kpis">' +
        kpi('Imóveis publicados', pub.length, I.box, true) +
        kpi('À venda', venda.length, I.money) +
        kpi('Para alugar', aluguel.length, I.key) +
        kpi('Editados por você', editable, I.pencil) +
      '</div>' +

      (semFoto.length ? '<div class="note-box warn">' + I.alert +
        '<div><b>' + semFoto.length + ' imóvel(is) sem foto.</b> Imóvel sem foto praticamente não aparece nas buscas. ' +
        '<button class="btn btn-ghost btn-sm" id="verSemFoto" style="margin-top:9px">Ver e corrigir</button></div></div>' : '') +

      '<div class="panel">' +
        '<div class="panel-head"><h3>Movimentação recente</h3>' +
          '<div class="tools"><button class="btn btn-ghost btn-sm" id="addNovo">' + I.plus + 'Novo imóvel</button></div>' +
        '</div>' +
        '<div id="tabRecente">' + tabela(l.slice(0, 6), false) + '</div>' +
      '</div>';

    $('#addNovo').addEventListener('click', function () { editar(null); });
    var vsf = $('#verSemFoto');
    if (vsf) vsf.addEventListener('click', function () { busca = ''; ir('lista'); setTimeout(function () { $('#q').value = 'semfoto'; busca = 'semfoto'; renderTab(); }, 30); });
  }

  function kpi(label, val, icon, acc) {
    return '<div class="kpi' + (acc ? ' acc' : '') + '">' +
      '<span class="ico">' + icon + '</span><b>' + val + '</b><span>' + label + '</span></div>';
  }

  /* ============================================================
     LISTA
     ============================================================ */
  function vLista() {
    view().innerHTML =
      '<div class="panel">' +
        '<div class="panel-head">' +
          '<h3>Todos os imóveis</h3>' +
          '<div class="tools">' +
            '<div class="search-mini">' + I.search + '<input id="q" placeholder="Buscar por código, bairro ou tipo…" value="' + esc(busca) + '"></div>' +
            '<button class="btn btn-primary btn-sm" id="addNovo2">' + I.plus + 'Novo imóvel</button>' +
          '</div>' +
        '</div>' +
        '<div id="tabArea"></div>' +
      '</div>';
    $('#q').addEventListener('input', A.debounce(function () {
      busca = this.value; pagina = 1; renderTab();
    }, 200));
    $('#addNovo2').addEventListener('click', function () { editar(null); });
    renderTab();
  }

  function filtrados() {
    var q = busca.trim().toLowerCase();
    var l = A.Store.allAdmin();
    // o que o corretor mexeu por último sobe para o topo — senão um imóvel
    // recém-criado cai na última página e ele acha que não salvou.
    l.sort(function (a, b) {
      var ta = a.atualizadoEm || a.criadoEm || 0, tb = b.atualizadoEm || b.criadoEm || 0;
      if (tb !== ta) return tb - ta;
      return String(a.codigo || a.id).localeCompare(String(b.codigo || b.id));
    });
    l = l.filter(function (p) { return !p.removido; });   // excluídos ficam só na lixeira
    if (!q) return l;
    if (q === 'semfoto') return l.filter(function (p) { return !p.fotos || !p.fotos.length; });
    return l.filter(function (p) {
      return [p.codigo, p.id, p.tipo, p.bairro, p.cidade, p.descricao]
        .some(function (v) { return v && String(v).toLowerCase().indexOf(q) > -1; });
    });
  }

  function renderTab() {
    var l = filtrados();
    var total = Math.max(1, Math.ceil(l.length / POR_PAG));
    if (pagina > total) pagina = total;
    var fatia = l.slice((pagina - 1) * POR_PAG, pagina * POR_PAG);

    $('#tabArea').innerHTML =
      (l.length ? tabela(fatia, true) :
        '<div style="padding:46px 24px;text-align:center">' +
          '<div class="empty" style="border:0;padding:0">' +
            '<div class="ico">' + I.search + '</div><h3>Nada encontrado</h3>' +
            '<p>Tente outro termo ou cadastre um imóvel novo.</p></div>' +
        '</div>') +
      pager(l.length, total);

    A.$$('#tabArea [data-edit]').forEach(function (b) {
      b.addEventListener('click', function () { editar(b.getAttribute('data-edit')); });
    });
    A.$$('#tabArea [data-del]').forEach(function (b) {
      b.addEventListener('click', function () { apagar(b.getAttribute('data-del')); });
    });
    A.$$('#tabArea [data-tog]').forEach(function (b) {
      b.addEventListener('click', function () { togglePub(b.getAttribute('data-tog')); });
    });
    A.$$('#tabArea [data-rest]').forEach(function (b) {
      b.addEventListener('click', function () { restaurar(b.getAttribute('data-rest')); });
    });
    $$('#tabArea [data-pg]').forEach(function (b) {
      b.addEventListener('click', function () { pagina = +b.getAttribute('data-pg'); renderTab(); $('#tabArea').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    });
  }

  function pager(total, tp) {
    if (total <= POR_PAG) return '';
    var ini = (pagina - 1) * POR_PAG + 1, fim = Math.min(pagina * POR_PAG, total);
    var nums = [];
    for (var i = 1; i <= tp; i++) {
      if (i === 1 || i === tp || Math.abs(i - pagina) <= 1) nums.push(i);
      else if (nums[nums.length - 1] !== '…') nums.push('…');
    }
    return '<div class="pager">' +
      '<span class="info">Mostrando <b>' + ini + '–' + fim + '</b> de <b>' + total + '</b></span>' +
      '<div class="pager-btns">' +
        '<button data-pg="' + (pagina - 1) + '"' + (pagina === 1 ? ' disabled' : '') + '>' + I.chevL + '</button>' +
        nums.map(function (n) {
          return n === '…' ? '<button disabled>…</button>'
            : '<button data-pg="' + n + '"' + (n === pagina ? ' class="on"' : '') + '>' + n + '</button>';
        }).join('') +
        '<button data-pg="' + (pagina + 1) + '"' + (pagina === tp ? ' disabled' : '') + '>' + I.chevR + '</button>' +
      '</div></div>';
  }

  function tabela(l, full) {
    return '<div class="tbl-scroll"><table class="tbl"><thead><tr>' +
      '<th>Imóvel</th><th>Valor</th><th>Local</th><th>Situação</th>' +
      (full ? '<th style="text-align:right">Ações</th>' : '') +
      '</tr></thead><tbody>' +
      l.map(function (p) {
        var foto = (p.fotos && p.fotos[0]) || '';
        var st = p.removido
          ? '<span class="dot off"></span>Removido'
          : (p.publicado === false ? '<span class="dot off"></span>Oculto' : '<span class="dot on"></span>Publicado');
        return '<tr>' +
          '<td><div class="c-im">' +
            (foto ? '<img src="' + esc(foto) + '" alt="" loading="lazy">'
              : '<div style="width:62px;height:48px;border-radius:9px;background:var(--brand-50);color:var(--brand);display:grid;place-items:center">' + I.img + '</div>') +
            '<div><b>' + esc(p.tipo) + '</b><span>' + esc(p.codigo || p.id) +
              (p.origem !== 'site-antigo' ? ' · criado por você' : '') + '</span></div>' +
          '</div></td>' +
          '<td class="mono" style="font-weight:700;white-space:nowrap">' + fmt.moeda(p.preco) + '</td>' +
          '<td style="white-space:nowrap">' + esc(p.bairro) + '<br><span style="font-size:.78rem;color:var(--muted)">' + esc(p.cidade) + '</span></td>' +
          '<td style="white-space:nowrap">' + st + '</td>' +
          (full ? '<td><div class="actions">' +
            (p.removido
              ? '<button class="iconbtn" data-rest="' + esc(p.id) + '" title="Restaurar">' + I.refresh + '</button>'
              : '<button class="iconbtn" data-tog="' + esc(p.id) + '" title="' + (p.publicado === false ? 'Publicar' : 'Ocultar do site') + '">' + (p.publicado === false ? I.eyeOff : I.eye) + '</button>') +
            '<button class="iconbtn edit" data-edit="' + esc(p.id) + '" title="Editar">' + I.pencil + '</button>' +
            '<button class="iconbtn del" data-del="' + esc(p.id) + '" title="Excluir">' + I.trash + '</button>' +
          '</div></td>' : '') +
        '</tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* ============================================================
     AÇÕES
     ============================================================ */
  function togglePub(id) {
    var p = A.Store.get(id);
    if (!p) return;
    p.publicado = p.publicado === false;
    A.Store.save(p);
    A.toast(p.publicado ? 'Imóvel publicado no site.' : 'Imível ocultado do site.');
    renderTab(); if (V === 'dashboard') vDashboard();
  }

  function apagar(id) {
    var p = A.Store.get(id); if (!p) return;
    A.confirmar(
      'Tem certeza que deseja excluir "' + fmt.titulo(p) + '"? Você pode restaurar depois em Ajustes › Lixeira.',
      function () {
        A.Store.remove(id);
        A.toast('Imóvel excluído.');
        if (V === 'dashboard') vDashboard(); else renderTab();
      }, 'Excluir imóvel'
    );
  }

  function restaurar(id) {
    A.Store.restore(id);
    A.toast('Imóvel restaurado.');
    renderTab();
  }

  var EDITANDO = null;

  function editar(id) {
    EDITANDO = id;
    ir('editar');
  }

  /* ============================================================
     FORMULÁRIO
     ============================================================ */
  var CARACTERISTICAS = [
    'Garagem coberta', 'Quintal', 'Churrasqueira', 'Piscina', 'Sala de estar',
    'Cozinha planejada', 'Lavanderia', 'Elevador', 'Portaria 24h', 'Ar-condicionado',
    'Internet fibra', 'Pet friendly', 'Área de serviço', 'Depósito',
    'Piso planejado', 'Varanda gourmet', 'Gás encanado', 'Energia solar'
  ];

  function vForm(id) {
    var p = id ? A.Store.get(id) : null;
    var novo = !p;
    var prefixo = novo ? (tipoPrefixo()) : '';
    var C = A.CONFIG;

    if (novo) {
      p = {
        id: '', codigo: '', tipo: 'Casa', finalidade: 'venda', preco: null,
        bairro: '', cidade: C.cidade, uf: C.uf, area: null, quartos: null,
        suites: null, banheiros: null, vagas: null, descricao: '',
        fotos: [], destaque: false, publicado: true, caracteristicas: [],
        criadoEm: Date.now()
      };
    }

    view().innerHTML =
      '<div class="panel">' +
        '<div class="panel-head">' +
          '<h3>' + (novo ? 'Cadastrar novo imóvel' : 'Editar imóvel') + '</h3>' +
          '<div class="tools">' +
            (novo ? '' : '<a class="btn btn-ghost btn-sm" target="_blank" href="imovel.html?id=' + encodeURIComponent(p.id) + '">' + I.eye + 'Ver no site</a>') +
            '<button class="btn btn-ghost btn-sm" id="cancelar">' + I.x + 'Cancelar</button>' +
          '</div>' +
        '</div>' +

        '<form id="form" novalidate>' +
        '<div class="modal-body">' +

          (novo ? '<div class="note-box">' + I.info +
            '<div>Preencha o que já souber. Só <b>tipo</b>, <b>bairro</b> e <b>preço</b> são essenciais — o resto dá para completar depois.</div></div>' : '') +

          /* ---- identificação ---- */
          '<div class="form-grid">' +
            fld('tipo', 'Tipo de imóvel', '<select data-k="tipo" required>' +
              A.faceis().tipos.concat(['Casa', 'Apartamento', 'Sobrado', 'Terreno', 'Lote', 'Chácara', 'Sítio', 'Galpão', 'Sala comercial', 'Imóvel'])
                .filter(function (v, i, a) { return a.indexOf(v) === i; })
                .map(function (t) { return '<option' + (p.tipo === t ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') +
              '</select>', true) +

            fld('finalidade', 'Finalidade', '<select data-k="finalidade">' +
              '<option value="venda"' + (p.finalidade === 'venda' ? ' selected' : '') + '>Venda</option>' +
              '<option value="aluguel"' + (p.finalidade === 'aluguel' ? ' selected' : '') + '>Aluguel</option>' +
              '</select>') +

            fld('codigo', 'Código', '<input data-k="codigo" value="' + esc(novo ? '' : (p.codigo || p.id)) + '"' +
              (novo ? ' placeholder="Gerado ao salvar"' : ' readonly') + ' maxlength="24">') +

            fld('preco', 'Valor (R$)', '<input data-k="preco" type="number" min="0" step="1000" inputmode="numeric" value="' +
              (p.preco == null ? '' : p.preco) + '" placeholder="450000">', true) +
          '</div>' +

          '<div style="margin-top:12px">' +
            '<label class="chk"><input type="checkbox" id="soConsulta"' + (p.preco == null ? ' checked' : '') + '>' +
            '<span>Preço sob consulta</span></label>' +
          '</div>' +

          /* ---- medidas ---- */
          '<div class="fset"><div class="fset-h"><b>Medidas</b><span class="ln"></span></div>' +
            '<div class="form-grid">' +
              fld('area', 'Área (m²)', '<input data-k="area" type="number" min="0" inputmode="numeric" value="' + (p.area || '') + '" placeholder="150">') +
              fld('quartos', 'Dormitórios', '<input data-k="quartos" type="number" min="0" max="20" inputmode="numeric" value="' + (p.quartos || '') + '" placeholder="3">') +
              fld('suites', 'Suítes', '<input data-k="suites" type="number" min="0" max="20" inputmode="numeric" value="' + (p.suites || '') + '" placeholder="1">') +
              fld('banheiros', 'Banheiros', '<input data-k="banheiros" type="number" min="0" max="20" inputmode="numeric" value="' + (p.banheiros || '') + '" placeholder="2">') +
              fld('vagas', 'Vagas de garagem', '<input data-k="vagas" type="number" min="0" max="30" inputmode="numeric" value="' + (p.vagas || '') + '" placeholder="2">') +
            '</div>' +
          '</div>' +

          /* ---- localização ---- */
          '<div class="fset"><div class="fset-h"><b>Localização</b><span class="ln"></span></div>' +
            '<div class="form-grid">' +
              fld('bairro', 'Bairro', '<input data-k="bairro" list="dlBairro" value="' + esc(p.bairro || '') + '" placeholder="Centro" required>', true) +
              '<datalist id="dlBairro">' + A.faceis().bairros.map(function (b) { return '<option value="' + esc(b) + '">'; }).join('') + '</datalist>' +
              fld('cidade', 'Cidade', '<input data-k="cidade" list="dlCidade" value="' + esc(p.cidade || C.cidade) + '" placeholder="Itajubá" required>', true) +
              '<datalist id="dlCidade">' + A.faceis().cidades.map(function (c) { return '<option value="' + esc(c) + '">'; }).join('') + '</datalist>' +
              fld('uf', 'UF', '<select data-k="uf">' + ['MG', 'SP', 'RJ', 'ES', 'PR', 'SC', 'RS', 'GO', 'MS', 'MT', 'BA', 'PE', 'CE', 'DF']
                .map(function (u) { return '<option' + (p.uf === u ? ' selected' : '') + '>' + u + '</option>'; }).join('') + '</select>') +
            '</div>' +
          '</div>' +

          /* ---- descrição ---- */
          '<div class="fset"><div class="fset-h"><b>Descrição</b><span class="ln"></span></div>' +
            '<div class="f wide">' +
              '<div class="f"><label for="desc">Texto de apresentação</label>' +
              '<textarea id="desc" data-k="descricao" rows="6" placeholder="Descreva o imóvel: estado de conservação, reformas feitas, quão perto está de comércio, o que torna esse imóvel especial…">' + esc(p.descricao || '') + '</textarea>' +
              '<span class="hint">Quem lê decide em 10 segundos. Diga o que o imóvel tem de diferente e onde fica o melhor benefício.</span></div>' +
            '</div>' +
          '</div>' +

          /* ---- características ---- */
          '<div class="fset"><div class="fset-h"><b>Características</b><span class="ln"></span></div>' +
            '<div class="chipset" id="chars">' + CARACTERISTICAS.map(function (c) {
              return '<label class="chk"><input type="checkbox" value="' + esc(c) + '"' +
                ((p.caracteristicas || []).indexOf(c) > -1 ? ' checked' : '') + '><span>' + esc(c) + '</span></label>';
            }).join('') + '</div>' +
          '</div>' +

          /* ---- fotos ---- */
          '<div class="fset"><div class="fset-h"><b>Fotos</b><span class="ln"></span></div>' +
            '<div class="drop" id="drop">' +
              '<div class="ico">' + I.upload + '</div>' +
              '<b>Arraste as fotos aqui ou clique para escolher</b>' +
              '<span>A primeira foto é a capa. JPG ou PNG, até 10 por imóvel.</span>' +
            '</div>' +
            '<input type="file" id="fileInput" accept="image/*" multiple hidden>' +
            '<div class="photo-list" id="photoList"></div>' +
            '<div class="f" style="margin-top:14px">' +
              '<label>Ou cole o endereço de uma imagem</label>' +
              '<div style="display:flex;gap:9px">' +
                '<input id="urlInput" placeholder="https://…" style="flex:1">' +
                '<button type="button" class="btn btn-ghost" id="addUrl">' + I.plus + 'Adicionar</button>' +
              '</div>' +
            '</div>' +
          '</div>' +

          /* ---- publicação ---- */
          '<div class="fset"><div class="fset-h"><b>Publicação</b><span class="ln"></span></div>' +
            '<div style="display:grid;gap:16px">' +
              '<label class="switch"><input type="checkbox" id="swPublic"' + (p.publicado !== false ? ' checked' : '') + '>' +
                '<span class="track"></span><span class="lb">Publicado no site<small>Desligue para esconder sem excluir</small></span></label>' +
              '<label class="switch"><input type="checkbox" id="swDestaque"' + (p.destaque ? ' checked' : '') + '>' +
                '<span class="track"></span><span class="lb">Destaque<small>Aparece primeiro na listagem</small></span></label>' +
            '</div>' +
          '</div>' +

        '</div>' +

        '<div class="sticky-foot">' +
          '<div class="l"><b>' + (novo ? 'Novo imóvel' : esc(fmt.titulo(p))) + '</b>' +
            (novo ? 'Vai para o site assim que você salvar.' : 'Cód. ' + esc(p.codigo || p.id)) + '</div>' +
          '<div class="r">' +
            '<button type="button" class="btn btn-ghost" id="cancelar2">Cancelar</button>' +
            '<button type="submit" class="btn btn-primary">' + I.save + (novo ? 'Cadastrar imóvel' : 'Salvar alterações') + '</button>' +
          '</div>' +
        '</div>' +
        '</form>' +
      '</div>';

    bindForm(p, novo);
  }

  function fld(k, label, inner, req) {
    // garante id no controle para o <label for> funcionar (acessibilidade + foco no erro)
    inner = inner.replace('data-k="' + k + '"', 'data-k="' + k + '" id="f-' + k + '"');
    return '<div class="f"><label for="f-' + k + '">' + label + (req ? '<span class="req">*</span>' : '') + '</label>' + inner + '</div>';
  }

  function tipoPrefixo() {
    var s = ($('#f-tipo') || {}).value || 'CS';
    var m = { 'Casa': 'CS', 'Apartamento': 'AP', 'Sobrado': 'CS', 'Terreno': 'TR', 'Lote': 'LT', 'Chácara': 'CH', 'Sítio': 'ST', 'Galpão': 'IM' };
    for (var k in m) if (s.indexOf(k) === 0) return m[k];
    return 'IM';
  }

  function bindForm(p, novo) {
    var fotos = (p.fotos || []).slice();
    var drop = $('#drop'), fileInput = $('#fileInput');

    /* --- fotos --- */
    function renderFotos() {
      $('#photoList').innerHTML = fotos.map(function (src, i) {
        return '<div class="photo-item">' +
          '<img src="' + esc(src) + '" alt="Foto ' + (i + 1) + '">' +
          '<button type="button" class="rm" data-rm="' + i + '" aria-label="Remover">' + I.x + '</button>' +
          (i === 0 ? '<span class="cover-tag">Capa</span>' : '') +
          (fotos.length > 1 ? '<span class="mv">' +
            (i > 0 ? '<button type="button" data-mv="' + i + '" data-dir="-1" aria-label="Mover">' + I.chevL + '</button>' : '') +
            (i < fotos.length - 1 ? '<button type="button" data-mv="' + i + '" data-dir="1" aria-label="Mover">' + I.chevR + '</button>' : '') +
          '</span>' : '') +
        '</div>';
      }).join('');
      A.$$('[data-rm]', $('#photoList')).forEach(function (b) {
        b.addEventListener('click', function () { fotos.splice(+b.getAttribute('data-rm'), 1); renderFotos(); });
      });
      A.$$('[data-mv]', $('#photoList')).forEach(function (b) {
        b.addEventListener('click', function () {
          var i = +b.getAttribute('data-mv'), d = +b.getAttribute('data-dir'), j = i + d;
          if (j < 0 || j >= fotos.length) return;
          var t = fotos[i]; fotos[i] = fotos[j]; fotos[j] = t;
          renderFotos();
        });
      });
    }
    renderFotos();

    drop.addEventListener('click', function () { fileInput.click(); });
    ['dragenter', 'dragover'].forEach(function (e) {
      drop.addEventListener(e, function (ev) { ev.preventDefault(); drop.classList.add('over'); });
    });
    ['dragleave', 'drop'].forEach(function (e) {
      drop.addEventListener(e, function (ev) { ev.preventDefault(); drop.classList.remove('over'); });
    });
    drop.addEventListener('drop', function (ev) { addFiles(ev.dataTransfer.files); });
    fileInput.addEventListener('change', function () { addFiles(this.files); this.value = ''; });

    function addFiles(list) {
      var imgs = Array.prototype.filter.call(list, function (f) { return /^image\//.test(f.type); }).slice(0, 10);
      if (!imgs.length) { A.toast('Selecione arquivos de imagem.', 'err'); return; }
      A.toast('Processando ' + imgs.length + ' foto(s)…');
      var n = 0;
      imgs.forEach(function (file) {
        var fr = new FileReader();
        fr.onload = function () {
          redimensionar(fr.result, function (dataUrl) {
            fetch(dataUrl).then(function (r) { return r.blob(); })
              .then(function (b) { return A.Auth.upload(b); })
              .then(function (url) { fotos.push(url); renderFotos(); })
              .catch(function () { A.toast('Não consegui enviar ' + file.name + '. Entre de novo e tente outra vez.', 'err'); })
              .then(function () { n++; if (n === imgs.length) A.toast('Envio de fotos concluído.'); });
          });
        };
        fr.onerror = function () { A.toast('Não foi possível ler ' + file.name, 'err'); };
        fr.readAsDataURL(file);
      });
    }

    /* reduz a imagem antes de guardar (localStorage tem limite) */
    function redimensionar(src, cb) {
      var img = new Image();
      img.onload = function () {
        var MAX = 1400;
        var w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        var c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        try { cb(c.toDataURL('image/jpeg', 0.8)); }
        catch (e) { cb(src); }
      };
      img.onerror = function () { cb(src); };
      img.src = src;
    }

    $('#addUrl').addEventListener('click', function () {
      var u = $('#urlInput').value.trim();
      if (!u) { A.toast('Cole o endereço da imagem.', 'err'); return; }
      if (!/^https?:\/\//i.test(u)) { A.toast('O endereço precisa começar com http:// ou https://', 'err'); return; }
      fotos.push(u); $('#urlInput').value = ''; renderFotos();
    });

    /* --- sob consulta --- */
    var sc = $('#soConsulta'), preco = $('#form [data-k="preco"]');
    // imóvel novo começa com o campo liberado — "sob consulta" só vem marcado
    // se o imóvel já existir e realmente não tiver preço.
    if (novo) sc.checked = false;
    var hintPreco = document.createElement('span');
    hintPreco.className = 'hint';
    hintPreco.textContent = 'Desmarque "preço sob consulta" para informar um valor.';
    hintPreco.style.display = 'none';
    preco.closest('.f').appendChild(hintPreco);
    function syncPreco() {
      preco.disabled = sc.checked;
      hintPreco.style.display = sc.checked ? 'block' : 'none';
      if (sc.checked) preco.value = '';
    }
    sc.addEventListener('change', syncPreco); syncPreco();

    /* --- cancelar --- */
    function cancelar() {
      if (novo) { ir('lista'); }
      else { A.confirmar('Descartar as alterações feitas neste imóvel?', function () { ir('lista'); }, 'Descartar alterações'); }
    }
    $('#cancelar').addEventListener('click', cancelar);
    $('#cancelar2').addEventListener('click', cancelar);

    /* --- salvar --- */
    $('#form').addEventListener('submit', function (e) {
      e.preventDefault();
      var form = this, bad = 0;

      // validação
      $$('.f', form).forEach(function (f) { f.classList.remove('bad'); });
      function erro(sel, msg) {
        var inp = $(sel, form);
        if (inp) { inp.closest('.f').classList.add('bad'); bad++; }
        if (bad === 1 && inp) inp.focus();
      }
      if (!$('[data-k="bairro"]', form).value.trim()) erro('[data-k="bairro"]', 'Informe o bairro.');
      if (!$('[data-k="cidade"]', form).value.trim()) erro('[data-k="cidade"]', 'Informe a cidade.');
      if (!sc.checked && !preco.value) erro('[data-k="preco"]', 'Informe o valor ou marque "sob consulta".');
      if (bad) { A.toast('Revise os campos destacados.', 'err'); return; }
      if (!fotos.length) A.toast('Salvo sem fotos — considere adicionar imagens depois.', 'err');

      // montar objeto
      var novoObj = {};
      ['tipo', 'finalidade', 'bairro', 'cidade', 'uf', 'descricao'].forEach(function (k) {
        novoObj[k] = $('[data-k="' + k + '"]', form).value.trim();
      });
      ['preco', 'area', 'quartos', 'suites', 'banheiros', 'vagas'].forEach(function (k) {
        var v = $('[data-k="' + k + '"]', form).value;
        novoObj[k] = v === '' ? null : Number(v);
      });
      if (sc.checked) novoObj.preco = null;

      novoObj.codigo = ($('[data-k="codigo"]', form).value.trim()) || A.Store.nextCodigo(tipoPrefixo());
      novoObj.id = novoObj.codigo;
      novoObj.fotos = fotos;
      novoObj.caracteristicas = A.$$('#chars input:checked').map(function (i) { return i.value; });
      novoObj.publicado = $('#swPublic').checked;
      novoObj.destaque = $('#swDestaque').checked;
      novoObj.criadoEm = novo ? Date.now() : (p.criadoEm || Date.now());
      novoObj.atualizadoEm = Date.now();
      novoObj.origem = 'painel';

      // slug para agrupar similares
      novoObj.slug = slugTipo(novoObj.tipo);
      novoObj.uf = novoObj.uf || 'MG';

      if (A.Store.save(novoObj)) {
        A.toast(novo ? 'Imóvel cadastrado: ' + novoObj.codigo : 'Alterações salvas.');
        EDITANDO = null;
        // limpa busca/página para o corretor enxergar o que acabou de salvar
        busca = ''; pagina = 1;
        ir('lista');
      }
    });
  }

  function slugTipo(t) {
    t = (t || '').toLowerCase();
    if (t.indexOf('apartamento') === 0) return 'apartamento';
    if (t.indexOf('sobrado') === 0) return 'sobrado';
    if (t.indexOf('casa') === 0) return 'casa';
    if (t.indexOf('terreno') === 0) return 'terreno';
    if (t.indexOf('lote') === 0) return 'lote';
    if (t.indexOf('chácara') === 0) return 'chacara';
    if (t.indexOf('sítio') === 0) return 'sitio';
    if (t.indexOf('galpão') === 0) return 'galpao';
    if (t.indexOf('sala') === 0) return 'imovel';
    return 'imovel';
  }

  /* ============================================================
     AJUSTES
     ============================================================ */
  function vAjustes() {
    var s = A.Store.state();
    var usados = uso();
    var lixeira = A.Store.allAdmin().filter(function (p) { return p.removido; });

    view().innerHTML =
      '<div class="note-box">' + I.alert +
        '<div><b>Site conectado ao banco de dados.</b> O que você cadastra aqui aparece para todos que visitam o site. ' +
        'As fotos enviadas ficam guardadas no Supabase.</div></div>' +

      '<div class="panel" style="margin-bottom:18px">' +
        '<div class="panel-head"><h3>Senha de acesso</h3></div>' +
        '<div class="modal-body"><p class="hint" style="font-size:.85rem;color:var(--muted)">Para trocar a senha, acesse o painel do Supabase → Authentication → Users e use a opção de redefinir senha do seu usuário.</p></div>' +
      '</div>' +

      '<div class="panel" style="margin-bottom:18px">' +
        '<div class="panel-head"><h3>Backup dos dados</h3>' +
          '<div class="tools"><span class="hint" style="font-size:.78rem;color:var(--muted)">Dados salvos: <b>' + usados + '%</b></span></div></div>' +
        '<div class="modal-body">' +
          '<div class="set-row"><div class="t"><b>Exportar tudo (JSON)</b>' +
            '<span>Baixa um arquivo com todos os imóveis, inclusive os que você criou. É o formato ideal para backup.</span></div>' +
            '<div class="a"><button class="btn btn-ghost btn-sm" id="expJson">' + I.down + 'Baixar JSON</button></div></div>' +
          '<div class="set-row"><div class="t"><b>Exportar planilha (CSV)</b>' +
            '<span>Abre direto no Excel ou Google Planilhas, com uma linha por imóvel.</span></div>' +
            '<div class="a"><button class="btn btn-ghost btn-sm" id="expCsv">' + I.down + 'Baixar CSV</button></div></div>' +
          '<div class="set-row"><div class="t"><b>Importar backup (JSON)</b>' +
            '<span>Restaura um arquivo exportado antes. Substitui os dados atuais — exporte antes se tiver dúvida.</span></div>' +
            '<div class="a"><button class="btn btn-ghost btn-sm" id="impJson">' + I.up + 'Selecionar arquivo</button>' +
            '<input type="file" id="impInput" accept="application/json,.json" hidden></div></div>' +
          '<div class="set-row"><div class="t"><b>Voltar ao inventário original</b>' +
            '<span>Apaga tudo o que foi alterado, criado ou excluído e restaura os ' +
            (window.IMOVEIS_SEED || []).length + ' imóveis que vieram do site antigo. Não dá para desfazer.</span></div>' +
            '<div class="a"><button class="btn btn-danger btn-sm" id="reset">' + I.refresh + 'Restaurar original</button></div></div>' +
        '</div>' +
      '</div>' +

      (lixeira.length ?
        '<div class="panel">' +
          '<div class="panel-head"><h3>Lixeira</h3>' +
            '<div class="tools">' +
              '<span class="hint" style="font-size:.8rem;color:var(--muted)">' + lixeira.length + ' imóvel(is) excluído(s)</span>' +
              '<button class="btn btn-ghost btn-sm" id="esvaziar">' + I.trash + 'Esvaziar lixeira</button>' +
            '</div></div>' +
          '<div class="tbl-scroll"><table class="tbl"><tbody>' + lixeira.map(function (p) {
            return '<tr><td><div class="c-im">' +
              ((p.fotos && p.fotos[0]) ? '<img src="' + esc(p.fotos[0]) + '" alt="">' : '<div style="width:62px;height:48px;border-radius:9px;background:var(--line)"></div>') +
              '<div><b>' + esc(p.tipo) + '</b><span>' + esc(p.codigo || p.id) + ' · ' + esc(p.bairro || '—') + '</span></div>' +
              '</div></td><td class="mono" style="font-weight:700">' + fmt.moeda(p.preco) + '</td>' +
              '<td style="text-align:right"><button class="btn btn-ghost btn-sm" data-rest="' + esc(p.id) + '">' + I.refresh + ' Restaurar</button></td></tr>';
          }).join('') + '</tbody></table></div>' +
        '</div>' : '');

    /* export json */
    $('#expJson').addEventListener('click', function () {
      baixar('imoveis-backup-' + dataISO() + '.json',
        JSON.stringify(A.Store.exportAll(), null, 2), 'application/json');
      A.toast('Backup JSON baixado.');
    });

    /* export csv */
    $('#expCsv').addEventListener('click', function () {
      var cols = [
        ['codigo', 'Código'], ['tipo', 'Tipo'], ['finalidade', 'Finalidade'], ['preco', 'Preço'],
        ['area', 'Área (m²)'], ['quartos', 'Dormitórios'], ['suites', 'Suítes'], ['banheiros', 'Banheiros'],
        ['vagas', 'Vagas'], ['bairro', 'Bairro'], ['cidade', 'Cidade'], ['uf', 'UF'],
        ['publicado', 'Publicado'], ['destaque', 'Destaque'], ['fotos', 'Qtd. fotos'],
        ['descricao', 'Descrição'], ['url', 'Link']
      ];
      var linhas = [cols.map(function (c) { return '"' + c[1] + '"'; }).join(';')];
      A.Store.allAdmin().forEach(function (p) {
        linhas.push(cols.map(function (c) {
          var v = c[0] === 'url' ? ('imovel.html?id=' + encodeURIComponent(p.id))
            : c[0] === 'fotos' ? (p.fotos || []).length
              : c[0] === 'publicado' ? (p.publicado === false ? 'não' : 'sim')
                : c[0] === 'destaque' ? (p.destaque ? 'sim' : 'não')
                  : (p[c[0]] == null ? '' : p[c[0]]);
          return '"' + String(v).replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"';
        }).join(';'));
      });
      baixar('imoveis-' + dataISO() + '.csv', '﻿' + linhas.join('\r\n'), 'text/csv;charset=utf-8');
      A.toast('Planilha CSV baixada.');
    });

    /* import */
    $('#impJson').addEventListener('click', function () { $('#impInput').click(); });
    $('#impInput').addEventListener('change', function () {
      var file = this.files[0]; if (!file) return;
      var fr = new FileReader();
      fr.onload = function () {
        try {
          var n = A.Store.importAll(JSON.parse(fr.result));
          A.toast(n + ' imóvel(is) importados.');
          vAjustes();
        } catch (err) { A.toast('Arquivo inválido: ' + err.message, 'err'); }
      };
      fr.readAsText(file);
      this.value = '';
    });

    /* reset */
    $('#reset').addEventListener('click', function () {
      A.confirmar('Isso apaga TODOS os imóveis criados, editados ou excluídos e volta ao inventário original. Continuar?',
        function () { A.Store.reset(); A.toast('Inventário original restaurado.'); ir('lista'); }, 'Restaurar original');
    });

    A.$$('[data-rest]', view()).forEach(function (b) {
      b.addEventListener('click', function () { A.Store.restore(b.getAttribute('data-rest')); A.toast('Restaurado.'); vAjustes(); });
    });
    var esv = $('#esvaziar');
    if (esv) esv.addEventListener('click', function () {
      A.confirmar('Isso apaga definitivamente os imóveis da lixeira. Não dá para recuperar depois. Continuar?',
        function () { A.Store.esvaziarLixeira(); A.toast('Lixeira esvaziada.'); vAjustes(); }, 'Esvaziar lixeira');
    });
  }

  function uso() {
    return Math.min(100, Math.round(JSON.stringify(A.Store.state()).length / (2 * 1024 * 1024) * 100));
  }

  function dataISO() { return new Date().toISOString().slice(0, 10); }

  function baixar(nome, conteudo, mime) {
    var blob = new Blob([conteudo], { type: mime || 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nome;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }
})();
