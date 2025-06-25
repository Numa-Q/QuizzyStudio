# (QuizzyStudio = Quizzy + QuizzyPlay)

# Quizzy - Application de Quiz Interactifs

Quizzy est une application web conçue pour créer, gérer et jouer à des quiz interactifs. Elle permet aux utilisateurs de construire des quiz personnalisés avec divers types de questions, y compris du texte et des images, et fournit une plateforme pour tester leurs connaissances. Quizzy stocke toutes les données localement dans le navigateur de l'utilisateur en utilisant IndexedDB, garantissant une accessibilité hors ligne pour les quiz créés.

## Fonctionnalités Actuelles (Version 1.5.0)

### Création & Édition de Quiz :
*   **Créer de Nouveaux Quiz :** Commencez par donner un titre à votre quiz.
*   **Ajouter Diverses Questions :**
    *   **Réponse Ouverte :** Questions nécessitant une réponse tapée.
    *   **Choix Multiple :** Définissez plusieurs options et marquez une ou plusieurs comme correctes.
    *   **Vrai/Faux :** Questions simples de type vrai ou faux.
*   **Support d'Images :** Attachez des images (JPEG, PNG, GIF, SVG) aux questions. Inclut un aperçu de l'image et une option de suppression. Les images sont automatiquement redimensionnées pour optimisation.
*   **Explications :** Fournissez des explications pour les réponses, qui sont affichées après qu'une question a été tentée ou lors de la révision des résultats.
*   **Liste Dynamique des Questions :** Visualisez une liste des questions déjà ajoutées au quiz en cours de création.
*   **Modifier les Quiz Existants :** Modifiez n'importe quel aspect des quiz précédemment créés, y compris le titre, les questions, les réponses et les images.

### Gestion des Quiz :
*   **Voir Tous les Quiz :** Une liste centrale affiche tous les quiz enregistrés, montrant le titre, l'ID, le nombre de questions et la date de création.
*   **Persistance des Données :** Les quiz sont sauvegardés localement dans l'IndexedDB du navigateur, permettant aux utilisateurs d'accéder à leurs quiz même hors ligne.
*   **Import/Export :**
    *   **Exporter un Quiz Unique :** Téléchargez un quiz individuel sous forme de fichier JSON.
    *   **Exporter Tous les Quiz :** Téléchargez tous les quiz dans un seul fichier JSON pour sauvegarde ou partage.
    *   **Importer des Quiz :** Chargez des quiz à partir d'un fichier JSON (supporte les objets quiz uniques ou un tableau de quiz).
*   **Supprimer les Quiz :** Supprimez les quiz non désirés (avec une demande de confirmation).
*   **Quiz d'Exemple :** Un "Quiz d'introduction à la Cybersécurité" est automatiquement ajouté au premier chargement si aucun autre quiz n'existe, fournissant un exemple immédiat.

### Jouer aux Quiz :
*   **Mode de Jeu Interactif :** Lancez n'importe quel quiz de votre liste.
*   **Navigation entre les Questions :** Avancez et reculez dans les questions.
*   **Répondre :**
    *   Sélectionnez des options pour les questions à Choix Multiple et Vrai/Faux.
    *   Tapez les réponses pour les questions à Réponse Ouverte.
*   **Voir la Correction :** Après avoir tenté une question (pour les QCM et Vrai/Faux), les utilisateurs peuvent voir la bonne réponse et toute explication fournie.
*   **Résumé des Résultats :**
    *   Affiche le score de l'utilisateur (réponses correctes sur les questions notées ; les questions à réponse ouverte ne sont pas notées automatiquement).
    *   Fournit un examen détaillé de chaque question, montrant la réponse de l'utilisateur, la bonne réponse et les explications.
*   **Rejouer :** Option pour refaire un quiz.
*   **Animations de Célébration :**
    *   Petites animations amusantes pour l'obtention d'un bon score (par exemple, 80 % et plus).
    *   Animation de confettis en plein écran pour un score parfait sur les quiz avec des questions notées.

### Interface Utilisateur & Expérience :
*   **Design Réactif :** S'adapte à différentes tailles d'écran, garantissant une utilisabilité sur les ordinateurs de bureau et les appareils mobiles.
*   **Navigation Intuitive :** Barre de navigation claire (Accueil, Créer, Voir les Quiz, Statistiques).
*   **Notifications Toast :** Messages de feedback non intrusifs pour des actions comme la sauvegarde, les erreurs ou les opérations réussies.
*   **Attrait Visuel :** Design moderne avec des dégradés, des ombres et une typographie claire.
*   **Icônes d'Action :** Utilise des icônes pour les actions courantes comme exporter, importer, éditer, jouer et supprimer, améliorant la compréhension visuelle.

