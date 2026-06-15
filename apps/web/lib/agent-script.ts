// Scripted, deterministic in-character reply for a project agent instance.
// The single seam where a real per-agent LLM call drops in later (kind='agent').

type Role =
  | 'planner' | 'router' | 'memory' | 'security' | 'reviewer'
  | 'frontend' | 'ux' | 'backend' | 'reality' | 'generic';

const ROLE_RULES: ReadonlyArray<readonly [RegExp, Role]> = [
  [/planner|plan/i, 'planner'],
  [/router|route/i, 'router'],
  [/memory|context/i, 'memory'],
  [/sec|security/i, 'security'],
  [/review/i, 'reviewer'],
  [/frontend|front/i, 'frontend'],
  [/ux|design/i, 'ux'],
  [/backend|architect/i, 'backend'],
  [/reality|test|check/i, 'reality'],
];

function roleOf(idOrName: string): Role {
  for (const [re, role] of ROLE_RULES) {
    if (re.test(idOrName)) return role;
  }
  return 'generic';
}

const LINES: Record<Role, string> = {
  planner: 'Je décompose la demande en tâches et propose un plan. Valide-le et je dispatche aux agents. (démo)',
  router: 'Je choisis les skills et le modèle adaptés à chaque tâche, puis j\'assigne le bon agent. (démo)',
  memory: 'Je remonte le contexte pertinent du projet sans tout recharger — dis-moi ce que tu cherches. (démo)',
  security: 'Je vérifie les actions risquées avant exécution ; rien de bloquant ne passe sans ton clic. (démo)',
  reviewer: 'Je relis le diff produit et signale les problèmes avant merge. (démo)',
  frontend: 'Je câble le composant et te montre le diff à valider. (démo)',
  ux: 'Je propose la maquette/structure avant que le frontend code. (démo)',
  backend: 'Je conçois l\'API/le schéma et te soumets le plan technique. (démo)',
  reality: 'Je teste le résultat et certifie (ou non) qu\'il est prêt. (démo)',
  generic: 'Je traite ta demande sur ce projet et te rends le résultat à valider. (démo)',
};

export function agentReply(agentIdOrName: string, _input: string): string {
  return LINES[roleOf(agentIdOrName)];
}
