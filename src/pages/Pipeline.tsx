import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { KanbanBoard } from '@/components/leads/KanbanBoard';
import { LeadFormDialog } from '@/components/leads/LeadFormDialog';
import { useLeads } from '@/hooks/useLeads';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

const Pipeline = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: leads, isLoading } = useLeads();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Pipeline"
        description="Drag and drop leads between stages to update their status."
        actions={
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <KanbanBoard leads={leads || []} />
      )}

      <LeadFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  );
};

export default Pipeline;
