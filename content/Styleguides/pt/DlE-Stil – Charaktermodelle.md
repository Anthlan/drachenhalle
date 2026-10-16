# Estilo DlE – Modelos de personagens

## Propósito

Os modelos de personagens são a fonte visual vinculativa para figuras recorrentes. Devem definir o rosto, a construção, a roupa, as cores e os detalhes distintivos de forma suficientemente clara para que novos avatares, imagens e cenas de chat possam reproduzir de forma confiável a mesma figura.

Esta orientação deriva dos modelos de referência existentes em `Galerie/Charaktermodelle`. A série básica original M1 usa 1024 × 1536 pixels. M2 adiciona uma série mundial mais individual cujo formato depende da cobertura de referência necessária.

## Formatos básicos vinculativos da série M1

- Formatos de retrato com um **2:3** proporção, de preferência **1024 × 1536 pixels** ou maior na mesma proporção.
- Folha de caracteres cinematográficos escuros com duas áreas claramente legíveis:
  - identidade e um retrato dominante de corpo inteiro à esquerda,
  - módulos de referência factual à direita.
- A rede fornece uma organização e **não é uma interface de usuário moderna visível**. A folha completa se assemelha a um quadro de conceito de fantasia, não a um painel de instrumentos ou uma coleção de cartões uniformes.
- Margem externa com largura de 1024 pixels: aproximadamente 24–32 pixels.
- Proporção de colunas: aproximadamente **48% à esquerda / 52% à direita**; intervalo aceitável da coluna esquerda 45–52 %.
- Estreito, visualmente calmo canal central de aproximadamente 12–20 pixels.
- Todos os conteúdos permanecem dentro de uma margem segura. Os chifres, os cabelos, as armas, o nome e os dedos não devem ser cortados.
- As linhas finas, os quadros e os espaços dos módulos formam uma grade compartilhada. Patina, sombra, pano, arquitetura ou luz podem misturá-los parcialmente no mundo visual. O espaço vazio é bem-vindo; os módulos não devem ser comprimidos para serem ilegais.

## M2 – Mundos de personagens individuais (série mundial)

- A M2 individualiza os modelos mais fortemente através dos seus próprios mundos. A configuração, a arquitetura, os adereços, a luz, os materiais e o simbolismo pessoal tornam-se tão vinculativos quanto a aparência da figura.
- O formato básico pode ser: **3 ou quadrado**. Uma folha quadrada é particularmente adequada quando se documenta uma variante adicional de roupa ou equipamento à direita.
- A área do mundo cenográfico e os módulos de referência factuais permanecem claramente legíveis, mas formam um ambiente compartilhado em vez de dois painéis concebidos separadamente.
- Os arquivos finais maiores e mais detalhados são expressamente bem-vindos. É decisivo uma referência facial confiável, uma visão de todo o corpo, um equipamento reprodutivo e um material e um detalhe de cor legíveis.
- **Cada modelo M2 inclui uma roupa alternativa específica para o personagem.** A roupa principal mostra o papel central familiar; a alternativa revela deliberadamente outro lado documentado no perfil, como a vida cotidiana em vez de cerimônia, cuidado em vez do combate, artesanato em vez da liderança ou viagens em vez das vidas na corte.
- A roupa alternativa é um contrapunto narrativo, não apenas uma mudança de cor. O corte, os materiais, o equipamento e a postura devem explicar qual outro lado do personagem está a ser mostrado.
- Ambas as roupas mostram claramente a mesma pessoa. A face, a anatomia, a idade, a pele, os cabelos, os olhos, os chifres, as escamas e outras características inconfundíveis permanecem idênticas. As cores, materiais ou símbolos recorrentes conectam as roupas sem que sejam uniformes.
- Documentar o equipamento alternativo com pelo menos uma visão de corpo inteiro claramente legível e visões adequadas de detalhes ou retratos na mesma folha M2.
- A versão principal vinculativa é denominada `Spielername_Modell_Weltserie.png`. As versões adicionais recebem um sufixo descritivo.

