/**
 * PIETRO MODA FITNESS B2B — criação das campanhas no Google Ads
 *
 * Cria (TUDO PAUSADO):
 *   1. 03_conv-bf-search [ Atacado Lojista ]           — 3 grupos, palavras-chave, RSA, negativas,
 *                                        sitelinks, frases de destaque, snippet, imagens, logo
 *   2. 02_conv-bf-geração de demanda [ Lojista ]       — AG1 Prospecção (segmento personalizado) e
 *                                        AG2 Remarketing 90d, anúncios com todos os criativos
 *
 * Como usar:
 *   Google Ads > Ferramentas > Ações em massa > Scripts > (+) Novo script
 *   Cole este arquivo inteiro, autorize, clique em "Executar" (não em "Visualizar").
 *   Em modo "Visualizar" o script só confere os links das imagens e mostra o plano.
 *   Ao final, confira o Log. Nada entra no ar até você ativar as campanhas.
 *
 * Seguro para rodar de novo: se a campanha com o mesmo nome já existir, ela é pulada.
 */

// ============================== CONFIGURAÇÃO ==============================

const SITE = 'https://pietromodafitness.com.br';

const IMG_BASE = 'https://raw.githubusercontent.com/brTux/novaonda/621951dd542ae30c1f2cb69b339bfed904d6fa3f/criativos/pietro-moda-fitness-b2b-google-ads/';

const BRASIL = 'geoTargetConstants/2076';
const PORTUGUES = 'languageConstants/1014';

