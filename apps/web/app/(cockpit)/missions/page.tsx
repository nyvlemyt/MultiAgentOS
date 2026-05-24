import { kanbanColumns } from '@/lib/fixtures';
import { KanbanColumn } from '@/components/KanbanColumn';
import { MissionCard } from '@/components/MissionCard';

export default function MissionsBoard() {
  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Missions</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>FSM-driven kanban · drag-and-drop wires up in Phase 1</p>
        </div>
      </header>
      <div className="flex flex-1 gap-3 overflow-x-auto pb-4">
        {kanbanColumns.map((c) => (
          <KanbanColumn key={c.key} title={c.title} count={c.missions.length}>
            {c.missions.map((m) => m && <MissionCard key={m.id} m={m} />)}
          </KanbanColumn>
        ))}
      </div>
    </div>
  );
}
