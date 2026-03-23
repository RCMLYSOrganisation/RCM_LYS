Ce document définit les protocoles de sécurité et la marche à suivre pour signaler des vulnérabilités au sein de ce projet de groupe.

## Engagement de l'Équipe Cyber
La sécurité est une priorité intégrée dès la conception. Notre équipe (Cyber A & Cyber B) s'engage à :
* Analyser chaque Pull Request avant fusion sur `main`.
* Scanner quotidiennement les dépendances pour détecter des failles.
* Répondre aux signalements internes sous 24h.

##  Signalement d'une Vulnérabilité
**Ne signalez jamais une faille de sécurité via une "Issue" publique ou un commentaire de commit.**

Si vous découvrez une vulnérabilité (fuite de clé API, injection possible, bypass d'auth), suivez cette procédure :
1. Envoyez un message privé sur [Discord/Slack/Teams] aux membres Cyber.
2. Décrivez les étapes pour reproduire la faille.
3. Ne partagez pas cette information avec le reste du groupe tant qu'un correctif n'est pas déployé.