const SEARCH = {
  name: '03_conv-bf-search [ Atacado Lojista ]',
  budgetReais: 45,
  finalUrlSuffix: 'utm_source=google&utm_medium=cpc&utm_campaign=pmf-b2b-search-atacado&utm_content={adgroupid}&utm_term={keyword}',
  path1: 'atacado',
  path2: 'moda-fitness',
  headlines: [
    'Moda Fitness no Atacado',        // fixado na posição 1
    'Direto da Fábrica no Brás',
    'Fornecedor de Roupa Fitness',
    'Pedido Mínimo de 10 Peças',
    'Grade Aberta: Monte Seu Mix',
    'Leggings Poliamida Blackout',
    'Pronta Entrega para Lojistas',
    'Cadastre Seu CNPJ e Compre',
    'Preço de Fábrica Para Revenda',
    'Legging Flare Mais Vendida',
    'Até 4x Sem Juros no Cartão',
    'Enviamos Para Todo o Brasil',
    'Fabricação Própria',
    'Revenda Moda Fitness',
    'Pietro Moda Fitness Atacado',
  ],
  brandHeadlines: [
    'Pietro Moda Fitness Atacado',    // fixado na posição 1
    'Site Oficial Pietro Atacado',
    'Compre Direto da Fábrica',
    'Loja no Brás, Venda Online',
    'Pedido Mínimo de 10 Peças',
    'Grade Aberta: Monte Seu Mix',
    'Pronta Entrega para Lojistas',
    'Cadastre Seu CNPJ e Compre',
    'Preço de Fábrica Para Revenda',
    'Até 4x Sem Juros no Cartão',
    'Enviamos Para Todo o Brasil',
    'Fabricação Própria',
  ],
  descriptions: [
    'Fábrica própria no Brás. Leggings, conjuntos e shorts em poliamida blackout para revenda.',
    'Pedido mínimo de 10 peças com grade aberta. Monte o mix ideal para a sua loja.',
    'Cadastre seu CNPJ, veja os preços de atacado e faça seu pedido online em minutos.',
    'Pronta entrega e reposição rápida. 4x sem juros ou 5% de desconto no PIX.',
  ],
  adGroups: [
    {
      name: '01_conv-bf-marca',
      brand: true,
      url: SITE + '/',
      keywords: [
        ['pietro moda fitness atacado', 'PHRASE'],
        ['pietro moda fitness atacado', 'EXACT'],
        ['pietro fitness atacado', 'PHRASE'],
        ['pietro fitness brás', 'PHRASE'],
        ['pietro moda fitness brás', 'PHRASE'],
      ],
    },
    {
      name: '02_conv-bf-atacado-generico',
      url: SITE + '/',
      keywords: [
        ['moda fitness atacado', 'PHRASE'], ['moda fitness atacado', 'EXACT'],
        ['roupa fitness atacado', 'PHRASE'], ['roupa fitness atacado', 'EXACT'],
        ['roupa de academia atacado', 'PHRASE'],
        ['fornecedor de roupa fitness', 'PHRASE'],
        ['fornecedor moda fitness', 'PHRASE'],
        ['fábrica de roupa fitness', 'PHRASE'],
        ['atacado fitness brás', 'PHRASE'],
        ['moda fitness brás', 'PHRASE'],
        ['roupa fitness para revender', 'PHRASE'],
        ['roupa de academia para revender', 'PHRASE'],
        ['revenda moda fitness', 'PHRASE'],
      ],
    },
    {
      name: '03_conv-bf-produto-atacado',
      url: SITE + '/feminino/leggings-e-calcas/c',
      keywords: [
        ['legging atacado', 'PHRASE'], ['legging atacado', 'EXACT'],
        ['legging flare atacado', 'PHRASE'],
        ['legging poliamida atacado', 'PHRASE'],
        ['conjunto fitness atacado', 'PHRASE'], ['conjunto fitness atacado', 'EXACT'],
        ['top fitness atacado', 'PHRASE'],
        ['shorts fitness atacado', 'PHRASE'],
        ['moda fitness masculina atacado', 'PHRASE'],
        ['moda fitness plus size atacado', 'PHRASE'],
      ],
    },
  ],
  negatives: ['shein', 'shopee', 'mercado livre', 'aliexpress', 'molde', 'curso', 'costura',
    'emprego', 'vagas', 'usada', 'usado', '1 peça', 'unidade', 'comprar 1', 'grátis', 'pdf'],
  sitelinks: [
    { text: 'Cadastro de Lojista', d1: 'Libere os preços de atacado', d2: 'Acesse com seu CNPJ', url: SITE + '/conta/' },
    { text: 'Mais Vendidos', d1: 'Os campeões de venda das lojas', d2: 'Giro rápido na sua vitrine', url: SITE + '/mais-vendidos/c' },
    { text: 'Leggings Atacado', d1: 'Flare, canelada e blackout', d2: 'Poliamida que não marca', url: SITE + '/feminino/leggings-e-calcas/c' },
    { text: 'Conjuntos Fitness', d1: 'Conjuntos com top e legging', d2: 'Peças que vendem o ano todo', url: SITE + '/feminino/conjuntos/c' },
    { text: 'Moda Fitness Masculina', d1: 'Shorts e camisetas dry fit', d2: 'Amplie o mix da sua loja', url: SITE + '/masculino/c' },
    { text: 'Linha Plus Size', d1: 'Tamanhos do P ao G3', d2: 'Conjuntos, leggings e tops', url: SITE + '/plus-size/c' },
  ],
  callouts: ['Fábrica Própria', 'Grade Aberta', 'Mínimo 10 Peças', 'Pronta Entrega',
    '5% de Desconto no PIX', '4x Sem Juros', 'Envio Para Todo o Brasil', 'Loja Física no Brás'],
  snippet: { header: 'Tipos', values: ['Leggings', 'Conjuntos', 'Shorts', 'Tops', 'Jaquetas', 'Masculino', 'Plus Size'] },
  images: [
    '01_Search_Atacado/imagens-sem-texto/PMF-B2B_SEARCH_conjunto-vermelho_1200x1200.jpg',
    '01_Search_Atacado/imagens-sem-texto/PMF-B2B_SEARCH_conjunto-vermelho_1200x628.jpg',
    '01_Search_Atacado/imagens-sem-texto/PMF-B2B_SEARCH_flare-preta_1200x1200.jpg',
    '01_Search_Atacado/imagens-sem-texto/PMF-B2B_SEARCH_flare-preta_1200x628.jpg',
    '01_Search_Atacado/imagens-sem-texto/PMF-B2B_SEARCH_conjunto-marrom_1200x1200.jpg',
    '01_Search_Atacado/imagens-sem-texto/PMF-B2B_SEARCH_conjunto-marrom_1200x628.jpg',
    '01_Search_Atacado/imagens-sem-texto/PMF-B2B_SEARCH_masculino_1200x1200.jpg',
    '01_Search_Atacado/imagens-sem-texto/PMF-B2B_SEARCH_masculino_1200x628.jpg',
  ],
  logo: '01_Search_Atacado/logos/PMF-B2B_logo_1200x1200.png',
};

