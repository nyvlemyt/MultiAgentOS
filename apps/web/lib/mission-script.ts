export type MissionIntent = 'status' | 'report' | 'task' | 'mission';

export type MissionReply = {
  intent: MissionIntent;
  text: string;
};

const RULES: ReadonlyArray<readonly [RegExp, MissionIntent]> = [
  [/rapport|report|bilan|synth[èe]se/i, 'report'],
  [/[ée]tat|status|avancement|où en|ou en|progress/i, 'status'],
  [/t[âa]che|task|ajoute|dispatch|assigne/i, 'task'],
];

function classify(input: string): MissionIntent {
  for (const [re, intent] of RULES) {
    if (re.test(input)) return intent;
  }
  return 'mission';
}

// Deterministic, LLM-free reply for the mission chat. NAMES what the orchestrator
// would do on this mission. The single seam where a real per-mission LLM call drops
// in later (kind='mission').
export function missionReply(input: string, mission = 'cette mission'): MissionReply {
  const intent = classify(input);
  switch (intent) {
    case 'report':
      return { intent, text: `Je compilerais les rapports de tâche de « ${mission} » en un rapport final (what/why/how/tests + index des étapes). Utilise le bouton « Générer le rapport final ». (démo — pas de LLM branché)` };
    case 'status':
      return { intent, text: `Sur « ${mission} » : regarde l'index d'avancement ci-contre — chaque tâche, son agent, son statut et son rapport. (démo)` };
    case 'task':
      return { intent, text: `Je passerais ça au Mission Planner pour découper en tâches, puis au Skill Router pour assigner le bon agent à « ${mission} » — tu valides avant exécution. (démo)` };
    default:
      return { intent, text: `Je piloterais « ${mission} » : suivre les tâches, relancer les agents, produire le rapport final quand c'est prêt. (démo — pas de LLM branché)` };
  }
}