## Gradeira de páginas vinculativas

```text
┌──────────────────────┬─────────────────────────┐
│ Nome                 │ RETRAGEM  │ PROFILE     │
│ ROLE                 ├───────────┴─────────────┤
│ Características               │ VÍOES                   │
│                      │ dianteira │ lado │ de volta     │
│                      ├─────────────────────────┤
│ Domínio             │ Detalhes                 │
│ Figura de corpo inteiro     │ 4–5 característicos         │
│ em postura de herói         │ Culturas                   │
│                      ├─────────────────────────┤
│ Bandeira/emblema        │ Expresões (SELECÇÃO) │
│                      │ 4–5 expressões faciais  │
│                      ├─────────────────────────┤
│ Motto curto          │ Paleta de cores │ Perfil│
└──────────────────────┴─────────────────────────┘
```

O diagrama descreve a hierarquia da informação, não a forma visível de um quadro de fios técnico. A ordem do módulo à direita é obrigatória. Só quando uma característica física é mais importante do que expressões `DETAILS` e `EXPRESSIONS (SELECTION)` Alturas de troca. O retrato, o perfil, as vistas e a paleta de cores permanecem sempre presentes.

## Língua de projeto compartilhada

Todos os modelos de personagens combinam **Ficha de referência e cena cinematográfica**. Ambos devem pertencer credivelmente ao mesmo espaço visual.

- A coluna esquerda apresenta uma cena de personagem atmosférica. A direita adota a sua luz, cores, materiais e profundidade de fundo numa forma mais calma.
- As superfícies escuras mostram caráter material: metal encenado, pedra envelhecida, couro envelhado, pano escuro, fumaça, fuligem ou textura de pergaminho altamente restringida. Evite o preto plano puro e perfeito.
- Os quadros se parecem com latão ou metal finos e velhos. Leves irregularidades, desgaste, linhas interrompidas e sombras locais são bem-vindas.
- Os módulos podem variar em altura e seguir visualmente a figura, a bandeira ou a arquitetura. Simetria perfeita não é uma meta.
- O fundo, a bandeira, a capa ou a iluminação podem atingir os limites dos módulos ou sobrepõ-los localmente, desde que os rótulos e as referências permaneçam claros.
- A composição tem uma hierarquia narrativa: primeiro rosto e figura do herói, depois nome e silhueta, seguido por retrato e vistas, e finalmente detalhes, expressões e paleta.
- Cada folha ganha uma identidade específica do personagem através da letra do nome, da cor do sotaque, do cenário e de um motivo pessoal confirmado. A rede compartilhada não deve aplanar a individualidade.
- A impressão geral é de alta qualidade e desenvolvida, mas não estéril. Patina, desgaste, ligeira irregularidade atmosférica e profundidade espacial pertencem ao estilo DlE.

## Alocação de superfícies

### Coluna esquerda: identidade e impacto

- **Cabeça, aproximadamente 9–13 % da altura da página:** nome do jogador no maior nível tipográfico; papel ou arquétipo abaixo em capitais consideravelmente menores.
- **Lista de traços, aproximadamente 10–18 %:** quatro a no máximo oito termos curtos numa lista vertical com pequenas marcas de diamante, estrela, coroa ou dragão. Eles descrevem a personalidade ou a função e não substituem as referências visuais. Não são permitidos botões redondos de símbolos e azulejos de ícones uniformes.
- **Retrato de herói, aproximadamente 65–78 %:** Mostre a figura o mais completamente possível, de cabeça a pés. A postura transmite personalidade, mas permanece neutra o suficiente para avaliar roupas e silueta.
- **Motto, aproximadamente 5–9% na parte inferior:** Uma frase breve e confirmada de não mais de duas linhas. Pode ser omitido para mostrar a figura de forma maior e mais clara.
- A bandeira da Aliança, o emblema do dragão ou a referência de localização sentam-se atrás ou ao lado da figura e permanecem visualmente subordinados.

### Coluna à direita: referência reprodutível

