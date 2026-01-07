import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Lead, KANBAN_COLUMNS, KanbanStatus } from '@/types/crm';
import { mockLeads } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Phone, Mail, MessageSquare, Clock, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function LeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="p-3 bg-card rounded-lg border shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm truncate">{lead.name}</h4>
        {lead.utmSource && (
          <Badge variant="secondary" className="text-[10px] ml-2 shrink-0">
            {lead.utmSource}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Phone className="h-3 w-3" />
        <span>{lead.phone}</span>
      </div>
      {lead.notes && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{lead.notes}</p>
      )}
      <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
        <Clock className="h-3 w-3" />
        {format(new Date(lead.createdAt), "dd MMM", { locale: ptBR })}
      </div>
    </div>
  );
}

function KanbanColumn({ 
  column, 
  leads, 
  onLeadClick 
}: { 
  column: typeof KANBAN_COLUMNS[0]; 
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}) {
  return (
    <div className="flex flex-col min-w-[280px] max-w-[280px] h-full">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-3 h-3 rounded-full ${column.color}`} />
        <h3 className="font-semibold text-sm">{column.label}</h3>
        <Badge variant="secondary" className="ml-auto">
          {leads.length}
        </Badge>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 p-1 bg-muted/30 rounded-lg min-h-[200px]">
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              onClick={() => onLeadClick(lead)} 
            />
          ))}
        </SortableContext>
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
            Nenhum lead
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [leads, setLeads] = useState<Lead[]>(() => 
    isAdmin ? mockLeads : mockLeads.filter(l => l.assignedUserId === user?.id)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const filteredLeads = leads.filter(
    lead =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeLeadId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const targetColumn = KANBAN_COLUMNS.find(col => col.id === overId);
    if (targetColumn) {
      setLeads(prev =>
        prev.map(lead =>
          lead.id === activeLeadId ? { ...lead, status: targetColumn.id } : lead
        )
      );
      return;
    }

    // Check if dropped on another lead
    const overLead = leads.find(l => l.id === overId);
    if (overLead) {
      setLeads(prev =>
        prev.map(lead =>
          lead.id === activeLeadId ? { ...lead, status: overLead.status } : lead
        )
      );
    }
  };

  const updateLeadNotes = (notes: string) => {
    if (!selectedLead) return;
    setLeads(prev =>
      prev.map(lead =>
        lead.id === selectedLead.id ? { ...lead, notes } : lead
      )
    );
    setSelectedLead(prev => prev ? { ...prev, notes } : null);
  };

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{isAdmin ? 'Todos os Leads' : 'Meus Leads'}</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie seus leads no funil de vendas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar lead..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 min-h-[500px]">
            {KANBAN_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                leads={filteredLeads.filter(l => l.status === column.id)}
                onLeadClick={setSelectedLead}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeLead && (
            <div className="p-3 bg-card rounded-lg border shadow-lg">
              <h4 className="font-medium text-sm">{activeLead.name}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{activeLead.phone}</span>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedLead?.name}</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={KANBAN_COLUMNS.find(c => c.id === selectedLead.status)?.color}>
                  {KANBAN_COLUMNS.find(c => c.id === selectedLead.status)?.label}
                </Badge>
                {selectedLead.utmSource && (
                  <Badge variant="outline">{selectedLead.utmSource}</Badge>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${selectedLead.phone}`} className="hover:underline">
                    {selectedLead.phone}
                  </a>
                </div>
                {selectedLead.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedLead.email}`} className="hover:underline">
                      {selectedLead.email}
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <Textarea
                  value={selectedLead.notes}
                  onChange={(e) => updateLeadNotes(e.target.value)}
                  placeholder="Adicione observações sobre este lead..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Enviar WhatsApp
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Phone className="h-4 w-4" />
                  Ligar
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                Criado em {format(new Date(selectedLead.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
