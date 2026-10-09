/**
 * PIETRO MODA FITNESS B2B — CORREÇÃO pós-execução (rodar UMA vez, depois do script principal)
 *
 * O que faz:
 *   1. Cria os anúncios que faltam (grupo sem anúncio ativo) com a copy corrigida
 *      para a política editorial: sem "OFF" em caixa alta e sem a abreviação "p/".
 *      Se o Google recusar de novo, tenta uma versão mais enxuta e registra no Log.
 *   2. Demand Gen: reaproveita as imagens já enviadas (não duplica a biblioteca).
 *   3. Troca a frase de destaque "5% OFF no PIX" por "5% de Desconto no PIX".
 *   4. Faz um diagnóstico das duas campanhas (grupos, anúncios, públicos, local).
 *
 * Seguro para rodar de novo: só cria anúncio em grupo que ainda não tem anúncio.
 */

const SEARCH_NAME = '03_conv-bf-search [ Atacado Lojista ]';
const DG_NAME = '02_conv-bf-geração de demanda [ Lojista ]';
const SITE = 'https://pietromodafitness.com.br';
const IMG_BASE = 'https://raw.githubusercontent.com/brTux/novaonda/621951dd542ae30c1f2cb69b339bfed904d6fa3f/criativos/pietro-moda-fitness-b2b-google-ads/';

const H_GERAL = [
  'Moda Fitness no Atacado', 'Direto da Fábrica no Brás', 'Fornecedor de Roupa Fitness',
  'Pedido Mínimo de 10 Peças', 'Grade Aberta: Monte Seu Mix', 'Leggings Poliamida Blackout',
  'Pronta Entrega para Lojistas', 'Cadastre Seu CNPJ e Compre', 'Preço de Fábrica Para Revenda',
  'Legging Flare Mais Vendida', 'Até 4x Sem Juros no Cartão', 'Enviamos Para Todo o Brasil',
  'Fabricação Própria', 'Revenda Moda Fitness', 'Pietro Moda Fitness Atacado',
];
const H_MARCA = [
  'Pietro Moda Fitness Atacado', 'Site Oficial Pietro Atacado', 'Compre Direto da Fábrica',
  'Loja no Brás, Venda Online', 'Pedido Mínimo de 10 Peças', 'Grade Aberta: Monte Seu Mix',
  'Pronta Entrega para Lojistas', 'Cadastre Seu CNPJ e Compre', 'Preço de Fábrica Para Revenda',
  'Até 4x Sem Juros no Cartão', 'Enviamos Para Todo o Brasil', 'Fabricação Própria',
];
const D_SEARCH = [
  'Fábrica própria no Brás. Leggings, conjuntos e shorts em poliamida blackout para revenda.',
  'Pedido mínimo de 10 peças com grade aberta. Monte o mix ideal para a sua loja.',
  'Cadastre seu CNPJ, veja os preços de atacado e faça seu pedido online em minutos.',
  'Pronta entrega e reposição rápida. 4x sem juros ou 5% de desconto no PIX.',
];
// Itens retirados na versão "enxuta" caso o Google recuse a versão completa
const SUSPEITOS = ['Grade Aberta: Monte Seu Mix', 'Site Oficial Pietro Atacado', 'Legging Flare Mais Vendida',
  'Loja no Brás, Venda Online', 'Até 4x Sem Juros no Cartão', 'Cadastre Seu CNPJ e Compre'];

const SEARCH_GROUPS = {
  '01_conv-bf-marca': { url: SITE + '/', heads: H_MARCA },
  '02_conv-bf-atacado-generico': { url: SITE + '/', heads: H_GERAL },
  '03_conv-bf-produto-atacado': { url: SITE + '/feminino/leggings-e-calcas/c', heads: H_GERAL },
};

