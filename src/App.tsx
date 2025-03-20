import React, { useState, useEffect } from 'react';
import { BarChart3, FileSpreadsheet, Layout, PlusCircle, Save, Trash2, ListChecks, Target } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

type Factor = {
  id: string;
  description: string;
  weight: number;
  rating: number;
};

type SwotItem = {
  id: string;
  description: string;
};

type KsfItem = {
  id: string;
  description: string;
  target: string;
  measure: string;
};

function App() {
  const [activeTab, setActiveTab] = useState<'ife' | 'efe' | 'swot' | 'ksf'>('swot');
  const [ifeFactors, setIfeFactors] = useState<Factor[]>([]);
  const [efeFactors, setEfeFactors] = useState<Factor[]>([]);
  const [strengths, setStrengths] = useState<SwotItem[]>([]);
  const [weaknesses, setWeaknesses] = useState<SwotItem[]>([]);
  const [opportunities, setOpportunities] = useState<SwotItem[]>([]);
  const [threats, setThreats] = useState<SwotItem[]>([]);
  const [ksfItems, setKsfItems] = useState<KsfItem[]>([]);

  const addFactor = (type: 'ife' | 'efe') => {
    const newFactor: Factor = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      weight: 0,
      rating: 1
    };
    
    if (type === 'ife') {
      setIfeFactors([...ifeFactors, newFactor]);
    } else {
      setEfeFactors([...efeFactors, newFactor]);
    }
  };

  const addSwotItem = (type: 'strengths' | 'weaknesses' | 'opportunities' | 'threats') => {
    const newItem: SwotItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: ''
    };

    switch (type) {
      case 'strengths':
        setStrengths([...strengths, newItem]);
        break;
      case 'weaknesses':
        setWeaknesses([...weaknesses, newItem]);
        break;
      case 'opportunities':
        setOpportunities([...opportunities, newItem]);
        break;
      case 'threats':
        setThreats([...threats, newItem]);
        break;
    }
  };

  const addKsfItem = () => {
    const newItem: KsfItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      target: '',
      measure: ''
    };
    setKsfItems([...ksfItems, newItem]);
  };

  const updateFactor = (type: 'ife' | 'efe', id: string, field: keyof Factor, value: string | number) => {
    const factors = type === 'ife' ? ifeFactors : efeFactors;
    const setFactors = type === 'ife' ? setIfeFactors : setEfeFactors;
    
    setFactors(
      factors.map(factor => 
        factor.id === id ? { ...factor, [field]: value } : factor
      )
    );
  };

  const updateSwotItem = (
    type: 'strengths' | 'weaknesses' | 'opportunities' | 'threats',
    id: string,
    description: string
  ) => {
    const setItems = {
      strengths: setStrengths,
      weaknesses: setWeaknesses,
      opportunities: setOpportunities,
      threats: setThreats
    }[type];

    const items = {
      strengths,
      weaknesses,
      opportunities,
      threats
    }[type];

    setItems(items.map(item => 
      item.id === id ? { ...item, description } : item
    ));
  };

  const updateKsfItem = (id: string, field: keyof KsfItem, value: string) => {
    setKsfItems(ksfItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const deleteFactor = (type: 'ife' | 'efe', id: string) => {
    const setFactors = type === 'ife' ? setIfeFactors : setEfeFactors;
    setFactors(prev => prev.filter(factor => factor.id !== id));
  };

  const deleteSwotItem = (
    type: 'strengths' | 'weaknesses' | 'opportunities' | 'threats',
    id: string
  ) => {
    const setItems = {
      strengths: setStrengths,
      weaknesses: setWeaknesses,
      opportunities: setOpportunities,
      threats: setThreats
    }[type];

    setItems(prev => prev.filter(item => item.id !== id));
  };

  const deleteKsfItem = (id: string) => {
    setKsfItems(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotal = (factors: Factor[]) => {
    return factors.reduce((sum, factor) => sum + (factor.weight * factor.rating), 0);
  };

  const getMatrixRadarData = (factors: Factor[]) => {
    return {
      labels: factors.map(f => f.description || 'Unnamed Factor'),
      datasets: [
        {
          label: 'Weighted Score',
          data: factors.map(f => f.weight * f.rating),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          fill: true,
        },
        {
          label: 'Weight',
          data: factors.map(f => f.weight),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          fill: true,
        },
        {
          label: 'Rating',
          data: factors.map(f => f.rating),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          fill: true,
        },
      ],
    };
  };

  const getSwotChartData = () => {
    return {
      labels: ['Strengths', 'Weaknesses', 'Opportunities', 'Threats'],
      datasets: [
        {
          label: 'Number of Items',
          data: [
            strengths.length,
            weaknesses.length,
            opportunities.length,
            threats.length,
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const getKsfRadarData = () => {
    return {
      labels: ksfItems.map(item => item.description || 'Unnamed KSF'),
      datasets: [
        {
          label: 'Target Achievement',
          data: ksfItems.map(() => Math.random() * 100), // Simulated progress data
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
        },
      ],
    };
  };

  const renderMatrixTab = (type: 'ife' | 'efe') => (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {type === 'ife' ? 'Internal Factors' : 'External Factors'}
        </h2>
        <button
          onClick={() => addFactor(type)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Factor
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight (0-1)
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating (1-4)
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 bg-gray-50"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(type === 'ife' ? ifeFactors : efeFactors).map((factor) => (
                <tr key={factor.id}>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={factor.description}
                      onChange={(e) => updateFactor(type, factor.id, 'description', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter factor description"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={factor.weight}
                      onChange={(e) => updateFactor(type, factor.id, 'weight', parseFloat(e.target.value))}
                      min="0"
                      max="1"
                      step="0.01"
                      className="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={factor.rating}
                      onChange={(e) => updateFactor(type, factor.id, 'rating', parseInt(e.target.value))}
                      className="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value={1}>1 - Poor</option>
                      <option value={2}>2 - Fair</option>
                      <option value={3}>3 - Good</option>
                      <option value={4}>4 - Superior</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {(factor.weight * factor.rating).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteFactor(type, factor.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="px-6 py-4 font-medium">Total</td>
                <td className="px-6 py-4">
                  {(type === 'ife' ? ifeFactors : efeFactors)
                    .reduce((sum, factor) => sum + factor.weight, 0)
                    .toFixed(2)}
                </td>
                <td></td>
                <td className="px-6 py-4 font-medium">
                  {calculateTotal(type === 'ife' ? ifeFactors : efeFactors).toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Factor Analysis</h3>
          <Radar
            data={getMatrixRadarData(type === 'ife' ? ifeFactors : efeFactors)}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: `${type.toUpperCase()} Matrix Analysis`,
                },
              },
              scales: {
                r: {
                  beginAtZero: true,
                  max: 4,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderSwotTab = () => (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Strengths', type: 'strengths' as const, items: strengths },
              { title: 'Weaknesses', type: 'weaknesses' as const, items: weaknesses },
              { title: 'Opportunities', type: 'opportunities' as const, items: opportunities },
              { title: 'Threats', type: 'threats' as const, items: threats }
            ].map(({ title, type, items }) => (
              <div key={type} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                  <button
                    onClick={() => addSwotItem(type)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add
                  </button>
                </div>
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateSwotItem(type, item.id, e.target.value)}
                        className="block flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder={`Enter ${title.toLowerCase().slice(0, -1)}`}
                      />
                      <button
                        onClick={() => deleteSwotItem(type, item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">SWOT Analysis Overview</h3>
          <Bar
            data={getSwotChartData()}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'SWOT Distribution',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderKsfTab = () => (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Key Success Factors</h2>
            <button
              onClick={addKsfItem}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add KSF
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Factor
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Measure
                  </th>
                  <th className="px-6 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ksfItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateKsfItem(item.id, 'description', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter success factor"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={item.target}
                        onChange={(e) => updateKsfItem(item.id, 'target', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter target"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={item.measure}
                        onChange={(e) => updateKsfItem(item.id, 'measure', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter measure"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteKsfItem(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">KSF Progress Radar</h3>
          <Radar
            data={getKsfRadarData()}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'KSF Achievement Radar',
                },
              },
              scales: {
                r: {
                  beginAtZero: true,
                  max: 100,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Strategic Framework</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('swot')}
                className={`${
                  activeTab === 'swot'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex-1 py-4 px-1 text-center border-b-2 font-medium flex items-center justify-center`}
              >
                <Layout className="h-4 w-4 mr-2" />
                SWOT Analysis
              </button>
              <button
                onClick={() => setActiveTab('ksf')}
                className={`${
                  activeTab === 'ksf'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex-1 py-4 px-1 text-center border-b-2 font-medium flex items-center justify-center`}
              >
                <Target className="h-4 w-4 mr-2" />
                Key Success Factors
              </button>
              <button
                onClick={() => setActiveTab('ife')}
                className={`${
                  activeTab === 'ife'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex-1 py-4 px-1 text-center border-b-2 font-medium flex items-center justify-center`}
              >
                <ListChecks className="h-4 w-4 mr-2" />
                IFE Matrix
              </button>
              <button
                onClick={() => setActiveTab('efe')}
                className={`${
                  activeTab === 'efe'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex-1 py-4 px-1 text-center border-b-2 font-medium flex items-center justify-center`}
              >
                <ListChecks className="h-4 w-4 mr-2" />
                EFE Matrix
              </button>
            </nav>
          </div>

          {activeTab === 'swot' && renderSwotTab()}
          {activeTab === 'ksf' && renderKsfTab()}
          {(activeTab === 'ife' || activeTab === 'efe') && renderMatrixTab(activeTab)}

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end space-x-4">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Save Analysis
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;