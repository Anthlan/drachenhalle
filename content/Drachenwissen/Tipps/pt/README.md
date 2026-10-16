# Dicas

Esta pasta reúne artigos detalhados de conhecimento sobre dicas de aliança. Os arquivos de marcação podem e devem fornecer mais contexto do que um anúncio ou ilustração de aliança compacta: mecânica, aplicação, exemplos de trabalho, limitações, questões abertas e fontes adicionais.

Armazenar textos e ilustrações relacionados diretamente aqui com o mesmo nome de base inequívoco.

O desenho da ilustração segue a lei [`DIE style – Tips`](../../../../Styleguides/DlE-Stil%20%E2%80%93%20Tipps.md) Direcção.

## Metadados e filtros

Cada arquivo de dica começa com a matéria frontal. Manter os dois grupos de atributos separadamente; o site usa-os para cartões, páginas de detalhes e filtragem combinada:

```yaml
---
arten:
  - Anleitung
  - Strategie
themen:
  - Kampf
  - Allianz
---
```

- Valores permitidos para **Tipo**: `Anleitung`, `Strategie`, `Optimierung`
- Valores permitidos para **Tópico**: `Allianz`, `Events`, `Kampf`, `Truppen`, `Aufbau`, `Weltkarte`

Cada ponta requer pelo menos um valor de cada grupo. A matéria frontal é apenas metadados e não é exibida como conteúdo do artigo.

## Estrutura de arquivo

Cada arquivo Markdown contém a página completa de conhecimento. De forma opcional, adicione uma versão curta imediatamente antes da explicação pormenorizada:

```markdown
## Key points at a glance
```

Se esta secção existir, o site oferece automaticamente **“Breve e concisa”** e **“Detalhes”** As vistas. A visão curta contém apenas esta secção e o gráfico de ponta que acompanha. A visão pormenorizada começa no `## What is this tip for?` e inclui todas as seções seguintes, incluindo as fontes e o anúncio da aliança copiável. Há exactamente um arquivo de Markdown por dica.

Se for relevante para a dica em particular, a página de conhecimento detalhado deve conter as seguintes secções:

1. **Para que é esta gorjeta?** – finalidade, benefícios e situações adequadas.
2. **Mecânica e instruções** – O mecânico e um processo compreensível.
3. **Exemplos e contexto** – Calculações, variantes ou apoio à decisão.
4. **Limitações e questões abertas** – Riscos, declarações dependentes da versão e detalhes ainda por verificar.
5. **Fontes e confiabilidade** – Evidências no jogo, fontes externas confiáveis e status de revisão.
6. **Anúncio da Aliança para copiar** – O texto completo no jogo em um `html` Bloco de código, não escapado e directamente copiável.

O bloco HTML mantém inalterada a substância do texto aprovado no jogo. Informações adicionais pertencem ao artigo do conhecimento, não sem verificação no anúncio da aliança.

Sempre que possível, verifique as informações externas on-line e ligue-as diretamente. As declarações comunitárias devem ser reconhecíveis como tal. Se as informações entrarem em conflito, as exibições atuais no jogo têm prioridade; marque as incertezas como abertas ou ainda para testar.

## Regras de nomeação

- Padrão: `Tipp_XX_Kurztitel.extension`, por exemplo `Tipp_01_Ueberfall.md` e `Tipp_01_Ueberfall.png`.
- O número de dois dígitos corresponde ao número de ponta no conteúdo e é atribuído consecutivamente.
- O título curto descreve a dica brevemente e claramente. Utilize um caso mista legível sem espaços; os umlauts alemães são escritos como `Ae`, `Oe`, `Ue` e `ss`.
- Os textos, arquivos HTML e ilustrações associados devem ter exactamente o mesmo nome de base.
- As extensões de arquivo são minúsculas. `README.md` é isento deste regime de denominação de conteúdo.