1. **Retrato e perfil, aproximadamente 20–24 %:** Duas imagens de cabeça de tamanho igual. Vista frontal ou ligeira de três quartos à esquerda, perfil verdadeiro à direita. O tamanho da cabeça, a luz e a colheita são comparáveis.
2. **Vistas, aproximadamente 27–34 %:** Pelo menos dianteiro, lateral e traseiro; uma visão de segundo lado ou de três quartos é opcional. Postura neutra, mesma escala, roupa consistente e fundo escuro calmo.
3. **Detalhes, aproximadamente 12–17 %:** de quatro a cinco culturas de enquadramento semelhante. Mostre apenas características que definem a identidade, como olhos, jóias, tatuagem, arma, armadura, emblema de manto ou companheiro.
4. **Expressões (seleção), aproximadamente 10–14 %:** quatro a cinco imagens faciais bem cortadas com expressões claramente distintas, mas credíveis.
5. **Paleta de cores e perfil curto, aproximadamente 6–10 %:** cinco a sete amostras circulares, em ordem de cor principal, cor secundária, metal, pele/pelúcia, acento e, opcionalmente, cor mágica ou de olhos. Além deles, não mais do que quatro termos curtos.

Os módulos da coluna direita compartilham uma linha de base, mas não precisam de se assemelhar a cartões idênticos. As alturas variáveis, as bordas abertas individuais e a integração parcial no fundo ou na luz conferem à série o seu caráter orgânico.

## Língua visual

- Ilustração de fantasia escura de alta qualidade, cinematográfica, semi-realista, que se assemelha à arte de jogo refinada.
- Anatomia, materiais e iluminação credíveis; nenhuma representação fotográfica claramente desenhada, semelhante a um anime ou arbitrariamente.
- Marinha escura, carvão e preto formam a base comum. O ouro envelhecido, o bronze e a luz quente de ámbar conectam todas as folhas de personagens com o mundo visual da DlE.
- As cores de acento individuais podem variar muito, por exemplo, vermelho, verde ou azul. Usá-los de forma seletiva nas roupas, emblemas, lâmpadas de bordas e paletes, em vez de em uma imagem completa.
- Os fundos mostram o castelo, o salão da aliança, a cidade ou o acampamento de forma atmosférica. Eles suportam a origem e o papel sem ultrapassar figuras ou módulos de referência.
- O fundo não para abruptamente no eixo central. Luz, arquitetura, bandeiras, fumaça ou textura do chão conectam sutilmente ambas as colunas.
- O personagem principal é a informação mais brilhante e de maior contraste à esquerda. Os pontos de vista referentes à direita são mais factuais e uniformemente iluminados sempre que possível.
- Os metais, o couro, o tecido, a pele, o cabelo e a pele conservam os mesmos materiais e cores em todas as vistas.
- As superfícies mostram um desgaste fino e irregularidades credíveis. O brilho suave, as bordas vectoriais perfeitas e um visual publicitário de produtos premium não se adequam à série.

## Consistência de caracteres

Antes de desenhar, registar por escrito as características inalteráveis:

- Forma do rosto, idade aparente e cor da pele ou da pele
- cor dos olhos e características distintivas dos olhos
- Pintura, cor do cabelo, barba, chifres ou orelhas
- altura, construção e proporções
- cicatrizes, tatuagens, escamas ou outras características da pele
- Roupas principais, silhueta de armadura e forma de capa
- cores recorrentes e tipo de metal
- Joias, armas, amuletos, sacos ou companheiros
- posição e forma do dragão ou emblema pessoal

Estas características coincidem em todas as poses de herói, retrato, perfil, visões, detalhes e expressões. Um acessório só pode estar ausente quando a colheita o exclui naturalmente. As variantes figurativas pertencem à sua própria folha de modelo claramente rotulada e não podem ser misturadas sem explicação.

## Tipografia e rótulos