const D_DG = [
  'Fábrica própria no Brás. Leggings, conjuntos e shorts para revender. Mínimo de 10 peças.',
  'Monte seu mix com grade aberta e pronta entrega. Cadastre seu CNPJ e libere os preços.',
  'Poliamida blackout que não marca: o tecido que sua cliente procura. Exclusivo a lojistas.',
  'Reposição rápida dos campeões de venda. 4x sem juros no cartão ou 5% de desconto no PIX.',
  'Sua loja com moda fitness que gira: flare, canelada, conjuntos e masculino. Atacado.',
];
const DG_GROUPS = {
  '01_conv-bf-prospecção-lojista': {
    heads: ['Moda fitness atacado, direto da fábrica', 'Revenda leggings que vendem sozinhas',
      'Mínimo 10 peças, grade aberta', 'Fornecedor fitness do Brás para lojistas', 'Cadastre o CNPJ e veja preço de fábrica'],
    folder: '02_DemandGen_Lojista/AG1_Prospeccao-Lojista/',
    concepts: ['C1-fabrica-bras', 'C2-flare', 'C3-minimo-10-pecas', 'C4-transparencia-zero'],
  },
  '02_conv-bf-remarketing-90d': {
    heads: ['Sua grade fitness está te esperando', 'Volte e finalize seu pedido de atacado',
      'Reponha os campeões de venda da sua loja', 'Novidades no atacado da Pietro', 'Lojista: preços de fábrica liberados'],
    folder: '02_DemandGen_Lojista/AG2_Remarketing-60-90d/',
    concepts: ['C3-minimo-10-pecas', 'C5-conjuntos', 'C6-reponha-vitrine'],
  },
};
const FORMATS = ['1200x628', '1200x1200', '960x1200', '1080x1920'];

const LOG = { feito: [], erro: [], manual: [] };

function main() {
  if (AdsApp.getExecutionInfo().isPreview()) {
    diagnostico();
    Logger.log('\nModo Visualizar: só diagnóstico. Clique em "Executar" para corrigir.');
    return;
  }
  corrigirSearch();
  corrigirDemandGen();
  trocarCallout();
  diagnostico();
  Logger.log('\n================ RESUMO DA CORREÇÃO ================');
  LOG.feito.forEach(m => Logger.log('OK: ' + m));
  LOG.erro.forEach(m => Logger.log('ERRO: ' + m));
  LOG.manual.forEach(m => Logger.log('AJUSTE MANUAL: ' + m));
}

// ------------------------------ Search ------------------------------

function corrigirSearch() {
  const groups = adGroups(SEARCH_NAME);
  Object.keys(SEARCH_GROUPS).forEach(name => {
    const ag = groups[name];
    if (!ag) { LOG.erro.push('Grupo não encontrado: ' + name); return; }
    if (adCount(ag) > 0) { Logger.log('Já tem anúncio, pulado: ' + name); return; }
    const cfg = SEARCH_GROUPS[name];
    const variants = [cfg.heads, cfg.heads.filter(h => SUSPEITOS.indexOf(h) < 0)];
    for (let i = 0; i < variants.length; i++) {
      const heads = variants[i].map((t, j) => j === 0 ? { text: t, pinnedField: 'HEADLINE_1' } : { text: t });
      const err = mutate({ adGroupAdOperation: { create: {
        adGroup: ag, status: 'ENABLED',
        ad: { finalUrls: [cfg.url], responsiveSearchAd: {
          headlines: heads, descriptions: D_SEARCH.map(t => ({ text: t })), path1: 'atacado', path2: 'moda-fitness' } },
      } } });
      if (!err) { LOG.feito.push('RSA criado em ' + name + (i ? ' (versão enxuta, ' + heads.length + ' títulos)' : '')); return; }
      Logger.log('Tentativa ' + (i + 1) + ' recusada em ' + name + ': ' + err);
    }
    LOG.manual.push('RSA de ' + name + ' recusado nas 2 versões — crie pela interface; o Google mostra qual título viola a política.');
  });
}

// ---------------------------- Demand Gen ----------------------------

