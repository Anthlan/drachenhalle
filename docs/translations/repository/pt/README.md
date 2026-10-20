# ZRoute – Salão dos Dragões DIE

Este repositório reúne, de forma centralizada e organizada, o conteúdo sobre **Z:Route: Redemption** e a aliança **DIE**. Suas principais seções correspondem à navegação do [site](https://anthlan.github.io/drachenhalle/pt/).

## Idiomas

O site oferece alemão, inglês, francês, russo e português brasileiro, com seleção de idioma em todas as páginas. Os textos editáveis ficam em `content/<Tema>/<Idioma>` (`de`, `en`, `fr`, `ru`, `pt`). Imagens sem texto e modelos de personagens são compartilhados; as imagens informativas traduzidas ficam junto aos textos do idioma correspondente. A [estrutura de idiomas](../README.md) explica o processo.

## Primeiros passos

- [Regras de arquivamento e parâmetros do projeto](ARCHIVREGELN.md)
- [Guias de estilo](../Styleguides/pt/README.md)

Cada pasta de tema contém seu próprio `README.md`, que explica sua finalidade, seus usos e as regras de nomenclatura.

## Conteúdo

| Pasta | Conteúdo |
| --- | --- |
| [Novidades](../Aktuelles/pt/README.md) | Notícias selecionadas manualmente para a página inicial |
| [Eventos](../Termine/pt/README.md) | Eventos futuros e anteriores da aliança, com detalhes, artigos relacionados e download para o calendário |
| [Galeria](../Galerie/pt/README.md) | Imagens de chat, imagens de reação, avatares e modelos de personagens |
| [Conhecimento dos Dragões](../Drachenwissen/pt/README.md) | Dicas, estratégias e informações para o dia a dia do jogo e da aliança |
| [Tutoriais](../Tutorials/pt/README.md) | Instruções guiadas para os processos mais importantes |
| [Aliança](../Allianz/pt/README.md) | Regras, oficiais, responsabilidades e documentos de discussão interna |
| [Guias de estilo](../Styleguides/pt/README.md) | Regras de design e redação para manter a identidade do conteúdo DIE |
| [Arquivo](../../Archiv/README.md) | Conteúdo substituído, desatualizado ou de importância histórica |
| [Site](../../site) | Código-fonte do site gerado automaticamente |

Em **Ferramentas**, o site oferece pequenos recursos interativos. O planejador de escudos consulta o próximo saque e eventuais conquistas simultâneas da capital diretamente nos dados dos eventos. Ele organiza escudos de 72, 24, 12 e 8 horas, considera períodos de combate escolhidos por você e permite criar lembretes pessoais no calendário. Preços conhecidos, custos de reposição e limites semanais de compra entram no planejamento. O planejador de cura calcula um lote seguro para cura imediata a partir da duração da ajuda, do limite de ajudas e dos ajudantes ativos. Para T5–T9, usa tempos-base de 60–100 segundos por soldado, obtidos por medições no jogo; T1–T4 e T10 são estimados pela progressão observada de dez segundos. Com sua velocidade pessoal de cura, isso gera uma quantidade recomendada de soldados. A calibração pessoal no jogo continua disponível para tropas mistas.

A [análise interativa de Loucuras da Expedição](https://anthlan.github.io/drachenhalle/pt/auswertungen/expeditionswahnsinn/) compara participantes e pontos de S105 e S97 na conquista da capital de 10 de outubro de 2026. Filtros de aliança, taxas de participação das 20 alianças com número conhecido de membros, distribuição das contribuições e um ranking pesquisável com exportação CSV permitem explorar o registro completo de 563 jogadores. Outros servidores aparecem separadamente. Os dados ficam em `apps/website/src/data/expedition-2026-10-10.json`.

## Enviar conteúdo

Os membros podem enviar imagens e documentos pela [caixa de entrada de uploads do ZRoute](https://www.dropbox.com/request/4ha3swzj8zyl4mez6j8g). Não é necessário ter uma conta Dropbox para enviar arquivos.

Sempre que possível, inclua seu nome no jogo e uma breve descrição no nome do arquivo. O envio deve incluir a autorização para adicionar o material a este arquivo público. Todas as contribuições são revisadas, recebem nomes adequados e são organizadas na pasta correspondente.

### Contador da caixa de entrada no site

O workflow de Pages conta os arquivos da pasta compartilhada do Dropbox duas vezes por hora e mostra o total ao lado do ícone da caixa de entrada. Os nomes dos arquivos e outros metadados não são publicados no site. Para essa consulta, o repositório precisa dos segredos de workflow `DROPBOX_APP_KEY`, `DROPBOX_APP_SECRET` e `DROPBOX_REFRESH_TOKEN`. Sem eles, o site continua sendo gerado normalmente e o ícone aparece sem contador.

### Visualizações das páginas

Um pequeno Cloudflare Worker conta os acessos a cada página publicada em um banco D1 e também retorna o total. Os dois valores aparecem no rodapé. A aplicação salva apenas o caminho da página e contadores agregados; não usa cookies nem armazena identificadores do navegador. A configuração está documentada em [`apps/page-views`](../../apps/page-views/README.md). Sem a variável de workflow `PUBLIC_PAGE_VIEWS_API_URL`, o site continua sendo gerado normalmente e o contador fica oculto.

O Cloudflare Web Analytics também pode ser ativado para a análise privada de visitas, países, referências, dispositivos e páginas mais populares. O token do site é armazenado na variável de workflow `PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN`. Para excluir permanentemente seus próprios acessos em um navegador, abra uma vez `https://anthlan.github.io/drachenhalle/?traffic=off`. O parâmetro `?traffic=on` reativa a contagem nesse navegador. O desenvolvimento local e navegadores automatizados nunca são contabilizados. A exclusão vale tanto para o Web Analytics quanto para o contador visível de páginas.

## Princípio de design

Nas imagens de chat e de reação, a finalidade e o estilo visual são independentes. Imagens de chat contam pequenas cenas; imagens de reação oferecem respostas curtas, reutilizáveis ou saudações. Ambas podem usar S1, S2, S3 ou S4. As orientações obrigatórias estão nos [guias de estilo](Styleguides), e as classificações estão no [índice de estilos da galeria](../../media/gallery/STILINDEX.md).

## Estado do projeto

O repositório é um arquivo mantido continuamente. Novos conteúdos seguem as regras documentadas de armazenamento e nomenclatura; versões desatualizadas são arquivadas de forma transparente. As alterações permanecem rastreáveis no histórico do Git.

## Direitos e vínculo

Este é um **projeto não oficial de fãs e da comunidade**. Não tem vínculo com a desenvolvedora ou a distribuidora de *Z:Route: Redemption*. Nomes de jogos, marcas e outros elementos protegidos pertencem aos respectivos titulares.

A publicação deste repositório não concede autorização geral para reutilizar textos, imagens, avatares ou modelos de personagens. Salvo indicação expressa em contrário, o uso fora do projeto exige a autorização dos respectivos criadores ou titulares dos direitos.
