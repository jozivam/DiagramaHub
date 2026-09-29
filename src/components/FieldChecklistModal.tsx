import React, { useState } from 'react';
import { 
  CheckSquare, Square, Wrench, Plus, UserCheck, Calendar, 
  ExternalLink, CheckCircle2, Clock, Trash2
} from 'lucide-react';
import { FieldChecklistItem } from '../types/diagram';

interface FieldChecklistModalProps {
  items: FieldChecklistItem[];
  onToggleComplete: (id: string) => void;
  onAddItem: (item: Omit<FieldChecklistItem, 'id' | 'completed'>) => void;
  onNavigateToPage: (pageNumber: number, tagCode: string) => void;
  onDeleteItem: (id: string) => void;
}

export const FieldChecklistModal: React.FC<FieldChecklistModalProps> = ({
  items,
  onToggleComplete,
  onAddItem,
  onNavigateToPage,
  onDeleteItem
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newPage, setNewPage] = useState<number>(19);
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'CONTINUIDADE' | 'APERTO_BORNE' | 'ISOLAMENTO' | 'IDENTIFICACAO'>('APERTO_BORNE');
  const [newTech, setNewTech] = useState('Eletricista de Manutenção');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag || !newDesc) return;

    onAddItem({
      tagCode: newTag.trim().toUpperCase(),
      pageNumber: newPage,
      description: newDesc.trim(),
      category: newCategory,
      technician: newTech.trim(),
      timestamp: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });

    setNewTag('');
    setNewDesc('');
    setShowAddForm(false);
  };

  const completedCount = items.filter((i) => i.completed).length;

  return (
    <div className="flex-1 bg-slate-950 p-4 sm:p-6 overflow-y-auto text-slate-200">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Wrench className="w-4 h-4" />
              <span>Manutenção Industrial & Comissionamento</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Check-list de Campo & Ordens de Serviço (OS)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Validação física de bornes, torqueamento, teste de continuidade e conferência de instrumentos em campo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Apontamento</span>
            </button>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Status do Comissionamento de Campo</div>
              <div className="text-[11px] text-slate-400">
                {completedCount} de {items.length} itens inspecionados ({items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0}%)
              </div>
            </div>
          </div>

          <div className="w-full sm:w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{
                width: `${items.length > 0 ? (completedCount / items.length) * 100 : 0}%`
              }}
            />
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900 border border-cyan-800/80 rounded-xl p-4 space-y-3 animate-in fade-in"
          >
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              Cadastrar Novo Item de Verificação de Campo
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Tag do Equipamento/Cabo:</label>
                <input
                  type="text"
                  required
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Ex: Z3M03M1"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Página do Diagrama:</label>
                <input
                  type="number"
                  min={1}
                  max={337}
                  value={newPage}
                  onChange={(e) => setNewPage(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-cyan-300"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Categoria do Teste:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                >
                  <option value="APERTO_BORNE">Aperto e Torque de Borne</option>
                  <option value="CONTINUIDADE">Teste de Continuidade</option>
                  <option value="ISOLAMENTO">Megômetro / Isolamento</option>
                  <option value="IDENTIFICACAO">Conferência de Anilhas</option>
                </select>
              </div>
            </div>

            <div className="text-xs">
              <label className="text-slate-400 block mb-1">Descrição do Ponto de Inspeção:</label>
              <input
                type="text"
                required
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Ex: Conferir aperto da régua X1 bornes 1 a 6 e continuidade do cabo"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
              />
            </div>

            <div className="flex justify-end gap-2 text-xs pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
              >
                Salvar Item
              </button>
            </div>
          </form>
        )}

        {/* List of Checklist Items */}
        <div className="space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                item.completed
                  ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                  : 'bg-slate-900 border-slate-700/80 text-slate-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggleComplete(item.id)}
                  className="mt-0.5 text-cyan-400 hover:text-cyan-300 transition-transform active:scale-95"
                >
                  {item.completed ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-500" />
                  )}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm">
                      {item.tagCode}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {item.category}
                    </span>
                  </div>

                  <p className={`text-xs mt-1 leading-snug ${item.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                    {item.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    {item.technician && (
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        {item.technician}
                      </span>
                    )}
                    {item.timestamp && (
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {item.timestamp}
                      </span>
                    )}
                    {item.notes && (
                      <span className="text-amber-400">Obs: {item.notes}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  onClick={() => onNavigateToPage(item.pageNumber, item.tagCode)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-cyan-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
                >
                  <span>Pág {item.pageNumber}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Excluir item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