- O nome do jogador é o único elemento tipográfico fortemente individualizado. Uma fonte de exibição clássica, gótica, gravada ou escrita à mão deve corresponder à figura enquanto permanece instantaneamente legível. As letras podem ser distintivas, mas não devem dominar o cabeçalho como um logotipo de grande porte.
- Os títulos de papéis e módulos usam um serif medieval calmo em capitais.
- As listas de texto e traços do corpo permanecem claras, de alto contraste e substancialmente menores do que o nome.
- Colores: marfim quente ou ouro antigo; cor de acento individual apenas para pequenos símbolos, linhas de divisão ou iniciais selecionados.
- Nomes de módulos alemães vinculativos: `PORTRÄT`, `PROFIL`, `ANSICHTEN`, `VORNE`, `SEITE`, `HINTEN`, `DETAILS`, `MIMIK (AUSWAHL)` e `FARBPALETTE`.
- Verifique o texto após a geração de imagem e resete-o de forma limpa, se necessário. As letras ilegais da IA, as pseudo-palavras e os símbolos aleatórios nunca devem permanecer numa folha de modelo final.
- Escreva o nome da aliança exclusivamente como **DlE**. `DRACHENRITTER` Pode aparecer como um rótulo de função quando expressamente solicitado no conteúdo; não substitui o nome atual da aliança.

## Arrancas, ornamentos e marcas

- Os quadros finos em módulos separados em ouro, latão ou acento.
- Os quadros são finos e consistentes no material, mas podem ser visívelmente desgastados, abertos localmente ou parcialmente dissolvidos por sombra e fundo.
- Um quadro exterior fechado e perfeitamente simétrico não é necessário. Arquitetura, escuridão e piso podem terminar a borda de forma mais orgânica.
- Evite estruturas decorativas pesadas, contornos intensamente brilhantes e estética de vetores consistentemente limpa.
- Um emblema de dragão pode aparecer em bandeira, manto, armadura ou selo. A sua forma e posição devem permanecer idênticas em toda a folha.
- No máximo, um grande emblema à esquerda e um pequeno elemento de marca no pé.
- As coroas, os corações, as runas ou as referências regionais só são permitidas quando pertencem ao caráter confirmado.
- As assinaturas são facultativas e não devem abranger dados de paleta ou de referência.

## Conteúdo necessário e elementos opcionais

| Elementos | Estatuto | Requisitos mínimos |
| --- | --- | --- |
| Nome e função do jogador | Requisitos | sem ambiguidade e sem erros |
| Hero vista de corpo completo | Requisitos | silhueta completa |
| Retrato e perfil | Requisitos | mesma face, escala comparável |
| Vistas | Requisitos | dianteiro, lateral, traseiro |
| Culturas pormenorizadas | Requisitos | pelo menos quatro |
| Expresões | Requisitos | Pelo menos quatro expressões |
| Paleta de cores | Requisitos | 5 a 7 amostras |
| Lista de traços | Requisitos | 4 a 8 períodos curtos |
| Bandeira ou emblema do dragão | Recomendado | Subordenação visual |
| Motto: | opcional | Não mais de duas linhas |
| Impressões de cenas | opcional | Apenas adicionais, nunca substituindo expressões ou detalhes |
| Arma ou companheiro | opcional | somente se definindo caracteres |

## Modelo para novos caracteres

Complete pelo menos este briefing antes de gerar imagens:

```text
Nome do jogador:
ROLE / ARCHETYPE:
4–8 TREITOS do caráter:
ROSSA / AGE PARA APAIR:
PELE / OJOS / PELO:
Construção:
Vestimento / armadura:
COLORES principais:
COLOR ACCENT:
TÍPULO METAL:
4–5 Detalhes Requisitos:
Arma / Acessório / Companhia:
Emblema:
SETTING:
MOTO OPTIONAL:
```

Não substitua informações faltantes por tatuagens, crestas, armas ou jóias complexas aleatórias. Para detalhes abertos, prefira uma solução simples que possa ser reproduzida mais tarde.

## Ordem de produção recomendada

