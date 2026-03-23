# Guide de contribution — RCM_LYS

## Équipe

| Rôle | Accès GitHub |
|------|-------------|
| Chef d'équipe | Admin |
| DevSecOps (Cyber) | Admin |
| Cyber | Maintain |
| Développeur × 2 | Write |
| Réseau | Write |

---

## Stratégie de branches

- `main` — branche de production, toujours stable. On ne merge dessus que des versions testées et validées.
- `develop` — branche d'intégration. Tout le travail quotidien converge ici.
- `feature/nom-de-la-feature` — pour développer une nouvelle fonctionnalité.
- `fix/nom-du-fix` — pour corriger un bug.

### Règles

- **Aucun push direct** sur `main` ou `develop`.
- Tout passe par une **Pull Request (PR)**.
- Chaque PR nécessite **au moins 1 approbation** avant d'être mergée.

---

## Workflow de développement

### 1. Créer sa branche

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nom-de-la-feature
```

### 2. Travailler et commiter

```bash
git add .
git commit -m "type: description courte"
```

### 3. Pousser sa branche

```bash
git push origin feature/nom-de-la-feature
```

### 4. Ouvrir une Pull Request

- Aller sur GitHub
- Cliquer sur "Compare & pull request"
- Base : `develop` ← Compare : `feature/nom-de-la-feature`
- Ajouter une description claire de ce qui a été fait
- Attendre la review et l'approbation

### 5. Merge vers main

- Uniquement quand `develop` est stable (milestone, release)
- Le chef d'équipe ouvre une PR `develop` → `main`
- Validation par au moins 1 reviewer

---

## Conventions de commits

Format : `type: description`

| Type | Usage |
|------|-------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation |
| `style` | Formatage, pas de changement de logique |
| `refactor` | Refactorisation du code |
| `test` | Ajout ou modification de tests |
| `chore` | Maintenance, dépendances, config |
| `security` | Correctif ou amélioration de sécurité |

Exemples :
- `feat: ajout de la page de connexion`
- `fix: correction du crash au chargement`
- `docs: mise à jour du README`
- `security: suppression de la clé API exposée`

---

## Conventions de nommage des branches

- Tout en minuscules
- Mots séparés par des tirets `-`
- Préfixe obligatoire (`feature/` ou `fix/`)

Exemples :
- `feature/page-login`
- `feature/api-utilisateurs`
- `fix/erreur-connexion-db`

---

## Règles de sécurité

### Secrets et données sensibles

- **Ne JAMAIS commiter** de mots de passe, clés API, tokens ou credentials dans le code.
- Utiliser des **variables d'environnement** (fichier `.env` listé dans le `.gitignore`).
- `gitleaks` est configuré en hook pre-commit pour détecter automatiquement les secrets avant chaque commit.

### Si un secret est commité par accident

1. **Ne pas simplement le supprimer dans un nouveau commit** — il reste dans l'historique Git.
2. Prévenir immédiatement le DevSecOps.
3. Révoquer le secret compromis (régénérer la clé API, changer le mot de passe).
4. Le DevSecOps se chargera de nettoyer l'historique si nécessaire.

### Bonnes pratiques

- Garder ses dépendances à jour.
- Ne pas désactiver les hooks pre-commit.
- Signaler toute faille ou comportement suspect au DevSecOps.

---

## Review de code

### Pour le reviewer

- Vérifier la logique et la lisibilité du code.
- S'assurer qu'aucun secret n'est présent.
- Vérifier que les conventions de commit et de nommage sont respectées.
- Laisser des commentaires constructifs.

### Pour l'auteur de la PR

- Décrire clairement ce que fait la PR.
- Répondre aux commentaires et faire les corrections demandées.
- Ne pas merger sa propre PR sans approbation.

---

## Outils de sécurité

| Outil | Rôle |
|-------|------|
| `gitleaks` | Détection de secrets dans le code et l'historique Git |
| Scans SAST | Analyse statique du code (sera intégré dans la CI/CD) |
| Scan SCA | Vérification des vulnérabilités dans les dépendances |

---

*Dernière mise à jour : Mars 2026*
