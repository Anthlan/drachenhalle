# DlE – Formatação de texto

## Propósito

Este documento descreve as regras de formatação dos textos em Z:Route: Redemption. A distinção entre **Anúncios de aliança** e **mensagens regulares**, O problema é que, no que diz respeito a esta área, as limitações técnicas são diferentes.

## Regras gerais

- Escreva em alemão ou em inglês, de acordo com os destinatários.
- Os artigos e os anúncios dirigem-se principalmente aos nossos próprios membros da aliança. Escreva a partir da perspectiva da nossa aliança: preferencialmente usando **Nós**, **nós** e **a nossa**, e dirigindo-se directamente aos membros com **.** e **Todos vocês.**.
- Evite palavras como: “A aliança”, “seus membros” ou “Os jogadores devem” onde “Nós”, “Os nossos membros” ou “Devia.” Seria mais natural.
- Explique a mecânica do jogo de forma objetiva e neutra. Presentar o contexto, as recomendações e os processos organizacionais como o nosso conhecimento e abordagem compartilhados.
- Escreva a etiqueta da aliança como **DlE**.
- As tags HTML devem ser abertas e fechadas corretamente.
- Utilize a formatação de forma seletiva: poucas cores, pontos destacados curtos e secções claras.
- Antes de enviar, verifique o limite de caracteres contra a fonte completa, incluindo tags HTML e emojis.
- Verifique as etiquetas novas ou incertas com uma breve mensagem de teste primeiro.

## Anúncios de Aliança

### Condições técnicas

- Máximo **1000 caracteres**.
- Pode ser utilizada a formatação HTML.
- As interrupções normais de linha podem separar as secções.
- Um exemplo pode ser anexado a um anúncio.
- Incluir tags HTML e emojis ao planejar a contagem de caracteres.

### Etiquetas estabelecidas

```html
<b>Texto ousado</b>
<color=#FFD700>Texto dourado</color>
<size=40>Texto maior</size>
```

As tags podem ser combinadas:

```html
<color=#FFD700><b>Título importante</b></color>
```

Fechar as etiquetas em ordem inversa. O ninho deve estar completo.

### Cuidado com o tamanho e o alinhamento

- Os valores de tamanho são relativos à interface do jogo e devem ser testados antes da utilização final.
- Um valor como `34` Pode parecer menor do que o texto padrão.
- `<align=center>` Não foi aceite de forma confiável e deve ser evitado.
- A cor e o tipo em negrito são geralmente mais robustos para os títulos do que o alinhamento elaborado.

### Exemplo: anúncio de aliança

```html
<color=#FFD700><b>DlE – Notícias da Aliança</b></color>
<color=#FF4040><b>IMPORTANTE:</b></color> Verifique os marcadores atuais antes do evento.
<b>Função:</b> Mantém o WEST e reforça os jogadores ameaçados.
<color=#7FFF00><b>Obrigado pelo apoio!</b></color>
```

### Exemplo: anúncio de função

```html
<color=#FFD700><b>Novas responsabilidades</b></color>
<b>Drachenherz</b> torna-se Senhor da Guerra, <b>Helltrain</b> Manutenção da Emboscada e <b>DaVinci1986</b> Assuma o recrutamento. Muito obrigado a <b>Lordmirko</b>, que deu vida ao papel do Senhor da Guerra até agora.
```

### Redução de ordem superior a 1000 caracteres

1. Remova a repetição.
2. Cortar a introdução e o fim.
3. Reduza os emojis.
4. Remova as etiquetas de formatamento menos importantes.
5. Mover detalhes para uma ilustração anexada ou segunda mensagem.

## Mensagens regulares

### Condições técnicas

- Há mais texto disponível do que nos anúncios de aliança.
- As interrupções de linha não funcionam de forma confiável.
- `<br>` Não é tratado como uma ruptura de linha confiável.
- Estabelecer o conteúdo como uma mensagem compacta de uma única linha, sempre que possível.

### Separadores adequados

```text
• Marcador
| Barra vertical
– Travessão
▶ Marcador de seção
```

### Exemplo: mensagem de implantação compacta

```html
<color=#FFD700><b>O Oeste:</b></color> Tomem posição cedo . | <color=#FF4040><b>Ataque:</b></color> somente após a marcação | <color=#7FFF00><b>SUSPORTO:</b></color> reforçar os jogadores ameaçados imediatamente
```

### Exemplo: lembrete factual

```html
<b>Um lembrete rápido:</b> Antes de começar, verifique se a pesquisa, a construção ou a formação são efetivamente realizadas durante o bônus de correspondência. | As atividades já em curso não recebem o bônus retroactivamente.
```

## Colores recomendados

Usar cores de forma funcional e adequada ao desenho escuro do DlE:

- `#FFD700` – Ouro: títulos, nome da aliança, termos positivos importantes
- `#FF4040` – Vermelho: avisos, proibições, avisos urgentes
- `#7FFF00` – Verde: benefícios, autorizações, apelos positivos à ação
- Cor branca ou cor padrão: texto regular do corpo

Muitas cores tornam mensagens curtas inquietas. Duas cores de sotaque e texto padrão são normalmente suficientes por mensagem.

## Estilo de escrita

- Escreva brevemente, claramente e perto da jogabilidade.
- Escreva de dentro da nossa comunidade em vez de relatar sobre a aliança como um observador externo.
- Ponha a ação em primeiro lugar, depois a razão.
- Evite jargões desnecessários e longas introduções.
- Estabeleça claramente os papéis e os objetivos das estratégias.
- Mantenha a comunicação de aliança sensível sutil e factual: perguntas, notas curtas e respostas suaves em vez de ataques pessoais.
- Nomear os jogadores corretamente, prestando especial atenção à capitalização.

## Trabalhar com ilustrações

- Uma ilustração complementa o anúncio, mas não substitui instruções essenciais.
- O texto e a imagem não devem contradizer-se.
- O objetivo principal deve ser compreensível sem abrir a imagem.
- As dicas reutilizáveis usam o mesmo nome de base para texto e imagem.

Exemplo:

```text
Ueberfall.md
Ueberfall.png
```
