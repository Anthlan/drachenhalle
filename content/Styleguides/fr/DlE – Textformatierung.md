# DlE – Formatage de texte

## Objet

Le présent document décrit les règles de formatage des textes Z:Route: Redemption. Il distingue entre **annonces d'alliances** et **messages réguliers**, car ces domaines ont des limites techniques différentes.

## Règles générales

- Écrire en allemand ou en anglais pour convenir aux destinataires.
- Les articles et les annonces s'adressent principalement aux membres de notre alliance. **nous**, **nous** et **notre**, et s'adresser directement aux membres **vous** et **vous tous**.
- Évitez de formuler comme, l'alliance,, ses membres, ou, les joueurs devraient, où, nous,, nos membres, ou, vous devriez, serait plus naturel.
- Expliquez la mécanique du jeu objectivement et neutrement. Présentez le contexte, les recommandations et les processus organisationnels comme notre connaissance et notre approche partagées.
- Écris le tag alliance comme **DlE**.
- Les balises HTML doivent être ouvertes et fermées correctement.
- Utiliser le formatage sélectif : peu de couleurs, de petits reflets et des sections claires.
- Avant d'envoyer, vérifiez la limite de caractères par rapport à la source complète, y compris les balises HTML et les emojis.
- Vérifiez d'abord les balises nouvelles ou incertaines avec un message de test court.

## Annonces de l'Alliance

### Conditions techniques

- Maximum **1,000 caractères**.
- Le formatage HTML peut être utilisé.
- Les ruptures de ligne normales peuvent séparer des sections.
- Une illustration peut être jointe à une annonce.
- Inclure les balises HTML et les émojis lors de la planification du nombre de caractères.

### Balises établies

```html
<b>Texte gras</b>
<color=#FFD700>Texte doré</color>
<size=40>Texte plus grand</size>
```

Les étiquettes peuvent être combinées :

```html
<color=#FFD700><b>Titre important</b></color>
```

Fermer les étiquettes en ordre inverse. La nidification doit être complète.

### Attention avec la taille et l'alignement

- Les valeurs de taille sont relatives à l'interface du jeu et doivent être testées avant l'utilisation finale.
- Une valeur telle que `34` peut paraître plus petit que le texte standard.
- `<align=center>` n'a pas été accepté de façon fiable et devrait être évité.
- Les couleurs et les caractères gras sont généralement plus robustes pour les rubriques que pour l'alignement élaboré.

### Exemple : annonce d'alliance

```html
<color=#FFD700><b>DlE – Nouvelles de l'alliance</b></color>
<color=#FF4040><b>- Oui.</b></color> Veuillez vérifier les marqueurs actuels avant l'événement.
<b>Tâche :</b> Tenez l'OUEST et renforcez les joueurs menacés.
<color=#7FFF00><b>Merci pour votre soutien!</b></color>
```

### Exemple: annonce de rôle

```html
<color=#FFD700><b>NOUVELLES RÉPONSABILITÉS</b></color>
<b>Drachenherz</b> devient seigneur de guerre, <b>Helltrain</b> poignées Ambush et <b>DaVinci1986</b> prend le relais du recrutement. <b>Lordmirko</b>, qui a donné vie au chef de guerre jusqu'à maintenant.
```

### Ordre de raccourcissement 1,000 caractères

1. Enlever la répétition.
2. Raccourcir l'introduction et la fin.
3. Réduire les émojis.
4. Enlever les étiquettes de formatage less importantes.
5. Déplacez les détails dans une illustration ou un deuxième message.

## Messages réguliers

### Conditions techniques

- Plus de texte est disponible que dans les annonces d'alliances.
- Les ruptures de ligne ne fonctionnent pas de façon fiable.
- `<br>` n'est pas traité comme une rupture de ligne fiable.
- Le contenu de structure comme message compact à une seule ligne lorsque c'est possible.

### Séparateurs appropriés

```text
• Bullet
| Barre verticale
– Dash
Marqueur de section
```

### Exemple : message de déploiement compact

```html
<color=#FFD700><b>HÔTEL :</b></color> Prenez position tôt | <color=#FF4040><b>- Oui.</b></color> seulement après marquage | <color=#7FFF00><b>SOUTIEN :</b></color> renforcer immédiatement les joueurs menacés
```

### Exemple: rappel factuel

```html
<b>Rappel rapide :</b> Avant de commencer, vérifiez si la recherche, la construction ou la formation fonctionne réellement pendant le bonus correspondant. | Les activités déjà en cours ne reçoivent pas le bonus rétrospectivement.
```

## Couleurs recommandées

Utiliser les couleurs fonctionnellement et pour convenir à l'obscurité DlE conception:

- `#FFD700` – Or: rubriques, nom de l'alliance, termes positifs importants
- `#FF4040` – Rouge: avertissements, interdictions, avis urgents
- `#7FFF00` – Vert : avantages, autorisations, appels positifs à l'action
- Couleur blanche ou par défaut : texte du corps régulier

Trop de couleurs font des messages courts agités. Deux couleurs accent plus le texte par défaut suffisent généralement par message.

## Style d'écriture

- Écrire brièvement, clairement et près du gameplay.
- Écrivez de l'intérieur de notre communauté plutôt que de faire rapport sur l'alliance en tant qu'observateur externe.
- Mettez l'action en premier, puis la raison.
- Évitez le jargon inutile et les longues introductions.
- Définir clairement les rôles et les objectifs des stratégies.
- Gardez la communication d'alliance sensible subtile et factuelle : questions, brèves notes et des jabs doux plutôt que des attaques personnelles.
- Nommer les joueurs correctement, en accordant une attention particulière aux imitations.

## Travailler avec des illustrations

- Une illustration complète l'annonce mais ne remplace pas les instructions essentielles.
- Le texte et l'image ne doivent pas se contredire.
- L'objectif principal doit être compréhensible sans ouvrir l'image.
- Les bouts réutilisables utilisent le même nom de base pour le texte et l'image.

Exemple :

```text
Mmd.
Les données de l'enquête sont disponibles sur le site
```