function corrigirDemandGen() {
  const groups = adGroups(DG_NAME);
  const lib = imageLibrary();
  Object.keys(DG_GROUPS).forEach(name => {
    const ag = groups[name];
    if (!ag) { LOG.erro.push('Grupo não encontrado: ' + name); return; }
    if (adCount(ag) > 0) { Logger.log('Já tem anúncio, pulado: ' + name); return; }
    const cfg = DG_GROUPS[name];
    const imgs = {};
    FORMATS.forEach(f => {
      imgs[f] = [];
      cfg.concepts.forEach(c => {
        const a = image(lib, cfg.folder + c + '/PMF-B2B_DG_' + c + '_' + f + '.jpg');
        if (a) imgs[f].push({ asset: a });
      });
    });
    const logo = image(lib, '02_DemandGen_Lojista/logos/PMF-B2B_logo_1200x1200.png');
    const body = tall => {
      const m = {
        marketingImages: imgs['1200x628'], squareMarketingImages: imgs['1200x1200'],
        portraitMarketingImages: imgs['960x1200'], logoImages: logo ? [{ asset: logo }] : [],
        headlines: cfg.heads.map(t => ({ text: t })), descriptions: D_DG.map(t => ({ text: t })),
        businessName: 'Pietro Moda Fitness',
      };
      if (tall) m.tallPortraitMarketingImages = imgs['1080x1920'];
      return { adGroupAdOperation: { create: { adGroup: ag, status: 'ENABLED',
        ad: { name: name + ' [ imagens ]', finalUrls: [SITE + '/'], demandGenMultiAssetAd: m } } } };
    };
    let err = mutate(body(true));
    if (!err) { LOG.feito.push('Anúncio Demand Gen criado em ' + name + ' (com 9:16)'); return; }
    Logger.log('Com 9:16 recusado em ' + name + ': ' + err);
    err = mutate(body(false));
    if (!err) {
      LOG.feito.push('Anúncio Demand Gen criado em ' + name + ' (sem 9:16)');
      LOG.manual.push(name + ': adicione as imagens 1080x1920 pela interface.');
      return;
    }
    LOG.erro.push('Anúncio Demand Gen em ' + name + ': ' + err);
  });
}

function imageLibrary() {
  const lib = {};
  const it = AdsApp.search("SELECT asset.resource_name, asset.name FROM asset WHERE asset.type = 'IMAGE' AND asset.name LIKE 'PMF-B2B_%'");
  while (it.hasNext()) {
    const r = it.next();
    lib[String(r.asset.name).split(' | ')[0]] = r.asset.resourceName;
  }
  return lib;
}

function image(lib, path) {
  const key = path.split('/').pop().replace(/\.(jpg|png)$/, '');
  if (lib[key]) return lib[key];
  try {
    const bytes = UrlFetchApp.fetch(IMG_BASE + path).getBlob().getBytes();
    const res = AdsApp.mutate({ assetOperation: { create: {
      name: key + ' | ' + new Date().getTime(), type: 'IMAGE', imageAsset: { data: Utilities.base64Encode(bytes) } } } });
    if (res.isSuccessful()) { lib[key] = res.getResourceName(); return lib[key]; }
    LOG.erro.push('Imagem ' + key + ': ' + res.getErrorMessages().join(' | '));
  } catch (e) { LOG.erro.push('Imagem ' + key + ': ' + e); }
  return null;
}

// ------------------------------ Callout ------------------------------

function trocarCallout() {
  const camp = campaignRn(SEARCH_NAME);
  if (!camp) return;
  const it = AdsApp.search("SELECT campaign_asset.resource_name FROM campaign_asset WHERE campaign.resource_name = '" + camp +
    "' AND campaign_asset.field_type = 'CALLOUT' AND asset.callout_asset.callout_text = '5% OFF no PIX' AND campaign_asset.status != 'REMOVED'");
  let removed = false;
  while (it.hasNext()) {
    const rn = it.next().campaignAsset.resourceName;
    if (!mutate({ campaignAssetOperation: { remove: rn } })) removed = true;
  }
  if (!removed) return;
  const res = AdsApp.mutate({ assetOperation: { create: { calloutAsset: { calloutText: '5% de Desconto no PIX' } } } });
  if (res.isSuccessful() && !mutate({ campaignAssetOperation: { create: { campaign: camp, asset: res.getResourceName(), fieldType: 'CALLOUT' } } })) {
    LOG.feito.push('Frase de destaque trocada para "5% de Desconto no PIX"');
  } else LOG.manual.push('Troque a frase de destaque "5% OFF no PIX" por "5% de Desconto no PIX".');
}

