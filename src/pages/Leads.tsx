import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { LeadFilters } from '@/components/leads/LeadFilters';
import { LeadFormDialog } from '@/components/leads/LeadFormDialog';
import { useLeads, LeadFilters as LeadFiltersType } from '@/hooks/useLeads';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload } from 'lucide-react';

const Leads = () => {
  const [filters, setFilters] = useState<LeadFiltersType>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: leads, isLoading } = useLeads(filters);

  const handleExportCSV = () => {
    if (!leads || leads.length === 0) return;

    const headers = ['Name', 'Email', 'Mobile', 'Source', 'Status', 'Event', 'Created At'];
    const rows = leads.map((lead) => [
      lead.name,
      lead.email,
      lead.mobile || '',
      lead.source,
      lead.status,
      lead.event?.name || '',
      new Date(lead.created_at).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Leads"
        description="Manage and track all your leads in one place."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button size="sm" onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
        }
      />

      <LeadFilters filters={filters} onFiltersChange={setFilters} />

      <LeadsTable leads={leads || []} isLoading={isLoading} />

      <LeadFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  );
};

export default Leads;
