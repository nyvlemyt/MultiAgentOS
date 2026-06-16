// Pure mission progress index. Given a mission's tasks and its reports, builds the
// "what is done, where, without re-reading everything" index the dashboard renders
// and a future LLM can ground on. No I/O — callers fetch tasks/reports and pass them.

export interface ProgressTask {
  id: string;
  title: string;
  agentId: string | null;
  status: string;
}

export interface ProgressReport {
  id: string;
  taskId: string | null;
  kind: 'task' | 'mission' | 'project';
}

export interface ProgressStep {
  taskId: string;
  title: string;
  agentId: string | null;
  status: string;
  reportId?: string;
}

export interface MissionProgress {
  done: number;
  total: number;
  steps: ProgressStep[];
}

export function missionProgress(tasks: ProgressTask[], reports: ProgressReport[]): MissionProgress {
  const reportByTask = new Map<string, string>();
  for (const r of reports) {
    if (r.kind === 'task' && r.taskId && !reportByTask.has(r.taskId)) {
      reportByTask.set(r.taskId, r.id);
    }
  }

  const steps: ProgressStep[] = tasks.map((t) => {
    const reportId = reportByTask.get(t.id);
    return { taskId: t.id, title: t.title, agentId: t.agentId, status: t.status, ...(reportId ? { reportId } : {}) };
  });

  return {
    done: tasks.filter((t) => t.status === 'done').length,
    total: tasks.length,
    steps,
  };
}
