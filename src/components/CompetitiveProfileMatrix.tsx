import React, { useState } from 'react';
import { Radar } from 'react-chartjs-2';

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
}

const CompetitiveProfileMatrix: React.FC<CompetitiveProfileMatrixProps> = ({ competitors, ksf }) => {
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);

  const calculateScore = (competitor: Competitor) => {
    return Object.entries(competitor.ratings).reduce((total, [ksfId, rating]) => {
      const factor = ksf.find(k => k.id === ksfId);
      return total + (factor ? factor.weight * rating : 0);
    }, 0);
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
      <h2 className="text-2xl font-bold mb-4">Competitive Profile Matrix</h2>
      
      {/* Competitor Selection */}
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
                    {comp.ratings[factor.id]?.toFixed(2) || '0.00'}
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