const DG = {
  name: '02_conv-bf-geração de demanda [ Lojista ]',
  budgetReais: 40,
  finalUrlSuffix: 'utm_source=google&utm_medium=demandgen&utm_campaign=pmf-b2b-demandgen-lojista&utm_content={adgroupid}',
  url: SITE + '/',
  businessName: 'Pietro Moda Fitness',
  logo: '02_DemandGen_Lojista/logos/PMF-B2B_logo_1200x1200.png',
  descriptions: [
    'Fábrica própria no Brás. Leggings, conjuntos e shorts para revender. Mínimo de 10 peças.',
    'Monte seu mix com grade aberta e pronta entrega. Cadastre seu CNPJ e libere os preços.',
    'Poliamida blackout que não marca: o tecido que sua cliente procura. Exclusivo a lojistas.',
    'Reposição rápida dos campeões de venda. 4x sem juros no cartão ou 5% de desconto no PIX.',
    'Sua loja com moda fitness que gira: flare, canelada, conjuntos e masculino. Atacado.',
  ],
  customSegment: {
    name: 'conv-bf-segmento [ pesquisou atacado moda fitness ]',
    keywords: ['moda fitness atacado', 'roupa fitness atacado', 'legging atacado', 'conjunto fitness atacado',
      'fornecedor de roupa fitness', 'fornecedor moda fitness', 'fábrica de roupa fitness',
      'atacado fitness brás', 'moda fitness brás atacado', 'roupa de academia para revender',
      'revenda moda fitness', 'atacado roupa academia', 'roupa fitness para lojista', 'comprar roupa fitness para revender'],
  },
  remarketing: { name: 'conv-bf-remarketing [ visitantes site 90d ]', days: 90, urlContains: 'pietromodafitness.com.br' },
  adGroups: [
    {
      name: '01_conv-bf-prospecção-lojista',
      audience: 'custom',
      headlines: [
        'Moda fitness atacado, direto da fábrica',
        'Revenda leggings que vendem sozinhas',
        'Mínimo 10 peças, grade aberta',
        'Fornecedor fitness do Brás para lojistas',
        'Cadastre o CNPJ e veja preço de fábrica',
      ],
      folder: '02_DemandGen_Lojista/AG1_Prospeccao-Lojista/',
      concepts: ['C1-fabrica-bras', 'C2-flare', 'C3-minimo-10-pecas', 'C4-transparencia-zero'],
    },
    {
      name: '02_conv-bf-remarketing-90d',
      audience: 'remarketing',
      headlines: [
        'Sua grade fitness está te esperando',
        'Volte e finalize seu pedido de atacado',
        'Reponha os campeões de venda da sua loja',
        'Novidades no atacado da Pietro',
        'Lojista: preços de fábrica liberados',
      ],
      folder: '02_DemandGen_Lojista/AG2_Remarketing-60-90d/',
      concepts: ['C3-minimo-10-pecas', 'C5-conjuntos', 'C6-reponha-vitrine'],
    },
  ],
};

// ================================ EXECUÇÃO ================================

let CID;
const REPORT = { ok: [], erros: [], manual: [] };