## Technologies Utilisées
*   **Frontend :** HTML5, CSS3, JavaScript (ES6+)
*   **Stockage Local :** IndexedDB pour le stockage de base de données côté client.
*   **Polices :** Google Fonts (Roboto).
*   **Icônes :** Provenant de Icons8 (selon les URL des images dans le code).

## Comment Utiliser
1.  Ouvrez `index.html` dans un navigateur web moderne.
2.  Naviguez en utilisant le menu supérieur :
    *   **Accueil :** Page de bienvenue.
    *   **Créer un Quiz :** Commencez à construire un nouveau quiz ou modifiez-en un existant.
    *   **Voir les Quiz :** Listez, jouez, gérez, importez/exportez vos quiz.
    *   **Statistiques :** (Espace réservé pour une future fonctionnalité).
3.  Vos quiz sont automatiquement sauvegardés dans votre navigateur.

## Améliorations Futures & Feuille de Route

Quizzy vise à s'améliorer continuellement et à ajouter des fonctionnalités plus engageantes. Voici quelques idées pour les versions futures :

### Améliorations des Fonctionnalités de Base :
*   **Page de Statistiques Améliorée :**
    *   Suivre les performances de l'utilisateur (scores moyens, scores au fil du temps).
    *   Identifier les questions les plus fréquemment manquées/correctement répondues.
    *   Temps passé par quiz/question.
*   **Types de Questions Avancés :**
    *   Textes à trous.
    *   Appariements.
    *   Questions de séquençage/ordonnancement.
*   **Paramètres & Personnalisation des Quiz :**
    *   Option pour définir des limites de temps par quiz ou par question.
    *   Possibilité de randomiser l'ordre des questions.
    *   Randomiser l'ordre des réponses pour les questions à choix multiples.
*   **Recherche et Filtrage :**
    *   Rechercher des quiz par titre ou mots-clés dans les questions.
    *   Filtrer les quiz par catégorie ou tags (nécessiterait l'ajout d'une fonctionnalité de tagging).

### Expérience Utilisateur & Intégration IA :
*   **Génération de Questions Assistée par IA (API Gemini) :**
    *   Générer des questions de quiz basées sur un sujet ou un texte fourni par l'utilisateur.
    *   Suggérer des distracteurs plausibles pour les questions à choix multiples.
    *   Offrir un feedback automatisé ou des indices pour les questions à réponse ouverte.
*   **Gestion Améliorée des Images :**
    *   Une médiathèque dédiée pour les images téléchargées.
    *   Outils d'édition d'image de base (rogner, pivoter).
*   **Accessibilité Améliorée (A11y) :**
    *   Examen rigoureux et mise en œuvre des attributs ARIA.
    *   Tests complets de navigation au clavier et améliorations.
*   **Thèmes & Personnalisation :**
    *   Permettre aux utilisateurs de choisir différents thèmes de couleurs ou de personnaliser l'apparence de l'application.
*   **Internationalisation (i18n) :**
    *   Prise en charge de plusieurs langues dans l'interface utilisateur et pour le contenu des quiz.

### Collaboration & Partage (Portée Plus Large) :
*   **Comptes Utilisateurs :**
    *   Permettre aux utilisateurs de créer des comptes pour synchroniser les quiz entre appareils (nécessiterait un backend).
*   **Partage de Quiz :**
    *   Partager des quiz avec d'autres utilisateurs via des liens ou des codes.
*   **Création Collaborative de Quiz :**
    *   Permettre à plusieurs utilisateurs de contribuer à la création d'un seul quiz.

### Autres Fonctionnalités Potentielles :
*   **Quiz Imprimables :** Option pour générer une version imprimable des quiz.
*   **Ludification :** Introduire des badges, des points ou des classements pour rendre l'apprentissage plus engageant.
*   **Suivi de Progression pour des "Cours" :** Regrouper les quiz en modules d'apprentissage plus larges.

Cette feuille de route est sujette à modification en fonction des retours des utilisateurs et des priorités de développement. Nous sommes enthousiastes quant à l'avenir de Quizzy et accueillons toutes les suggestions !