// ---------------------------- Diagnóstico ----------------------------

function diagnostico() {
  Logger.log('\n================ DIAGNÓSTICO ================');
  [SEARCH_NAME, DG_NAME].forEach(cn => {
    const camp = campaignRn(cn);
    if (!camp) { Logger.log('Campanha NÃO encontrada: ' + cn); return; }
    const c = AdsApp.search("SELECT campaign.status, campaign_budget.amount_micros FROM campaign WHERE campaign.resource_name = '" + camp + "'").next();
    Logger.log('\n' + cn + ' | status ' + c.campaign.status + ' | R$ ' + (c.campaignBudget.amountMicros / 1e6) + '/dia');
    const crit = {};
    const ci = AdsApp.search("SELECT campaign_criterion.type, campaign_criterion.negative FROM campaign_criterion WHERE campaign.resource_name = '" + camp + "'");
    while (ci.hasNext()) { const r = ci.next().campaignCriterion; const k = r.type + (r.negative ? ' (negativa)' : ''); crit[k] = (crit[k] || 0) + 1; }
    Logger.log('  Critérios da campanha: ' + JSON.stringify(crit));
    const ca = {};
    const ai = AdsApp.search("SELECT campaign_asset.field_type FROM campaign_asset WHERE campaign.resource_name = '" + camp + "' AND campaign_asset.status != 'REMOVED'");
    while (ai.hasNext()) { const t = ai.next().campaignAsset.fieldType; ca[t] = (ca[t] || 0) + 1; }
    Logger.log('  Recursos da campanha: ' + JSON.stringify(ca));
    const groups = adGroups(cn);
    Object.keys(groups).forEach(g => {
      const gc = {};
      const gi = AdsApp.search("SELECT ad_group_criterion.type FROM ad_group_criterion WHERE ad_group.resource_name = '" + groups[g] + "' AND ad_group_criterion.status != 'REMOVED'");
      while (gi.hasNext()) { const t = gi.next().adGroupCriterion.type; gc[t] = (gc[t] || 0) + 1; }
      Logger.log('  Grupo ' + g + ' | anúncios: ' + adCount(groups[g]) + ' | critérios: ' + JSON.stringify(gc));
    });
  });
}

// ------------------------------ Helpers ------------------------------

function mutate(op) {
  try {
    const res = AdsApp.mutate(op);
    return res.isSuccessful() ? null : res.getErrorMessages().join(' | ');
  } catch (e) { return String(e); }
}

function campaignRn(name) {
  const it = AdsApp.search("SELECT campaign.resource_name FROM campaign WHERE campaign.name = '" + name + "' AND campaign.status != 'REMOVED'");
  return it.hasNext() ? it.next().campaign.resourceName : null;
}

function adGroups(campaignName) {
  const out = {};
  const it = AdsApp.search("SELECT ad_group.resource_name, ad_group.name FROM ad_group WHERE campaign.name = '" +
    campaignName + "' AND ad_group.status != 'REMOVED'");
  while (it.hasNext()) { const r = it.next(); out[r.adGroup.name] = r.adGroup.resourceName; }
  return out;
}

function adCount(agRn) {
  const it = AdsApp.search("SELECT ad_group_ad.resource_name FROM ad_group_ad WHERE ad_group.resource_name = '" + agRn +
    "' AND ad_group_ad.status != 'REMOVED'");
  let n = 0; while (it.hasNext()) { it.next(); n++; }
  return n;
}
