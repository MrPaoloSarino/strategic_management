import React, { useState } from 'react';
import { Radar } from 'react-chartjs-2';
import { PlusCircle, Trash2, Save } from 'lucide-react';

interface Competitor {
  id: string;
  name: string;
  ratings: { [key: string]: number };
}

interface KSF {
  id: string;
  name: string;
  weight: number;
}

interface CompetitiveProfileMatrixProps {
  competitors: Competitor[];
  ksf: KSF[];
  onUpdateCompetitors: (competitors: Competitor[]) => void;
}

const CompetitiveProfileMatrix: React.FC<CompetitiveProfileMatrixProps> = ({ 
  competitors, 
  ksf,
  onUpdateCompetitors 
}) => {
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [newCompetitorName, setNewCompetitorName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const calculateScore = (competitor: Competitor) => {
    return Object.entries(competitor.ratings).reduce((total, [ksfId, rating]) => {
      const factor = ksf.find(k => k.id === ksfId);
      return total + (factor ? factor.weight * rating : 0);
    }, 0);
  };

  const addCompetitor = () => {
    if (newCompetitorName.trim()) {
      const newCompetitor: Competitor = {
        id: Date.now().toString(),
        name: newCompetitorName.trim(),
        ratings: {}
      };
      onUpdateCompetitors([...competitors, newCompetitor]);
      setNewCompetitorName('');
    }
  };

  const updateCompetitorName = (id: string, newName: string) => {
    const updatedCompetitors = competitors.map(comp =>
      comp.id === id ? { ...comp, name: newName } : comp
    );
    onUpdateCompetitors(updatedCompetitors);
    setEditingId(null);
  };

  const deleteCompetitor = (id: string) => {
    onUpdateCompetitors(competitors.filter(comp => comp.id !== id));
    setSelectedCompetitors(prev => prev.filter(compId => compId !== id));
  };

  const updateRating = (competitorId: string, ksfId: string, rating: number) => {
    const updatedCompetitors = competitors.map(comp =>
      comp.id === competitorId
        ? {
            ...comp,
            ratings: {
              ...comp.ratings,
              [ksfId]: Math.max(0, Math.min(4, rating)) // Ensure rating is between 0 and 4
            }
          }
        : comp
    );
    onUpdateCompetitors(updatedCompetitors);
  };

  const chartData = {
    labels: ksf.map(factor => factor.name),
    datasets: competitors
      .filter(comp => selectedCompetitors.includes(comp.id))
      .map((competitor, index) => ({
        label: competitor.name,
        data: ksf.map(factor => competitor.ratings[factor.id] || 0),
        backgroundColor: `rgba(${index * 50}, 99, 132, 0.2)`,
        borderColor: `rgba(${index * 50}, 99, 132, 1)`,
        borderWidth: 1,
      })),
  };

  const chartOptions = {
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 4,
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Competitive Profile Matrix',
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Manage Competitors</h3>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={newCompetitorName}
            onChange={(e) => setNewCompetitorName(e.target.value)}
            placeholder="Enter competitor name"
            className="px-3 py-2 border rounded"
          />
          <button
            onClick={addCompetitor}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-2">
          {competitors.map(competitor => (
            <div key={competitor.id} className="flex items-center gap-2">
              {editingId === competitor.id ? (
                <input
                  type="text"
                  value={competitor.name}
                  onChange={(e) => updateCompetitorName(competitor.id, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  autoFocus
                  className="px-3 py-2 border rounded"
                />
              ) : (
                <span
                  onClick={() => setEditingId(competitor.id)}
                  className="cursor-pointer hover:text-blue-500"
                >
                  {competitor.name}
                </span>
              )}
              <button
                onClick={() => deleteCompetitor(competitor.id)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Competitor Selection for Chart */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Select Competitors to Compare</h3>
        <div className="flex flex-wrap gap-2">
          {competitors.map(competitor => (
            <button
              key={competitor.id}
              onClick={() => setSelectedCompetitors(prev =>
                prev.includes(competitor.id)
                  ? prev.filter(id => id !== competitor.id)
                  : [...prev, competitor.id]
              )}
              className={`px-4 py-2 rounded ${
                selectedCompetitors.includes(competitor.id)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {competitor.name}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Critical Success Factors</th>
              <th className="border p-2">Weight</th>
              {competitors.map(comp => (
                <th key={comp.id} className="border p-2">{comp.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ksf.map(factor => (
              <tr key={factor.id}>
                <td className="border p-2">{factor.name}</td>
                <td className="border p-2">{factor.weight.toFixed(2)}</td>
                {competitors.map(comp => (
                  <td key={comp.id} className="border p-2">
                    <input
                      type="number"
                      min="0"
                      max="4"
                      step="0.1"
                      value={comp.ratings[factor.id] || 0}
                      onChange={(e) => updateRating(comp.id, factor.id, parseFloat(e.target.value))}
                      className="w-20 px-2 py-1 border rounded"
                    />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold">
              <td className="border p-2">Total Score</td>
              <td className="border p-2">1.00</td>
              {competitors.map(comp => (
                <td key={comp.id} className="border p-2">
                  {calculateScore(comp).toFixed(2)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Radar Chart */}
      <div className="w-full h-[400px]">
        <Radar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default CompetitiveProfileMatrix;
