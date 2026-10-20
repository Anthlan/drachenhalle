# Règles d'archivage et paramètres du projet

## Projet

- **Jeu :** Z:Route: Redemption
- **L'orthographe de l'Alliance sur ce site :** DIE
- **Noms précédents :** DRR / Drachenritter
- **Note technique:** L'orthographe `DIE` est bloqué par le jeu, filtre s. Dans le jeu, `DlE` doit donc être utilisée.
- **Nom du joueur & #160;:** Anthlan
- **Objet de l'archive :** Préservez centralement les textes, images, règles, instructions, stratégies et analyses réutilisables pour le jeu et l'alliance.

Sur ce site et dans le dépôt, l'alliance est appelée **DIE**. Le filtrage technique peut nécessiter une orthographe différente dans le jeu. **DRR** et **Drachenritter** ne sont utilisés que pour documenter un état historique.

## Portée du contenu

- Le contenu se rapporte exclusivement à **Z:Route: Redemption**, les **DIE** alliance et le contexte de jeu associé.
- Les informations personnelles ou professionnelles ne font pas partie des textes d'alliance, des graphiques ou des descriptions de caractères.
- Le contenu de Pandore est traité séparément des conseils généraux.
- Les mécaniciens de jeu non confirmés sont clairement étiquetés **non confirmé**, **à tester** ou **note communautaire**.
- Dans la mesure du possible, les chiffres, les bonus et les mécanismes de jeu doivent être documentés avec une capture d'écran, un affichage en jeu ou une source fiable.

## Structure du dossier

- `content/Aktuelles/<Language>`: les nouvelles de la page d'accueil dans chaque langue enregistrée (`de`, `en`, `fr`, `ru`, `pt`)
- `content/Termine/<Language>`: événements d'alliance avec une date, heure, page de détail dédiée, contenu de connaissances et téléchargement de calendrier
- `Galerie`: images de chat, images de réaction, avatars et modèles de personnages
- `content/<Topic>/<Language>`: sources de texte parallèles pour Dragon Knowledge, Alliance et Tutoriels ; chemins relatifs et noms de fichiers identiques dans `de`, `en`, `fr`, `ru` et `pt`
- `Styleguides`: règles requises pour la conception et le formatage du texte
- `Archiv`: versions remplacées, dépassées ou purement historiques
- `site`: sources techniques et scripts de création de site web

## Règles de stockage

1. Gardez le stockage aussi plat que possible. Ne créez pas de sous-dossiers supplémentaires pour des conseils, des instructions ou des images individuels.
2. Le texte associé et son graphique reçoivent exactement le même nom de fichier de base.
3. Déplacer les versions obsolètes vers `Archiv`. Évitez les noms de fichiers tels que `final`, `final2` ou `neu_neu`.
4. Les noms de fichiers doivent identifier le contenu sans ouvrir le fichier.
5. Préservez les noms des joueurs comme indiqué dans le jeu ou dans l'image.
6. Documenter les changements structurels et les nouvelles règles requises par des engagements significatifs de Git.

## Règles relatives au nom de fichier

### Conseils et instructions

Les conseils utilisent un numéro de séquence à deux chiffres et un nom descriptif court :

```text
Tipp_XX_Date de naissance
```

Texte et image utilisent le même nom de fichier de base :

```text
Tipp_01_Mmd.
Tipp_01_Les données de l'enquête sont disponibles sur le site
```

Pour les instructions, le sujet est placé en premier lieu à titre provisoire:

```text
Thématique_Date de naissance
AllianzShop_SchrittFuerSchritt.m
AllianzShop_Les données sont disponibles sur le site internet de l'Agence
```

Si le texte est enregistré en format HTML, le nom du fichier de base reste inchangé. Les règles pour les sections actuellement vides seront affinées au besoin lorsque leur premier contenu sera ajouté.

### Avatars

Modèle & #160;:

```text
Nom de l'épiderme_AAAA_MM_DD_Date de naissance
```

Exemples:

```text
mysteryZ_2026_08_07_1817.png
DRASCHENHERZ_2026_08_24_1257.png
```

Le nom du joueur vient en premier afin que toutes les variantes du lecteur apparaissent ensemble. Son orthographe correspond exactement au nom de l'image.

### Modèles de personnages et scènes de personnages

Une image de référence générale utilise:

```text
Nom de l'épiderme_Référencézmodell.Dateiendung
```

Exemples:

```text
Anthlan_Référencézmodell.png
Drachenherz_Référencézmodell.png
```

Les modèles de caractères n'utilisent pas de horodatage. Si plusieurs images de référence sont nécessaires pour un lecteur, ajoutez la vue ou la mise au point :

```text
Nom de l'épiderme_Référencézmodell_Date de naissance
Nom de l'épiderme_Référencézmodell_Ganzkoerper.Dateiendung
Nom de l'épiderme_Référencézmodell_Dateiendung
Nom de l'épiderme_Référencézmodell_Date de naissance
Nom de l'épiderme_Référencézmodell_Ausruestung.Dateiendung
```

Préservez le nom du joueur, les imitations utilisées dans le jeu ou dans l'image de référence.

### Images de chat et de réaction

Modèle & #160;:

```text
AAAA_MM_DD_HHMM_Kurztitel_[Hauptfiguren]Date de naissance
```

Le horodatage vient en premier parce que l'organisation chronologique compte plus que le regroupement par un seul caractère. Les caractères principaux sont annexés seulement quand ils peuvent être clairement identifiés; les noms multiples sont séparés par un point fort. titre abrégé et noms de caractères principaux ne contiennent aucun espace.

- `Galerie/Chatbilder` contient des images scéniques ou narratives.
- `Galerie/Reaktionsbilder` contient des réponses courtes et réutilisables et des salutations.

Dossiers décrivent uniquement le but. Styles visuels S1, S2, S3 et S4 sont assignées indépendamment dans le centre `media/gallery/STILINDEX.md`. Une image de chibi pittoresque reste donc une S3 chat image; une image de réaction n'est pas automatiquement S3 simplement en raison de sa catégorie.

Exemples:

```text
2026_09_17_2043_KaffeeOderSomea_Anthlan_Somea.png
2026_09_18_0718_Les données sont disponibles sur le site internet de la Commission
2026_09_25_2331_Passons_Anthlan.png
```

## Traitement du contenu historique

- Le contenu avec DRR, les anciens rôles ou les règles obsolètes n'est pas écrasé en silence.
- Si cela reste à documenter, il faut l'étiqueter clairement et le déplacer vers `Archiv`.
- La version actuelle utilise toujours **DIE** et les derniers rôles et règles confirmés.

## Cycle de vie des événements à durée limitée

- Après sa fin confirmée pour notre alliance, ajoutez un événement à temps limité sous,Events → Event Archive, et marquez-le,finished for us · événement à temps limité,. Donnez une date de fin seulement quand confirmé.
- Gardez le guide, les graphiques et la calculatrice à votre disposition pour référence. Affichez une note d'archive sur le guide et la calculatrice; ne faites plus la promotion de l'événement comme courant ou en cours d'exécution.
- Supprimer les calculatrices spécifiques à l'événement dans le menu Outils réguliers et les lier à l'entrée de l'archive. Préserver les URLs existantes lorsque c'est possible.
- Mark lancement et nouvelles promotionnelles avec `archived: true` Gardez les fichiers sources ; le générateur de nouvelles ne publie ni la liste ni la page d'article.
- Maintenez les entrées d'archives et les étiquettes d'état dans chaque langue enregistrée. Si un événement retourne, revérifiez les durées, devises, prix et récompenses avant de le présenter à nouveau comme courant.