1. Defina o briefing de personagens e as características inalteráveis.
2. Gerencie uma visão neutra de todo o corpo, além de retrato e perfil.
3. Aproveite a cara, a construção, as roupas e os detalhes antes de criar outras variantes.
4. Derivar as vistas dianteiras, laterais e traseiras do mesmo modelo aprovado.
5. Adicione culturas e expressões de detalhes com características idênticas.
6. Só então, juntar a pose do herói, fundo, texto, quadros, emblema e paleta na folha final.
7. Verifique a folha preenchida no tamanho original e reduzido.

## Controle de qualidade

Armazenar um novo modelo de personagem somente quando todas as perguntas possam ser respondidas com sim:

1. O M1 utiliza um formato 2: 3, ou o M2 um formato 2:3 ou quadrado com módulos claramente ordenados?
2. A figura em pose de herói e as visões da mesma pessoa são idênticas?
3. O rosto, a pele, os olhos, o cabelo, as cicatrizes, as tatuagens, os chifres e os ouvidos concordam em todos os campos?
4. As roupas, armaduras, emblemas, jóias e armas são estruturalmente consistentes?
5. A frente, a lateral e a traseira mostram a mesma roupa sem elementos inventados?
6. O retrato e o perfil são claramente reconhecíveis, em vez de obscurecidos por capuz, cabelo ou sombras?
7. Os campos de detalhes ajudam a reproduzir a figura mais tarde?
8. As expressões são visiblemente diferentes sem mudar de cara ou aparente idade?
9. O texto é correto, legível e livre de pseudo-palavras?
10. O lençol está livre de membros extras, acessórios fundidos ou armas ilógicas?
11. O fundo é mais calmo do que a figura e a área de referência?
12. A folha reduzida ainda funciona como referência claramente organizada?
13. A folha se assemelha a um quadro de conceito de fantasia cinematográfica em vez de uma interface de usuário moderna?
14. Os quadros, as superfícies e os materiais possuem patina credível e profundidade espacial?
15. As cenas de herói e os módulos de referência estão visiblemente conectados através de luz, cor ou configuração?
16. A lista de traços é restringida e livre de botões de ícones grandes?
17. A roupa alternativa do M2 mostra outro lado documentado e não apenas uma variante recolorida?
18. A figura permanece claramente a mesma pessoa em ambas as roupas através de todos os traços de identidade?

## Evitar

- Formatos quadrados ou livres sem razão funcional; o M2 permite expressamente o formato quadrado para módulos mundiais ou de equipamento adicionais
- uma cena de herói puro sem visões factuais
- Mudanças de rostos, penteados, formas de corpo ou idades dentro de uma folha
- Diferença de vestuário entre a postura do herói, as vistas e os detalhes
- visões de corpo inteiro que sejam muito pequenas ou com pés, chifres e armas cortadas
- mais de oito palavras de traço ou longos blocos explicativos
- campos de detalhes puramente decorativos sem valor de reconhecimento
- Grades de cartão estéreis, simetria de espelho perfeita e uma aparência moderna do painel de instrumentos
- Botões redondos de traços grandes ou azulejos de ícones uniformes
- Estruturas de ouro brilhantes, linhas vectoriais limpas e estética publicitária brilhante
- uma divisão de design duro entre a cena do herói e a coluna de referência
- Interfaces de ficção científica e quadros de neon duros
- Cestas aleatórias, assinaturas, slogans e características não confirmadas
- Arquivos finais borrosos, de baixa resolução ou comprimidos visíveis

## Armazenamento e nomeação

Armazenar os modelos de referência finais no `Galerie/Charaktermodelle`.

```text
Nome de jogo_Modelo de referência.
Nome de jogo_Modelo_Weltserie.Dateiendung
```

Outras visualizações e cenas específicas de personagens seguem as regras de nomeação em `Galerie/Charaktermodelle/README.md`. O PNG é recomendado como o formato final; o JPEG faz sentido apenas para arquivos deliberadamente menores sem transparência ou artefatos de texto finos.