function main() {
  CID = AdsApp.currentAccount().getCustomerId().replace(/-/g, '');
  const preview = AdsApp.getExecutionInfo().isPreview();
  Logger.log('Conta: ' + CID + (preview ? ' | MODO VISUALIZAR' : ' | MODO EXECUTAR'));

  if (preview) {
    checkImages();
    Logger.log('\nModo Visualizar: os links das imagens foram conferidos acima. ' +
      'Clique em "Executar" para criar as campanhas (tudo pausado).');
    return;
  }

  if (campaignExists(SEARCH.name)) note('manual', 'Campanha já existe, pulada: ' + SEARCH.name);
  else buildSearch();

  if (campaignExists(DG.name)) note('manual', 'Campanha já existe, pulada: ' + DG.name);
  else buildDemandGen();

  Logger.log('\n================ RESUMO ================');
  Logger.log('Criados com sucesso: ' + REPORT.ok.length);
  REPORT.erros.forEach(e => Logger.log('ERRO: ' + e));
  REPORT.manual.forEach(m => Logger.log('AJUSTE MANUAL: ' + m));
  Logger.log('Campanhas criadas PAUSADAS. Revise e ative quando a conversão de Compra estiver validada.');
}

// ------------------------------ Search ------------------------------

function buildSearch() {
  Logger.log('\n--- ' + SEARCH.name + ' ---');
  const budget = create('campaignBudgetOperation', {
    name: SEARCH.name + ' [ orçamento ]',
    amountMicros: SEARCH.budgetReais * 1e6,
    deliveryMethod: 'STANDARD',
    explicitlyShared: false,
  }, 'orçamento Search');
  if (!budget) return;

  const campaign = createFirst('campaignOperation', [
    searchCampaignBody(budget, true),
    searchCampaignBody(budget, false),
  ], 'campanha Search');
  if (!campaign) return;

  targetCampaign(campaign);

  SEARCH.negatives.forEach(n => create('campaignCriterionOperation', {
    campaign: campaign, negative: true, keyword: { text: n, matchType: 'PHRASE' },
  }, 'negativa "' + n + '"', true));

  SEARCH.adGroups.forEach(g => {
    const ag = create('adGroupOperation', {
      name: g.name, campaign: campaign, status: 'ENABLED', type: 'SEARCH_STANDARD',
    }, 'grupo ' + g.name);
    if (!ag) return;
    g.keywords.forEach(k => create('adGroupCriterionOperation', {
      adGroup: ag, status: 'ENABLED', keyword: { text: k[0], matchType: k[1] },
    }, 'palavra-chave ' + k[0] + ' [' + k[1] + ']', true));

    const heads = (g.brand ? SEARCH.brandHeadlines : SEARCH.headlines)
      .map((t, i) => i === 0 ? { text: t, pinnedField: 'HEADLINE_1' } : { text: t });
    create('adGroupAdOperation', {
      adGroup: ag, status: 'ENABLED',
      ad: {
        finalUrls: [g.url],
        responsiveSearchAd: {
          headlines: heads,
          descriptions: SEARCH.descriptions.map(t => ({ text: t })),
          path1: SEARCH.path1, path2: SEARCH.path2,
        },
      },
    }, 'anúncio RSA ' + g.name);
  });

  // Recursos de anúncio (nível campanha)
  SEARCH.sitelinks.forEach(s => {
    const a = create('assetOperation', {
      finalUrls: [s.url],
      sitelinkAsset: { linkText: s.text, description1: s.d1, description2: s.d2 },
    }, 'sitelink ' + s.text);
    if (a) linkCampaignAsset(campaign, a, 'SITELINK');
  });
  SEARCH.callouts.forEach(c => {
    const a = create('assetOperation', { calloutAsset: { calloutText: c } }, 'frase de destaque ' + c);
    if (a) linkCampaignAsset(campaign, a, 'CALLOUT');
  });
  const sn = createFirst('assetOperation', [
    { structuredSnippetAsset: { header: SEARCH.snippet.header, values: SEARCH.snippet.values } },
    { structuredSnippetAsset: { header: 'Types', values: SEARCH.snippet.values } },
  ], 'snippet estruturado');
  if (sn) linkCampaignAsset(campaign, sn, 'STRUCTURED_SNIPPET');

  SEARCH.images.forEach(p => {
    const a = imageAsset(p);
    if (a) linkCampaignAsset(campaign, a, 'AD_IMAGE');
  });

  const logo = imageAsset(SEARCH.logo);
  if (logo && !linkCampaignAsset(campaign, logo, 'BUSINESS_LOGO', true)) {
    note('manual', 'Logo da empresa na Search: adicione em Recursos > Logotipo (requer verificação do anunciante).');
  }
  const bn = create('assetOperation', { textAsset: { text: DG.businessName } }, 'nome da empresa', true);
  if (bn && !linkCampaignAsset(campaign, bn, 'BUSINESS_NAME', true)) {
    note('manual', 'Nome da empresa na Search: adicione em Recursos > Nome da empresa.');
  }
}

