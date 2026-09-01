# Accès mobile / télécommande du cockpit MAOS (Route A — Tailscale)

> **En une image.** Tailscale crée un *couloir privé* entre tes appareils (le Mac + l'iPhone).
> Seuls eux ont la clé. Le téléphone emprunte ce couloir pour ouvrir le cockpit qui tourne
> sur le Mac. Rien n'est exposé sur l'internet public — le couloir *est* le verrou.
> C'est important car le cockpit n'a **pas de mot de passe** (app locale, un seul utilisateur) :
> la sécurité repose entièrement sur le fait que seul ton tailnet peut l'atteindre (voir
> CLAUDE.md §5/§11).

Une fois en place : depuis l'iPhone tu ouvres le cockpit, tu crées/valides des missions, et
**c'est le Mac qui exécute le travail** (Claude Code) — tu peux poser le téléphone, le Mac continue.

---

## 0. Vue d'ensemble (qui fait quoi)

| Étape | Sur quel appareil | Qui | Une fois ou à chaque fois |
|-------|-------------------|-----|---------------------------|
| Installer Tailscale | iPhone | toi | une fois |
| Installer Tailscale | Mac | toi (mot de passe Mac requis) | une fois |
| Se connecter (même compte Google) | les deux | toi | une fois |
| Lancer `pnpm mobile:up` | Mac | toi (ou un agent) | à chaque session |
| Ouvrir l'adresse dans Safari | iPhone | toi | à chaque session |

⚠️ **Règle d'or** : le **même compte** (Google `doudoupomme26@gmail.com`) sur les deux appareils.
C'est ce qui les met dans le même couloir privé.

---

## 1. Mac — installer Tailscale (une fois)

**Le plus simple, sans ligne de commande :**

1. Ouvre le **Mac App Store** → cherche **« Tailscale »** → **Obtenir / Installer**.
2. Ouvre l'app Tailscale → une icône apparaît dans la barre de menu (en haut à droite).
3. Clique l'icône → **Log in** → choisis **Google** → `doudoupomme26@gmail.com`.
4. Autorise si macOS demande (extension réseau).

> *Alternative ligne de commande* (si tu préfères, mot de passe Mac requis) :
> `brew install --cask tailscale-app` puis ouvrir l'app et se connecter comme ci-dessus.
> L'app gère le démon réseau et survit au redémarrage — c'est pour ça qu'on prend l'app
> plutôt que le binaire seul.

**Vérifier que c'est bon** (dans un terminal sur le Mac) :

```bash
tailscale status        # doit lister ton Mac + ton iPhone, sans erreur
```

Si `tailscale` n'est pas trouvé mais l'app est installée, le binaire est dans l'app :
`/Applications/Tailscale.app/Contents/MacOS/Tailscale`. Les scripts MAOS le détectent tout seuls.

---

## 2. iPhone — installer Tailscale (une fois)

1. **App Store** → **« Tailscale »** → installe (gratuit).
2. Ouvre → **Sign in** → **Google** → **le même compte** que le Mac.
3. Laisse Tailscale activé (bascule ON). C'est tout.

---

## 3. Lancer la télécommande (à chaque session, sur le Mac)

```bash
pnpm mobile:up
```

Ce que ça fait, dans l'ordre :
1. construit le cockpit en version rapide (1ʳᵉ fois seulement) ;
2. démarre le **moteur** (worker) ;
3. démarre le **cockpit** lié à l'**IP Tailscale** du Mac (`100.x`) — donc joignable par
   tes appareils du tailnet, mais **pas** par le Wi-Fi local ;
4. empêche le Mac de s'endormir tant que ça tourne (`caffeinate`) ;
5. **affiche l'adresse à ouvrir sur le téléphone.**

`Ctrl-C` dans ce terminal = tout couper proprement (cockpit, moteur).

---

## 4. iPhone — les liens à utiliser

L'adresse de base ressemble à `http://<nom-de-ton-mac>.<ton-tailnet>.ts.net:3000`
(la commande te donne l'adresse exacte ; l'IP `http://100.x.x.x:3000` marche toujours).

Ouvre-la dans **Safari** → **Partager** → **Sur l'écran d'accueil** : ça devient une « app ».

