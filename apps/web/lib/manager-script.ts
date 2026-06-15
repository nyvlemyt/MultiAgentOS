export type ManagerIntent = 'new-project' | 'idea' | 'status' | 'mission';

export type ManagerReply = {
  intent: ManagerIntent;
  text: string;
};

const RULES: ReadonlyArray<readonly [RegExp, ManagerIntent]> = [
  [/nouveau projet|new project|cr[ée]e? un projet|créer un projet/i, 'new-project'],
  [/id[ée]e|idea|et si on|on pourrait/i, 'idea'],
  [/[ée]tat|status|avancement|où en|ou en es|résume|resume/i, 'status'],
];

function classify(input: string): ManagerIntent {
  for (const [re, intent] of RULES) {
    if (re.test(input)) return intent;
  }
  return 'mission';
}

// Deterministic, LLM-free reply that NAMES what the orchestrator would do.
// The single seam where a real LLM call drops in later.
export function managerReply(input: string, project = 'OtakuGO_UP'): ManagerReply {
  const intent = classify(input);
  switch (intent) {
    case 'new-project':
      return { intent, text: `Compris. Je créerais un nouveau projet, détecterais sa stack, puis demanderais au Mission Planner de poser les premières missions. (démo — pas de LLM branché)` };
    case 'idea':
      return { intent, text: `Bien noté. J'enverrais cette idée dans l'inbox de ${project}, le Mission Planner la clarifierait et la prioriserait avant de l'intégrer au plan. (démo)` };
    case 'status':
      return { intent, text: `Sur ${project} : 5 missions en vol, 3 agents actifs, 1 validation en attente. Demande "détaille la mission X" pour creuser. (démo)` };
    default:
      return { intent, text: `Je routerais ça vers ${project} → Mission Planner décompose en tâches → Skill Router assigne les agents → tu valides avant exécution. (démo — pas de LLM branché)` };
  }
}