function searchCampaignBody(budget, withEuField) {
  const body = {
    name: SEARCH.name,
    status: 'PAUSED',
    advertisingChannelType: 'SEARCH',
    campaignBudget: budget,
    maximizeConversions: {},
    networkSettings: {
      targetGoogleSearch: true, targetSearchNetwork: false,
      targetContentNetwork: false, targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: { positiveGeoTargetType: 'PRESENCE', negativeGeoTargetType: 'PRESENCE' },
    finalUrlSuffix: SEARCH.finalUrlSuffix,
  };
  if (withEuField) body.containsEuPoliticalAdvertising = 'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING';
  return body;
}

// ---------------------------- Demand Gen ----------------------------

function buildDemandGen() {
  Logger.log('\n--- ' + DG.name + ' ---');
  const budget = create('campaignBudgetOperation', {
    name: DG.name + ' [ orçamento ]',
    amountMicros: DG.budgetReais * 1e6,
    deliveryMethod: 'STANDARD',
    explicitlyShared: false,
  }, 'orçamento Demand Gen');
  if (!budget) return;

  const base = {
    name: DG.name,
    status: 'PAUSED',
    advertisingChannelType: 'DEMAND_GEN',
    campaignBudget: budget,
    maximizeConversions: {},
    finalUrlSuffix: DG.finalUrlSuffix,
  };
  const withEu = Object.assign({ containsEuPoliticalAdvertising: 'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING' }, base);
  const campaign = createFirst('campaignOperation', [withEu, base], 'campanha Demand Gen');
  if (!campaign) return;

  const campaignTargeted = targetCampaign(campaign, true);

  // Públicos
  const customAud = buildCustomSegment();
  const rmkList = buildRemarketingList();

  const logo = imageAsset(DG.logo);

  DG.adGroups.forEach(g => {
    const ag = createFirst('adGroupOperation', [
      { name: g.name, campaign: campaign, status: 'ENABLED', optimizedTargetingEnabled: false },
      { name: g.name, campaign: campaign, status: 'ENABLED' },
    ], 'grupo ' + g.name);
    if (!ag) return;
    if (!campaignTargeted) targetAdGroup(ag);

    if (g.audience === 'custom') attachAudience(ag, g.name, customAud ? { customAudience: { customAudience: customAud } } : null, customAud, 'customAudience');
    if (g.audience === 'remarketing') attachAudience(ag, g.name, rmkList ? { userList: { userList: rmkList } } : null, rmkList, 'userList');

    // Imagens por formato
    const imgs = { '1200x628': [], '1200x1200': [], '960x1200': [], '1080x1920': [] };
    g.concepts.forEach(c => Object.keys(imgs).forEach(f => {
      const a = imageAsset(g.folder + c + '/PMF-B2B_DG_' + c + '_' + f + '.jpg');
      if (a) imgs[f].push({ asset: a });
    }));

    const adBody = tall => {
      const multi = {
        marketingImages: imgs['1200x628'],
        squareMarketingImages: imgs['1200x1200'],
        portraitMarketingImages: imgs['960x1200'],
        logoImages: logo ? [{ asset: logo }] : [],
        headlines: g.headlines.map(t => ({ text: t })),
        descriptions: DG.descriptions.map(t => ({ text: t })),
        businessName: DG.businessName,
      };
      if (tall) multi.tallPortraitMarketingImages = imgs['1080x1920'];
      return { adGroup: ag, status: 'ENABLED', ad: { finalUrls: [DG.url], demandGenMultiAssetAd: multi } };
    };
    const ad = createFirst('adGroupAdOperation', [adBody(true), adBody(false)], 'anúncio de imagem ' + g.name);
    if (ad && REPORT._lastVariant === 1) {
      note('manual', g.name + ': as imagens 9:16 (1080x1920) não foram aceitas pela API; adicione-as no anúncio pela interface.');
    }
  });

  note('manual', 'Demand Gen: confirme em cada grupo que "Segmentação otimizada" está DESLIGADA.');
  note('manual', 'Opcional: suba a lista de clientes (Customer Match) e inclua no AG1 Prospecção.');
}

function buildCustomSegment() {
  const members = DG.customSegment.keywords.map(k => ({ memberType: 'KEYWORD', keyword: k }));
  return createFirst('customAudienceOperation', [
    { name: DG.customSegment.name, type: 'SEARCH', status: 'ENABLED', members: members },
    { name: DG.customSegment.name, type: 'AUTO', status: 'ENABLED', members: members },
  ], 'segmento personalizado', false, true);
}

function buildRemarketingList() {
  const r = DG.remarketing;
  const rule = {
    ruleItemGroups: [{ ruleItems: [{ name: 'url__', stringRuleItem: { operator: 'CONTAINS', value: r.urlContains } }] }],
  };
  const list = createFirst('userListOperation', [{
    name: r.name,
    membershipStatus: 'OPEN',
    membershipLifeSpan: r.days,
    ruleBasedUserList: {
      prepopulationStatus: 'REQUESTED',
      flexibleRuleUserList: {
        inclusiveRuleOperator: 'AND',
        inclusiveOperands: [{ rule: rule, lookbackWindowDays: r.days }],
      },
    },
  }], 'lista de remarketing 90d', false, true);
  if (!list) note('manual', 'Remarketing: crie em Gerenciador de públicos uma lista "Visitantes do site 90 dias" e adicione ao AG2 (a tag do Google precisa estar no site).');
  return list;
}

function attachAudience(ag, agName, segment, segRn, critType) {
  if (!segment) return;
  // Caminho 1: recurso Audience (padrão do Demand Gen)
  const aud = create('audienceOperation', {
    name: 'conv-bf-público [ ' + agName + ' ]',
    dimensions: [{ audienceSegments: { segments: [segment] } }],
  }, 'público ' + agName, true);
  if (aud && create('adGroupCriterionOperation', { adGroup: ag, audience: { audience: aud } }, 'público no grupo ' + agName, true)) return;
  // Caminho 2: critério direto
  const crit = { adGroup: ag };
  crit[critType] = critType === 'userList' ? { userList: segRn } : { customAudience: segRn };
  if (!create('adGroupCriterionOperation', crit, 'segmento no grupo ' + agName, true)) {
    note('manual', agName + ': adicione o público manualmente no grupo de anúncios.');
  }
}

// ----------------------------- Segmentação -----------------------------

function targetCampaign(campaign, quiet) {
  const a = create('campaignCriterionOperation', { campaign: campaign, location: { geoTargetConstant: BRASIL } }, 'local Brasil', quiet);
  const b = create('campaignCriterionOperation', { campaign: campaign, language: { languageConstant: PORTUGUES } }, 'idioma Português', quiet);
  return !!(a && b);
}

function targetAdGroup(ag) {
  create('adGroupCriterionOperation', { adGroup: ag, location: { geoTargetConstant: BRASIL } }, 'local Brasil (grupo)', true);
  create('adGroupCriterionOperation', { adGroup: ag, language: { languageConstant: PORTUGUES } }, 'idioma Português (grupo)', true);
}

// ------------------------------- Imagens -------------------------------

const IMG_CACHE = {};

function imageAsset(path) {
  if (IMG_CACHE[path] !== undefined) return IMG_CACHE[path];
  let rn = null;
  try {
    const bytes = UrlFetchApp.fetch(IMG_BASE + path).getBlob().getBytes();
    const name = path.split('/').pop().replace(/\.(jpg|png)$/, '');
    rn = create('assetOperation', {
      name: name + ' | ' + new Date().getTime(),
      type: 'IMAGE',
      imageAsset: { data: Utilities.base64Encode(bytes) },
    }, 'imagem ' + name);
  } catch (e) {
    note('erros', 'Falha ao baixar imagem ' + path + ': ' + e);
  }
  IMG_CACHE[path] = rn;
  return rn;
}

function checkImages() {
  const paths = SEARCH.images.concat([SEARCH.logo, DG.logo]);
  DG.adGroups.forEach(g => g.concepts.forEach(c => ['1200x628', '1200x1200', '960x1200', '1080x1920']
    .forEach(f => paths.push(g.folder + c + '/PMF-B2B_DG_' + c + '_' + f + '.jpg'))));
  let ok = 0;
  paths.forEach(p => {
    try {
      const r = UrlFetchApp.fetch(IMG_BASE + p, { muteHttpExceptions: true });
      if (r.getResponseCode() === 200) ok++;
      else Logger.log('Imagem inacessível (' + r.getResponseCode() + '): ' + p);
    } catch (e) { Logger.log('Imagem inacessível: ' + p + ' ' + e); }
  });
  Logger.log('Imagens acessíveis: ' + ok + '/' + paths.length);
  Logger.log('Plano: ' + SEARCH.name + ' (3 grupos, ' + SEARCH.adGroups.reduce((s, g) => s + g.keywords.length, 0) +
    ' palavras-chave, ' + SEARCH.negatives.length + ' negativas) + ' + DG.name + ' (2 grupos).');
}

// ------------------------------- Helpers -------------------------------

function create(opType, body, label, quiet) {
  const op = {};
  op[opType] = { create: body };
  let res;
  try {
    res = AdsApp.mutate(op);
  } catch (e) {
    if (!quiet) note('erros', label + ': ' + e);
    return null;
  }
  if (res.isSuccessful()) {
    REPORT.ok.push(label);
    return res.getResourceName();
  }
  if (!quiet) note('erros', label + ': ' + res.getErrorMessages().join(' | '));
  else Logger.log('(tentativa) ' + label + ': ' + res.getErrorMessages().join(' | '));
  return null;
}

// Tenta variações do corpo (para compatibilidade entre versões da API); usa a primeira que funcionar.
function createFirst(opType, bodies, label, quiet, quietAll) {
  for (let i = 0; i < bodies.length; i++) {
    const last = i === bodies.length - 1;
    const rn = create(opType, bodies[i], label, last ? (quietAll || quiet) : true);
    if (rn) { REPORT._lastVariant = i; return rn; }
  }
  if (quietAll) Logger.log('Não foi possível criar: ' + label);
  return null;
}

function linkCampaignAsset(campaign, asset, fieldType, quiet) {
  return create('campaignAssetOperation', { campaign: campaign, asset: asset, fieldType: fieldType },
    'vínculo ' + fieldType, quiet);
}

function campaignExists(name) {
  const it = AdsApp.search("SELECT campaign.id FROM campaign WHERE campaign.name = '" +
    name.replace(/'/g, "\\'") + "' AND campaign.status != 'REMOVED'");
  return it.hasNext();
}

function note(kind, msg) {
  REPORT[kind].push(msg);
  Logger.log((kind === 'erros' ? 'ERRO: ' : 'AJUSTE MANUAL: ') + msg);
}