Pages directes du cockpit (ajoute le chemin après l'adresse de base) :

| Pour… | Chemin |
|-------|--------|
| Accueil / console Manager (chat + projets) | `/` |
| Missions (créer, suivre, valider) | `/missions` |
| Projets (enregistrer le projet deeplearning par son chemin) | `/projects` |
| Mémoire (second cerveau) | `/memory` |
| Idées | `/ideas` |
| Priorités | `/priorities` |
| Agents | `/agents` |
| Compétences (skills) | `/skills` |
| Studio | `/studio` |
| Jetons / budget | `/tokens` |
| Trace (suivi d'exécution) | `/trace` |

> **Piloter le travail depuis le téléphone :** va dans `/projects`, enregistre le projet
> (Mac : son chemin absolu), puis dans `/missions` crée une mission. Le Mac l'exécute ;
> tu valides les étapes risquées depuis le téléphone (§5).

---

## 5. Projet deeplearning — atteindre ses propres écrans depuis le téléphone

Le **même couloir** donne accès à *tous* les ports du Mac. Si ton projet deeplearning
expose un service web, tu le vois depuis l'iPhone à `http://<nom-de-ton-mac>.<tailnet>.ts.net:<port>`.

Exemples courants :

| Service | Port habituel | Lien iPhone |
|---------|---------------|-------------|
| TensorBoard | 6006 | `http://<mac>.<tailnet>.ts.net:6006` |
| Jupyter / notebook | 8888 | `http://<mac>.<tailnet>.ts.net:8888` |
| Dashboard d'entraînement maison | (au choix) | `http://<mac>.<tailnet>.ts.net:<port>` |

Pour que ça marche, lance le service en écoutant sur toutes les interfaces, p.ex. :

```bash
tensorboard --logdir runs --host 0.0.0.0 --port 6006
jupyter lab --ip 0.0.0.0 --port 8888
```

> Ces services restent privés : `0.0.0.0` les rend visibles sur le tailnet (tes appareils),
> et Tailscale chiffre tout le trajet. Sur un réseau public/partagé, préfère
> `tailscale serve --bg <port>` pour rester strictement tailnet + HTTPS.

---

## 6. Sécurité — à savoir (CLAUDE.md §5/§11)

- Le cockpit **n'a pas de login** : ne l'expose **jamais** via une URL publique (cloudflared/ngrok)
  sans ajouter une authentification. Tailscale = privé par construction, c'est pour ça qu'on le prend.
- `mobile:up` lie le cockpit à l'**IP Tailscale** du Mac (`100.x`) → il **n'écoute pas** sur le
  Wi-Fi local (`en0`/`192.168.x`). Seuls tes appareils du tailnet y accèdent.
- Les actions risquées (`rm`, `git push --force`, écriture `.env`, hors-sandbox projet, catégories
  `risk: high|blocking`) **restent bloquées et demandent ta validation**, même pilotées depuis le
  téléphone. La télécommande ne contourne aucune barrière.
- Déconnexion : `pnpm mobile:down` ferme le couloir ; quitter l'app Tailscale coupe tout accès.

---

## 7. Dépannage rapide

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| `Tailscale pas connecté` au lancement | pas loggé sur le Mac | ouvrir l'app Tailscale → Log in (Google) |
| Le téléphone n'ouvre pas l'adresse | Tailscale OFF sur l'iPhone, ou compte différent | activer Tailscale, vérifier **même compte Google** |
| Page blanche / erreur | cockpit pas encore prêt | attendre 10 s, recharger ; voir `/tmp/maos-web.log` |
| Le nom `.ts.net` ne résout pas | MagicDNS off / DNS du tel | utiliser l'IP : `http://100.x.x.x:3000` (toujours valide) |
| Adresse exacte ? | — | sur le Mac : `tailscale ip -4` (l'IP) ; le nom complet via `tailscale status` |
| Veux du HTTPS + URL sans port | option avancée | `tailscale serve --bg 3000` (nécessite HTTPS Certificates activé dans l'admin console) |

---

## 8. (Optionnel) Toujours allumé, même après redémarrage

`pnpm mobile:up` tient tant que le terminal est ouvert + le Mac allumé. Pour que ça reparte
tout seul après un redémarrage, on peut créer un *LaunchAgent* macOS (service au login).
À faire seulement si tu veux le mode always-on permanent — demande-le et on l'ajoute
(`~/Library/LaunchAgents/com.maos.mobile.plist`).
