import { Lead, LeadStatus } from '@/types/database';
import { LeadCard } from './LeadCard';
import { useUpdateLeadStatus } from '@/hooks/useLeads';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface KanbanBoardProps {
  leads: Lead[];
}

const columns: { status: LeadStatus; label: string; color: string }[] = [
  { status: 'new', label: 'New', color: 'bg-info' },
  { status: 'contacted', label: 'Contacted', color: 'bg-purple-500' },
  { status: 'qualified', label: 'Qualified', color: 'bg-warning' },
  { status: 'registered', label: 'Registered', color: 'bg-accent' },
  { status: 'won', label: 'Won', color: 'bg-success' },
  { status: 'lost', label: 'Lost', color: 'bg-destructive' },
];

export const KanbanBoard = ({ leads }: KanbanBoardProps) => {
  const updateStatus = useUpdateLeadStatus();
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);

  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter((lead) => lead.status === status);
  };

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedLead && draggedLead.status !== status) {
      await updateStatus.mutateAsync({ id: draggedLead.id, status });
    }
    setDraggedLead(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnLeads = getLeadsByStatus(column.status);
        const isOver = dragOverColumn === column.status;

        return (
          <div
            key={column.status}
            className={cn(
              'kanban-column min-w-[280px] w-[280px] transition-all duration-200',
              isOver && 'ring-2 ring-primary ring-offset-2'
            )}
            onDragOver={(e) => handleDragOver(e, column.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className={cn('w-3 h-3 rounded-full', column.color)} />
              <h3 className="font-medium text-foreground">{column.label}</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {columnLeads.length}
              </span>
            </div>

            <div className="space-y-3">
              {columnLeads.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead)}
                  className={cn(
                    'transition-opacity',
                    draggedLead?.id === lead.id && 'opacity-50'
                  )}
                >
                  <LeadCard lead={lead} draggable />
                </div>
              ))}

              {columnLeads.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No leads
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
