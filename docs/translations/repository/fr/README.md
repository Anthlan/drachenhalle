# ZRoute – Salle des dragons DIE

Ce dépôt est la collection centrale et structurée de contenu sur **Z:Route: Redemption** et les **DIE** ses principales sections correspondent directement à la navigation de la [site Web](https://anthlan.github.io/drachenhalle/fr/).

## Langues

Le site offre un portugais allemand, anglais, français, russe et brésilien avec un sélecteur de langue sur chaque page. `content/<Topic>/<Language>` (`de`, `en`, `fr`, `ru`, `pt`Les images et les modèles de caractères sans texte sont partagés; les graphiques de connaissances traduits sont en direct à côté des fichiers linguistiques correspondants. [structure linguistique](../README.md) explique le flux de travail.

## Commencer

- [Règles d'archivage et paramètres du projet](ARCHIVREGELN.md)
- [Guides de style](../Styleguides/fr/README.md)

Chaque dossier objet contient ses propres `README.md` décrivant son but, son utilisation prévue et les règles de désignation applicables.

## Contenu

| Dossier | Contenu |
| --- | --- |
| [`Aktuelles`](../Aktuelles/fr/README.md) | Nouvelles tenues à jour manuellement pour la page d'accueil |
| [`Termine`](../Termine/fr/README.md) | Événements d'alliances à venir et passés avec une page de détail, des articles de connaissances connexes et un téléchargement de calendrier |
| [`Galerie`](../Galerie/fr/README.md) | Chat images, images de réaction, avatars et modèles de personnages |
| [`Drachenwissen`](../Drachenwissen/fr/README.md) | Conseils, stratégies et informations pour la vie quotidienne de jeu et d'alliance |
| [`Tutorials`](../Tutorials/fr/README.md) | Instructions guidées étape par étape pour les processus importants |
| [`Allianz`](../Allianz/fr/README.md) | Règles, fonctionnaires, responsabilités et documents de travail internes |
| [`Styleguides`](../Styleguides/fr/README.md) | Règles de conception et d'écriture pour une cohérence DIE Sommaire |
| [`Archiv`](../../Archiv/README.md) | Contenu remplacé, périmé ou historiquement pertinent |
| [`site`](../../site) | Sources techniques du site automatiquement généré |

Sous **Outils**, le site offre de petits outils interactifs. Le planificateur de boucliers lit le prochain raid et toute conquête simultanée de capital directement à partir des données d'événement, plans avec 72-, 24-, 12- et 8- les boucliers d'heure et les fenêtres de combat actives librement choisies, et peuvent créer des rappels de calendrier personnels. Les prix connus, les coûts de remplacement et les ateliers d'alliance hebdomadaires limitent la planification des coûts de soutien. fenêtre de la durée de l'aide, aide limite et les aides actives. T5–T9, il utilise des valeurs de base de 60–100 secondes par soldat, calculées à partir des mesures en jeu; T1–T4 et T10 sont extrapolées à partir de la progression observée de dix secondes. Avec votre vitesse de guérison personnelle, cela produit un nombre recommandé de soldats, tandis que le calibrage personnel dans le jeu reste disponible pour les troupes mixtes.

Les [Analyse de la folie des expéditions](https://anthlan.github.io/drachenhalle/fr/auswertungen/expeditionswahnsinn/) Comparaisons S105 et S97 les participants et les points dans la conquête de la capitale 10 Octobre 2026. Filtres Alliance, taux de participation pour la 20 des alliances avec des chiffres connus de l'adhésion, la distribution des contributions et un classement consultable avec l'exportation CSV font l'instantané complet de 563 Les serveurs supplémentaires sont listés séparément. Les données sous-jacentes sont stockées dans `apps/website/src/data/expedition-2026-10-10.json`.

## Soumission du contenu

Les membres de l'Alliance peuvent soumettre des images et des documents par l'intermédiaire du site Web de l'Alliance. [ZRoute Télécharger la boîte de réception](https://www.dropbox.com/request/4ha3swzj8zyl4mez6j8g). Aucun compte Dropbox n'est nécessaire pour le téléchargement.

Si possible, inclure votre nom de joueur et une brève description du contenu dans le nom de fichier. Télécharger un fichier doit inclure la permission de l'ajouter à cette archive publique. Toutes les soumissions sont examinées avant l'inclusion, nommément nommé et placé dans le dossier prévu.

### Compteur de boîtes de réception du site Web

Le workflow de Pages compte tous les fichiers du dossier de boîte de réception Dropbox partagé deux fois par heure et affiche le numéro à côté de l'icône de la boîte de réception. Les noms de fichiers et autres métadonnées ne sont pas publiés sur le site Web. Le dépôt nécessite les secrets de workflow `DROPBOX_APP_KEY`, `DROPBOX_APP_SECRET` et `DROPBOX_REFRESH_TOKEN` Si elles manquent, le site Web construit encore et l'icône de la boîte de réception reste sans compteur.

### Vues des pages du site Web

Un petit travailleur Cloudflare compte les vues de chaque page publiée dans une D1 Les deux valeurs apparaissent dans le pied de page. L'application ne stocke que le chemin de page et les compteurs agrégés; elle ne définit aucun témoin et ne stocke aucun identifiant de navigateur. [`apps/page-views`](../../apps/page-views/README.md). Sans la variable workflow `PUBLIC_PAGE_VIEWS_API_URL`, le site continue à construire normalement et le comptoir reste caché.

Cloudflare Web Analytics peut également être activé pour l'analyse privée des visites, pays, référents, appareils et pages populaires. Le jeton du site est stocké comme variable de flux de travail `PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN`. Pour exclure définitivement vos propres vues dans un navigateur, ouvrez `https://anthlan.github.io/drachenhalle/?traffic=off` Une fois. `?traffic=on` permet de compter à nouveau dans ce navigateur. Le développement local et les navigateurs automatisés ne sont jamais comptés. L'opt-out s'applique à la fois à Web Analytics et au compteur de pages visible.

## Principe de conception

Pour les images de chat et de réaction, le but et le style visuel sont maintenus séparément. Les images de chat racontent des scènes, tandis que les images de réaction fournissent des réponses courtes, réutilisables ou salutations. S1, S2, S3 ou S4. Les lignes directrices requises sont en [`Styleguides`](Styleguides), et les missions sont en [`media/gallery/STILINDEX.md`](../../media/gallery/STILINDEX.md).

## État d'avancement du projet

Le dépôt est une archive tenue en permanence. Le nouveau contenu est organisé selon les règles documentées de stockage et de nommage; les versions obsolètes sont archivées de manière transparente plutôt que silencieusement écrasées. Traçable dans l'histoire de Git.

## Droits et affiliation

C'est un **projet non officiel de fan et de communauté**. Il n'est pas connecté au développeur ou éditeur de *Z:Route: Redemption*. Les noms de jeux, marques et autres éléments protégés appartiennent à leurs titulaires de droits respectifs.

La publication de ce dépôt n'accorde pas l'autorisation générale de réutiliser ses textes, images, avatars ou modèles de caractères. Sauf indication contraire expresse, l'utilisation en dehors de ce projet nécessite l'autorisation des créateurs ou des droits respectifs. Les détenteurs.
