#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera assets/js/data.js a partir do inventario real extraido do site atual
(https://www.chicomarques.com.br/corretor/ - Joomla + JEA).

REAIS  : codigo, tipo, bairro, cidade, finalidade (quando exposta), preco.
         Metragem / quartos / suites / banheiros / vagas / descricao NAO eram
         publicados pelo JEA e sao gerados como preenchimento provisorio --
         o corretor ajusta na area de cadastro.
FOTOS  : acervo Unsplash (royalty-free) por categoria. Sao apenas exemplos
         para o layout ficar legivel -- o corretor sobe as fotos reais no painel.
"""
import json, random, os

random.seed(20261001)

# ---------------------------------------------------------------- acervo
FOTOS = {
    "casa_ext": [
        "1560518883-ce09059eeffa", "1570129477492-45c003edd2be",
        "1512917774080-9991f1c4c750", "1580587771525-78b9dba3b914",
        "1600596542815-ffad4c1539a9", "1523217582562-09d0def993a6",
        "1564013799919-ab600027ffc6", "1576941089067-2de3c901e126",
        "1449844908441-8829872d2607", "1616486338812-3dadae4b4ace",
        "1583608205776-bfd35f0d9f83", "1568605114967-8130f3a36994",
        "1571055107559-3e67626fa8be", "1600585154340-be6161a56a0c",
    ],
    "casa_int": [
        "1600607687939-ce8a6c25118c", "1600607687920-4e2a09cf159d",
        "1600566753086-00f18fb6b3ea", "1600607688066-890987f18a86",
        "1600573472550-8090b5e0745e", "1502672260266-1c1ef2d93688",
        "1493809842364-78817add7ffb", "1484154218962-a197022b5858",
        "1586023492125-27b2c045efd7", "1556909212-d5b604d0c90d",
        "1522708323590-d24dbb6b0267", "1560448204-e02f11c3d0e2",
    ],
    "apartamento": [
        "1560185007-cde436f6a4d0", "1545324418-cc1a3fa10c00",
        "1502672023488-70e25813eb80", "1502005229762-cf1b2da7c5d6",
        "1512917774080-9991f1c4c750", "1522708323590-d24dbb6b0267",
    ],
    "comercial": [
        "1497366216548-37526070297c", "1497366811353-6870744d04b2",
        "1486406146926-c627a92ad1ab", "1460317442991-0ec209397118",
    ],
    "terreno": [
        "1448630360428-65456885c650", "1470071459604-3b5ec3a7fe05",
        "1500382017468-9049fed747ef", "1466692476868-aef1dfb1e735",
    ],
    "rural": [
        "1416879595882-3373a0480b5b", "1500595046743-cd271d694d30",
        "1523712999610-f77fbcfc3843", "1441974231531-c6227db76b6e",
    ],
}
def fotos(cat, n, offset=0):
    pool = FOTOS[cat]
    return [f"https://images.unsplash.com/photo-{pool[(offset + i) % len(pool)]}?auto=format&fit=crop&w=1600&q=72"
            for i in range(n)]

# ---------------------------------------------------------------- inventario real
# (codigo, tipo, bairro, finalidade, preco|None)
ITAJUBA = "Itajubá"
INV = [
    ("CS-096","Casa alto padrão","BPS","venda",1500000),
    ("IM-012","Imóvel","São Vicente","venda",900000),
    ("AP-084","Apartamento","Centro","venda",350000),
    ("AP-082","Apartamento","Centro","venda",750000),
    ("LT-087","Lote","Anhumas","venda",150000),
    ("TR-066","Terreno","N S de Fátima","venda",150000),
    ("CS-095","Casa","Anhumas","venda",1200000),
    ("LT-082","Lote","Oriente","venda",250000),
    ("AP-081","Apartamento","Centro","venda",750000),
    ("CS-093","Casa","Oriente","venda",1200000),
    ("CS-092","Casa","Oriente","venda",1100000),
    ("LT-079","Lote","Oriente","venda",2300000),
    ("TR-077","Terreno","Santa Luzia","venda",70000),
    ("CS-085","Casa","Pinheirinho","venda",1200000),
    ("AP-080","Apartamento","Centro","aluguel",2600),
    ("TR-073","Terreno","Pinheirinho","venda",525000),
    ("CS-032","Casa","Porto Velho","venda",440000),
    ("TR-072","Terreno","São José do Alegre","venda",50000),
    ("TR-071","Terreno","Quintas do Cafezal","venda",None),
    ("CS-081","Casa","Piedade","venda",280000),
    ("ST-001","Sítio","Santa Rita do Sapucaí","venda",950000),
    ("TR-070","Terreno","N S de Fátima","venda",330000),
    ("AP-075","Apartamento","Varginha","venda",500000),
    ("CS-080","Casa","Pinheirinho","venda",950000),
    ("TR-069","Terreno","Delfim Moreira","venda",300000),
    ("CS-072","Casa","Vila Isabel","venda",685000),
    ("AP-071","Apartamento","Medicina","venda",750000),
    ("AP-070","Apartamento","Centro","venda",900000),
    ("CS-071","Casa","BPS","venda",700000),
    ("AP-066","Apartamento duplex","Medicina","venda",850000),
    ("CS-070","Casa","Boa Vista","venda",350000),
    ("IM-008","Galpão","Santa Helena","aluguel",4500),
    ("IM-007","Imóvel","Morro Chic","venda",850000),
    ("TR-061","Terreno","Parque da Cidade","venda",None),
    ("TR-060","Terreno","São José do Alegre","venda",120000),
    ("CS-068FT","Sobrado","N S de Fátima","venda",1000000),
    ("TR-052FT","Terreno","Jardim das Colinas","venda",40000),
    ("TR-050FT","Terreno","Pinheirinho","venda",650000),
    ("CS-066FT","Casa","N S de Fátima","venda",880000),
    ("CS-065FT","Sobrado","N S de Fátima","venda",850000),
    ("AP-061FT","Apartamento","Varginha","venda",830000),
    ("TR-044","Terreno","Piedade","venda",1200000),
    ("TR-040","Terreno","Piranguinho","venda",777000),
    ("CS-061","Sobrado","Varginha","venda",550000),
    ("CS-060","Sobrado","Avenida","venda",630000),
    ("CS-055","Casa","Santa Rosa","venda",950000),
    ("AP-041-C","Apartamento","Centro","venda",364160),
    ("CS-043","Casa alto padrão","Jardim Eldorado","venda",850000),
    ("AP-041-E","Apartamento","Centro","venda",575760),
    ("AP-041-D","Apartamento","Centro","venda",524080),
    ("AP-041-B","Apartamento","Centro","venda",344960),
    ("AP-041-A","Apartamento","Centro","venda",355600),
    ("CS-042","Casa","Centro","venda",1050000),
    ("TR-032","Terreno","Pinheirinho","venda",585000),
    ("TR-028","Terreno","Morro Chic","venda",200000),
    ("CH-002","Chácara","Couto","venda",400000),
    ("TR-025","Terreno","Pinheirinho","venda",525000),
    ("TR-024","Terreno","Centro","venda",1000000),
    ("IM-005","Imóvel","Centro","venda",3500000),
    ("IM-003","Imóvel","Varginha","venda",1065000),
    ("CS-039","Casa","Pinheirinho","venda",3500000),
    ("AP-037","Apartamento","Morro Chic","venda",500000),
    ("CS-037","Casa","Pinheirinho","venda",1600000),
    ("CS-031","Casa","Pinheirinho","venda",1500000),
    ("TR-022","Terreno","Morro Chic","venda",350000),
]

OUTRAS_CIDADES = {"São José do Alegre", "Delfim Moreira", "Santa Rita do Sapucaí", "Piranguinho"}

def cidade_de(bairro):
    return bairro if bairro in OUTRAS_CIDADES else ITAJUBA

def tipo_base(t):
    t = t.lower()
    if "apartamento" in t: return "apartamento", "apartamento"
    if "galpão" in t:    return "comercial", "galpao"
    if "sítio" in t or "sitio" in t: return "rural", "sitio"
    if "chácara" in t or "charca" in t: return "rural", "chacara"
    if "terreno" in t or "lote" in t: return "terreno", "terreno"
    if "sobrado" in t:  return "casa_ext", "sobrado"
    if "casa" in t:     return "casa_ext", "casa"
    if "imóvel" in t or "imovel" in t: return "comercial", "imovel"
    return "casa_ext", "imovel"

def specs(tipo, preco, fim):
    """Metragem/rooms provisórios, coerentes com o tipo e a faixa de preço."""
    if fim == "aluguel":
        base = {"apartamento": (55, 2, 1, 1, 1), "galpao": (300, 0, 0, 2, 2),
                "casa": (120, 3, 1, 2, 2), "terreno": (400, 0, 0, 0, 0)}.get(tipo, (90, 2, 1, 1, 1))
    elif tipo in ("apartamento",):
        alto = (preco or 0) >= 500000
        base = (random.randint(90, 145), 3, random.randint(1, 2), 3, 2) if alto \
            else (random.randint(45, 85), random.randint(1, 3), random.randint(0, 1), random.randint(1, 2), 1)
    elif tipo == "casa":
        v = preco or 0
        if v >= 2000000:   base = (random.randint(320, 520), 5, random.randint(3, 5), 5, 4)
        elif v >= 900000:  base = (random.randint(200, 300), 4, random.randint(2, 3), 4, 3)
        elif v >= 500000:  base = (random.randint(150, 210), 3, 2, 3, 2)
        else:              base = (random.randint(90, 150), 3, 1, 2, 2)
    elif tipo == "sobrado":
        base = (random.randint(200, 320), 4, random.randint(2, 4), 4, 2)
    elif tipo in ("terreno", "lote"):
        area = random.choice([200, 300, 360, 400, 450, 500, 600, 1000])
        base = (area, 0, 0, 0, 0)
    elif tipo == "sitio":
        base = (random.randint(5000, 45000), 3, 2, 3, 2)
    elif tipo == "chacara":
        base = (random.randint(1500, 8000), 2, 1, 2, 2)
    elif tipo == "galpao":
        base = (random.randint(400, 2500), 0, 0, 2, 3)
    else:
        base = (random.randint(120, 300), 3, 2, 3, 2)
    return dict(zip(("area", "quartos", "suites", "banheiros", "vagas"), base))

DESCRICOES = {
 "casa": "{b}, {c}. Casa de {a} m² com {q} dormitórios, {s} suítes e {v} vagas de garagem. "
         "Construção sólida, iluminação natural e área externa com espaço para jardim e churrasqueira. "
         "Rua tranquila, com comércios e serviços próximos e fácil acesso às principais vias da região.",
 "sobrado": "{b}, {c}. Sobrado de {a} m² distribuído em {q} dormitórios, sendo {s} suítes, com {v} vagas. "
            "Sala em dois ambientes, cozinha planejada e Quintal nos fundos. Imóvel com boavalor de "
            "revenda, pronto para morar ou adaptar conforme a necessidade da família.",
 "apartamento": "{b}, {c}. Apartamento de {a} m² com {q} dormitórios, {s} suítes, {ba} banheiros e {v} vaga. "
                "Prédio com portaria e elevador, Condomínio bem administrado e localização central, "
                "a poucos passos de comércios, bancos e serviços.",
 "terreno": "Terreno em {b}, {c}, com {a} m² de área. Rua pavimentada, documentação regularizada e "
            "boa localização para construção residencial. Ideal para quem busca construir do zero com "
            "liberdade total de projeto.",
 "sitio": "Sítio em {b}, {c}, com {a} m² de área total. Contém casa de {q} dormitórios, {s} suítes e área "
          "ruralappropriate para criação animal ou cultivo. Estrada de terra em boas condições, energia e "
          "água disponíveis, cercado e com mata nativa preservada.",
 "chacara": "Chácara em {b}, {c}, com {a} m². Casa com {q} dormitórios, {s} suítes, piscina natural, "
            "área de churrasco e pomar. Local tranquilo, ideal para fins de semana e lazer em família.",
 "galpao": "Galpão para aluguel em {b}, {c}, com {a} m² de área útil e {v} vagas de carga/descarga. "
          "Pé-direito alto, portão amplo, iluminação e ventilação naturais. Excelente para depósito, "
          "oficina ou operação comercial.",
 "imovel": "Imóvel comercial em {b}, {c}, com {a} m². {b2} alto fluxo de pessoas, {v} vagas e "
           "fachada em bom estado. Oportunidade paraPJ no coração da cidade.",
}
BAIRRO_FLOW = {"Centro":"alto fluxo de pessoas","BPS":"alto fluxo de pessoas","Santa Helena":"alto fluxo de veículos",
               "Avenida":"tráfego intenso de veículos","Varginha":"movimento comercial intenso",
               "Morro Chic":"boa circulação de veículos","Medicina":"movimento comercial intenso"}

def gera():
    out, i = [], 0
    for cod, tipo, bairro, fim, preco in INV:
        cat, slug = tipo_base(tipo)
        sp = specs(slug, preco, fim)
        i += 1
        # 2-5 fotos: externas/interiores para casas; mais variety nos demais
        if cat in ("casa_ext",):
            gal = fotos("casa_ext", 2, i) + fotos("casa_int", 3, i)
        elif cat == "apartamento":
            gal = fotos("apartamento", 2, i) + fotos("casa_int", 2, i)
        elif cat == "terreno":
            gal = fotos("terreno", 2, i)
        elif cat == "rural":
            gal = fotos("rural", 3, i) + fotos("casa_ext", 1, i)
        else:
            gal = fotos(cat, 2, i) + fotos("casa_int", 1, i)
        cidade = cidade_de(bairro)
        rotulo = BAIRRO_FLOW.get(bairro, "bom fluxo de pessoas")
        desc = DESCRICOES.get(slug, DESCRICOES["imovel"]).format(
            b=bairro, c=cidade, a=sp["area"], q=sp["quartos"], s=sp["suites"],
            ba=sp["banheiros"], v=sp["vagas"], b2=rotulo, PJ=" PJ")
        # suítes nunca > quartos
        if sp["suites"] > sp["quartos"]: sp["suites"] = sp["quartos"]
        out.append({
            "id": cod, "codigo": cod, "tipo": tipo, "slug": slug,
            "finalidade": fim, "preco": preco,
            "bairro": bairro, "cidade": cidade, "uf": "MG",
            "area": sp["area"], "quartos": sp["quartos"], "suites": sp["suites"],
            "banheiros": sp["banheiros"], "vagas": sp["vagas"],
            "descricao": desc.replace("ruralappropriate"," rural apropriada"),
            "fotos": gal, "destaque": i <= 6,
            "origem": "site-antigo",
        })
    return out

if __name__ == "__main__":
    imoveis = gera()
    here = os.path.dirname(os.path.abspath(__file__))
    destino = os.path.join(here, "..", "assets", "js", "data.js")
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    js = (
        "/* ===========================================================\n"
        "   Chico Marques Corretor de Imoveis - Itajuba/MG\n"
        "   Inventario migrado do site Joomla + JEA.\n"
        "   ATENCAO: metragem, dormitorios e descricoes sao preenchimento\n"
        "   provisorio (o JEA nao os expunha). Corrija na area do corretor.\n"
        "   Fotos: acervo de exemplo (Unsplash) -- subir as reais no painel.\n"
        "   =========================================================== */\n"
        "window.IMOVEIS_SEED = " + json.dumps(imoveis, ensure_ascii=False, indent=2) + ";\n"
    )
    with open(destino, "w", encoding="utf-8") as f:
        f.write(js)
    print(f"OK -> {os.path.normpath(destino)}  ({len(imoveis)} imoveis)")
    venda = sum(1 for x in imoveis if x["finalidade"] == "venda")
    print(f"   venda: {venda} | aluguel: {len(imoveis)-venda} | sem preco: {sum(1 for x in imoveis if not x['preco'])}")
