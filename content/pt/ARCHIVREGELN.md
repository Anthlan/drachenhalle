# Regras do arquivo e parâmetros do projeto

## Projeto

- **Jogo:** Z:Caminho: Redenção
- **A ortografia da Aliança neste site:** DIE
- **Nomes anteriores:** DRR / Drachenritter
- **Nota técnica:** A ortografia `DIE` é bloqueado pelo filtro do jogo. No jogo, `DlE` deve, por conseguinte, ser utilizado.
- **Nome do jogador:** Anthlan
- **Propósito do arquivo:** Preservar centralmente textos, imagens, regras, instruções, estratégias e análises reutilizáveis para o jogo e a aliança.

Neste site e no repositório, a aliança é chamada consistentemente **DIE**. A filtragem técnica pode exigir uma ortografia diferente no jogo. Os nomes anteriores **DRR** e **Drachenritter** são utilizadas apenas para documentar um estado histórico.

## Escopo do conteúdo

- O conteúdo refere-se exclusivamente a **Z:Caminho: Redenção**, o **DIE** Aliança e contexto associado ao jogo.
- As informações pessoais ou profissionais não pertencem a textos de aliança, gráficos ou descrições de personagens.
- O conteúdo de Pandora é tratado separadamente das dicas gerais.
- Mecânicas de jogo não confirmadas estão claramente etiquetadas **Não confirmado**, **a ser testada** ou **nota comunitária**.
- Sempre que possível, os números, os bônus e a mecânica do jogo devem ser documentados com uma captura de tela, exibição no jogo ou fonte confiável.

## Estrutura de pasta

- `content/Aktuelles/de` e `content/Aktuelles/en`: Notícias alemãs e inglesas para a página inicial
- `content/Termine/de` e `content/Termine/en`: eventos da aliança com data, hora, página dedicada de detalhes, conteúdo de conhecimento relacionado e download de calendário
- `Galerie`: imagens de chat, imagens reacionais, avatares e modelos de personagens
- `content/<Topic>/de` e `content/<Topic>/en`: fontes de texto paralelas para o Conhecimento dos Dragões, Alliance e Tutoriais; caminhos relativos e nomes de arquivos idênticos
- `Styleguides`: regras exigidas para a concepção e a formatagem de texto
- `Archiv`: versões substituídas, ultrapassadas ou puramente históricas
- `site`: fontes técnicas e scripts de construção de sites

## Regras de armazenamento

1. Mantenha o armazenamento tão plano quanto possível. Não crie subpulturas adicionais para dicas, instruções ou imagens individuais.
2. O texto relacionado e o gráfico recebem exatamente o mesmo nome de arquivo base.
3. Mover versões ultrapassadas para `Archiv`. Evite nomes de arquivos como: `final`, `final2` ou `neu_neu`.
4. Os nomes de arquivos devem identificar o conteúdo sem abrir o arquivo.
5. Preservar a capitalização dos nomes dos jogadores, tal como mostrado no jogo ou na imagem.
6. Documentar mudanças estruturais e novas regras exigidas através de compromissos significativos do Git.

## Regras de nome de arquivo

### Dicas e instruções

As dicas usam um número de sequência de dois dígitos e um nome descritivo curto:

```text
A dica_XX_Curso de Curso.
```

O texto e a imagem usam o mesmo nome de arquivo base:

```text
Tipp_01_Ueberfall.md
Tipp_01_Ueberfall.png
```

Para instruções, o tema é colocado provisoriamente em primeiro lugar:

```text
Thema_Kurztitel.Dateiendung
AllianzShop_SchrittFuerSchritt.md
AllianzShop_SchrittFuerSchritt.png
```

Se o texto for armazenado como HTML formatado, o nome do arquivo base também permanece inalterado. As regras para as seções atualmente vazias serão refinadas conforme necessário, quando o seu primeiro conteúdo for adicionado.

### Avatares

Padrão:

```text
Nome de jogo_Não , não ._MM_DD_HHMM.Dateado
```

Exemplos:

```text
mysteryZ_2026_08_07_1817.png
DRACHENHERZ_2026_08_24_1257.png
```

O nome do jogador vem em primeiro lugar para que todas as variantes de um jogador apareçam juntas. Sua ortografia corresponde exatamente ao nome na imagem.

### Modelos e cenários de personagens

Uma imagem de referência geral utiliza:

```text
Nome de jogo_Modelo de referência.
```

Exemplos:

```text
Anthlan_Referenzmodell.png
Drachenherz_Referenzmodell.png
```

Os modelos de personagens não usam timestamps. Se forem necessárias várias imagens de referência para um jogador, adicione a visão ou foco:

```text
Nome de jogo_Modelo de referência_Frente. Data terminada
Nome de jogo_Modelo de referência_Gançador. Data final
Nome de jogo_Modelo de referência_Seite.Dateiendung
Nome de jogo_Modelo de referência_Gesicht.Dateiendung
Nome de jogo_Modelo de referência_Ausruestung.Dateiendung
```

Preservar a capitalização do nome do jogador como utilizada no jogo ou na imagem de referência.

### Imagens de chat e reação

Padrão:

```text
Não , não ._MM_DD_HHMM_O título_A data foi finalizada.
```

A marca de tempo vem em primeiro lugar porque a organização cronológica é mais importante do que agrupar por um único caracter. Os caracteres principais só são anexados quando podem ser claramente identificados; vários nomes são separados por um substrato. O título curto e os nomes dos personagens principais não contêm espaços.

- `Galerie/Chatbilder` contém imagens cenográficas ou narrativas.
- `Galerie/Reaktionsbilder` contém respostas e saudações curtas e reutilizáveis.

As pastas descrevem apenas o propósito. Os estilos visuais S1, S2, S3 e S4 são atribuídos de forma independente no centro `Galerie/STILINDEX.md`. Uma imagem chibi pitoresca permanece, portanto, uma imagem de bate-papo S3; uma imagen de reação não é automaticamente S3 simplesmente por causa de sua categoria.

Exemplos:

```text
2026_09_17_2043_KaffeeOderSomea_Anthlan_Somea.png
2026_09_18_0718_Kaffeepause.png
2026_09_25_2331_Passt_Anthlan.png
```

## Tratamento do conteúdo histórico

- O conteúdo com DRR, antigos papéis ou regras obsoletas não é silenciosamente sobreescrevido.
- Se ainda valer a pena documentá-lo, marque-o claramente e mude-o para `Archiv`.
- A versão atual sempre usa **DIE** e as últimas funções e regras confirmadas.
