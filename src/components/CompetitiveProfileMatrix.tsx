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
        backgroundColor: `rgba(${(index * 50) % 255}, ${(99 + index * 40) % 255}, ${(132 + index * 30) % 255}, 0.2)`,
        borderColor: `rgba(${(index * 50) % 255}, ${(99 + index * 40) % 255}, ${(132 + index * 30) % 255}, 1)`,
        borderWidth: 1,
        pointRadius: 4,
      })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 4,
        ticks: {
          stepSize: 1,
          backdropColor: 'rgba(0, 0, 0, 0)'
        }
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
              <span className="ml-2 text-sm text-gray-600">
                Score: {calculateScore(competitor).toFixed(2)}
              </span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <h3 className="text-lg font-semibold mb-2">Competitive Profile Matrix</h3>
          <table className="w-full table-fixed border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left w-1/4" rowSpan={2}>Key Success Factors</th>
                <th className="border p-2 text-center w-1/6" rowSpan={2}>Industry Weight</th>
                {competitors.map(comp => (
                  <th key={comp.id} className="border p-2 text-center bg-blue-50" colSpan={2}>
                    {comp.name}
                  </th>
                ))}
              </tr>
              <tr className="bg-gray-100">
                {competitors.map(comp => (
                  <React.Fragment key={comp.id}>
                    <th className="border p-2 text-center bg-gray-50 w-1/12">Rating</th>
                    <th className="border p-2 text-center bg-blue-50 w-1/12">Score</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {ksf.map((factor, index) => (
                <tr key={factor.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border p-2">{factor.name}</td>
                  <td className="border p-2 text-center">{factor.weight.toFixed(2)}</td>
                  {competitors.map(comp => (
                    <React.Fragment key={comp.id}>
                      <td className="border p-2 text-center">
                        <input
                          type="number"
                          value={comp.ratings[factor.id] || 0}
                          onChange={(e) => updateRating(comp.id, factor.id, parseInt(e.target.value))}
                          min="0"
                          max="4"
                          className="w-16 px-2 py-1 border rounded text-center"
                        />
                      </td>
                      <td className="border p-2 text-center font-medium">
                        {(factor.weight * (comp.ratings[factor.id] || 0)).toFixed(2)}
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-blue-100 font-semibold">
                <td className="border p-2">Total</td>
                <td className="border p-2 text-center">{ksf.reduce((sum, factor) => sum + factor.weight, 0).toFixed(2)}</td>
                {competitors.map(comp => (
                  <React.Fragment key={comp.id}>
                    <td className="border p-2 text-center">-</td>
                    <td className="border p-2 text-center">{calculateScore(comp).toFixed(2)}</td>
                  </React.Fragment>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Radar Chart */}
        <div className="border p-4 rounded-lg bg-white">
          <h3 className="text-lg font-semibold mb-2">Competitive Radar Chart</h3>
          {selectedCompetitors.length > 0 ? (
            <div className="w-full h-[350px]">
              <Radar data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="w-full h-[350px] flex items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-500">Select competitors to display the radar chart</p>
            </div>
          )}
          
          {/* Tabular Radar Data */}
          {selectedCompetitors.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full table-fixed border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Key Success Factor</th>
                    {competitors
                      .filter(comp => selectedCompetitors.includes(comp.id))
                      .map(comp => (
                        <th key={comp.id} className="border p-2 text-center">{comp.name}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {ksf.map((factor, index) => (
                    <tr key={factor.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border p-2">{factor.name}</td>
                      {competitors
                        .filter(comp => selectedCompetitors.includes(comp.id))
                        .map(comp => (
                          <td key={comp.id} className="border p-2 text-center">
                            {comp.ratings[factor.id] || 0}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitiveProfileMatrix;
