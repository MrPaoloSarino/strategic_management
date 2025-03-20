/** @jsxImportSource react */
import React, { useState, useEffect, ChangeEvent } from 'react';
import { FileSpreadsheet, Layout, PlusCircle, Save, Trash2, ListChecks, Target, Download, Upload } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';
import { supabase } from './lib/supabase';
import { saveToFile, loadFromFile, autoSave, hasActiveFile } from './lib/fileSystem';
import CompetitiveProfileMatrix from './components/CompetitiveProfileMatrix';

// Register ChartJS components
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

// Define interfaces for data types
interface Factor {
  id: string;
  description: string;
  weight: number;
  rating: number;
}

interface SwotItem {
  id: string;
  description: string;
}

interface KsfItem {
  id: string;
  description: string;
  target: string;
  measure: string;
  weight: number;
  performance: number;
}

interface Competitor {
  id: string;
  name: string;
  ratings: { [key: string]: number };
}

interface StrategicData {
  swot: {
    strengths: SwotItem[];
    weaknesses: SwotItem[];
    opportunities: SwotItem[];
    threats: SwotItem[];
  };
  matrices: {
    ife: Factor[];
    efe: Factor[];
  };
  ksf: KsfItem[];
  competitors: Competitor[];
}

declare namespace JSX {
  interface IntrinsicElements {
    div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
    input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    label: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
    h2: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h3: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
    span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
    table: React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
    thead: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
    tbody: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
    tr: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
    th: React.DetailedHTMLProps<React.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
    td: React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState<'swot' | 'ife' | 'efe' | 'ksf' | 'cpm'>('swot');
  const [ifeFactors, setIfeFactors] = useState<Factor[]>([]);
  const [efeFactors, setEfeFactors] = useState<Factor[]>([]);
  const [strengths, setStrengths] = useState<SwotItem[]>([]);
  const [weaknesses, setWeaknesses] = useState<SwotItem[]>([]);
  const [opportunities, setOpportunities] = useState<SwotItem[]>([]);
  const [threats, setThreats] = useState<SwotItem[]>([]);
  const [ksfItems, setKsfItems] = useState<KsfItem[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([
    { id: '1', name: 'Our Company', ratings: {} },
    { id: '2', name: 'Competitor 1', ratings: {} },
    { id: '3', name: 'Competitor 2', ratings: {} },
  ]);

  // Load data from Supabase on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load SWOT data
        const { data: swotData } = await supabase
          .from('strategic_data')
          .select('*')
          .single();
        
        if (swotData) {
          setStrengths(swotData.strengths || []);
          setWeaknesses(swotData.weaknesses || []);
          setOpportunities(swotData.opportunities || []);
          setThreats(swotData.threats || []);
          setIfeFactors(swotData.ife_factors || []);
          setEfeFactors(swotData.efe_factors || []);
          setKsfItems(swotData.ksf_items || []);
          setCompetitors(swotData.competitors || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('ifeFactors', JSON.stringify(ifeFactors));
  }, [ifeFactors]);

  useEffect(() => {
    localStorage.setItem('efeFactors', JSON.stringify(efeFactors));
  }, [efeFactors]);

  useEffect(() => {
    localStorage.setItem('strengths', JSON.stringify(strengths));
  }, [strengths]);

  useEffect(() => {
    localStorage.setItem('weaknesses', JSON.stringify(weaknesses));
  }, [weaknesses]);

  useEffect(() => {
    localStorage.setItem('opportunities', JSON.stringify(opportunities));
  }, [opportunities]);

  useEffect(() => {
    localStorage.setItem('threats', JSON.stringify(threats));
  }, [threats]);

  useEffect(() => {
    localStorage.setItem('ksfItems', JSON.stringify(ksfItems));
  }, [ksfItems]);

  // Save to Supabase
  const saveToSupabase = async () => {
    try {
      // Save SWOT data
      await supabase
        .from('strategic_data')
        .upsert({
          id: 1,
          strengths,
          weaknesses,
          opportunities,
          threats,
          ife_factors: ifeFactors,
          efe_factors: efeFactors,
          ksf_items: ksfItems,
          competitors,
        });

      alert('Data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again.');
    }
  };

  const handleSave = async () => {
    const data: StrategicData = {
      swot: {
        strengths,
        weaknesses,
        opportunities,
        threats
      },
      matrices: {
        ife: ifeFactors,
        efe: efeFactors
      },
      ksf: ksfItems,
      competitors,
    };

    const result = await saveToFile(data);
    if (result.success) {
      alert('Data saved successfully!');
    }
  };

  const handleLoad = async () => {
    const result = await loadFromFile();
    if (result.data) {
      setStrengths(result.data.swot.strengths);
      setWeaknesses(result.data.swot.weaknesses);
      setOpportunities(result.data.swot.opportunities);
      setThreats(result.data.swot.threats);
      setIfeFactors(result.data.matrices.ife);
      setEfeFactors(result.data.matrices.efe);
      setKsfItems(result.data.ksf);
      setCompetitors(result.data.competitors);
      alert('Data loaded successfully!');
    }
  };

  // Auto-save whenever data changes
  useEffect(() => {
    if (hasActiveFile()) {
      const data: StrategicData = {
        swot: {
          strengths,
          weaknesses,
          opportunities,
          threats
        },
        matrices: {
          ife: ifeFactors,
          efe: efeFactors
        },
        ksf: ksfItems,
        competitors,
      };
      autoSave(data);
    }
  }, [strengths, weaknesses, opportunities, threats, ifeFactors, efeFactors, ksfItems, competitors]);

  // Type-safe event handlers
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, id: string, field: keyof KsfItem) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    updateKsfItem(id, field, value);
  };

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

  const addSwotItem = (type: keyof StrategicData['swot']) => {
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
      measure: '',
      weight: 0,
      performance: 0
    };
    setKsfItems([...ksfItems, newItem]);
  };

  const updateFactor = (type: 'ife' | 'efe', id: string, field: keyof Factor, value: string | number) => {
    const setFactors = type === 'ife' ? setIfeFactors : setEfeFactors;
    setFactors((prev: Factor[]) => prev.map(factor => 
      factor.id === id ? { ...factor, [field]: value } : factor
    ));
  };

  const updateSwotItem = (type: keyof StrategicData['swot'], id: string, value: string) => {
    const setItems = {
      strengths: setStrengths,
      weaknesses: setWeaknesses,
      opportunities: setOpportunities,
      threats: setThreats
    }[type];

    setItems((prev: SwotItem[]) => prev.map(item =>
      item.id === id ? { ...item, description: value } : item
    ));
  };

  const updateKsfItem = (id: string, field: keyof KsfItem, value: string | number) => {
    setKsfItems((prev: KsfItem[]) => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleUpdateCompetitors = (newCompetitors: Competitor[]) => {
    setCompetitors(newCompetitors);
    saveToSupabase();
  };

  const deleteFactor = (type: 'ife' | 'efe', id: string) => {
    const setFactors = type === 'ife' ? setIfeFactors : setEfeFactors;
    setFactors(prev => prev.filter(factor => factor.id !== id));
  };

  const deleteSwotItem = (type: keyof StrategicData['swot'], id: string) => {
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

  const calculateTotal = (factors: Factor[]): number => {
    return factors.reduce((sum: number, factor: Factor) => sum + (factor.weight * factor.rating), 0);
  };

  const calculateKsfScore = (items: KsfItem[]): number => {
    return items.reduce((total: number, item: KsfItem) => {
      const score = (item.weight / 100) * (item.performance / 100) * 100;
      return total + score;
    }, 0);
  };

  const getMatrixRadarData = (factors: Factor[]) => {
    return {
      labels: factors.map((f: Factor) => f.description || 'Unnamed Factor'),
      datasets: [
        {
          label: 'Weighted Score',
          data: factors.map((f: Factor) => f.weight * f.rating),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          fill: true,
        },
        {
          label: 'Weight',
          data: factors.map((f: Factor) => f.weight),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          fill: true,
        },
        {
          label: 'Rating',
          data: factors.map((f: Factor) => f.rating),
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

  const getKsfRadarData = (items: KsfItem[]) => {
    return {
      labels: items.map((item: KsfItem) => item.description || 'Unnamed KSF'),
      datasets: [
        {
          label: 'Target Achievement',
          data: items.map((item: KsfItem) => (item.performance / 100) * 100),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
        },
        {
          label: 'Weighted Score',
          data: items.map((item: KsfItem) => (item.weight / 100) * (item.performance / 100) * 100),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
        }
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
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
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
              {(type === 'ife' ? ifeFactors : efeFactors).map((factor: Factor) => (
                <tr key={factor.id}>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={factor.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFactor(type, factor.id, 'description', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter factor description"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={factor.weight}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFactor(type, factor.id, 'weight', parseFloat(e.target.value))}
                      min="0"
                      max="1"
                      step="0.01"
                      className="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={factor.rating}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFactor(type, factor.id, 'rating', parseInt(e.target.value))}
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
                    .reduce((sum: number, factor: Factor) => sum + factor.weight, 0)
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
      <div className="flex justify-end space-x-4 mb-6">
        <button
          onClick={() => addSwotItem('strengths')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Strength
        </button>
        <button
          onClick={() => addSwotItem('weaknesses')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Weakness
        </button>
        <button
          onClick={() => addSwotItem('opportunities')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Opportunity
        </button>
        <button
          onClick={() => addSwotItem('threats')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Threat
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths Card */}
        <div className="bg-gradient-to-br from-green-50 to-white rounded-lg shadow-lg p-6 border-l-4 border-green-500 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Strengths</h3>
          </div>
          <div className="space-y-3">
            {strengths.map((item: SwotItem) => (
              <div key={item.id} className="flex items-start space-x-3 bg-white p-3 rounded-lg shadow-sm">
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSwotItem('strengths', item.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter strength"
                  />
                </div>
                <button
                  onClick={() => deleteSwotItem('strengths', item.id)}
                  className="text-red-500 hover:text-red-700 transition-colors duration-200"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses Card */}
        <div className="bg-gradient-to-br from-red-50 to-white rounded-lg shadow-lg p-6 border-l-4 border-red-500 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Weaknesses</h3>
          </div>
          <div className="space-y-3">
            {weaknesses.map((item: SwotItem) => (
              <div key={item.id} className="flex items-start space-x-3 bg-white p-3 rounded-lg shadow-sm">
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSwotItem('weaknesses', item.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter weakness"
                  />
                </div>
                <button
                  onClick={() => deleteSwotItem('weaknesses', item.id)}
                  className="text-red-500 hover:text-red-700 transition-colors duration-200"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunities Card */}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Opportunities</h3>
          </div>
          <div className="space-y-3">
            {opportunities.map((item: SwotItem) => (
              <div key={item.id} className="flex items-start space-x-3 bg-white p-3 rounded-lg shadow-sm">
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSwotItem('opportunities', item.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter opportunity"
                  />
                </div>
                <button
                  onClick={() => deleteSwotItem('opportunities', item.id)}
                  className="text-red-500 hover:text-red-700 transition-colors duration-200"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Threats Card */}
        <div className="bg-gradient-to-br from-yellow-50 to-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Threats</h3>
          </div>
          <div className="space-y-3">
            {threats.map((item: SwotItem) => (
              <div key={item.id} className="flex items-start space-x-3 bg-white p-3 rounded-lg shadow-sm">
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSwotItem('threats', item.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Enter threat"
                  />
                </div>
                <button
                  onClick={() => deleteSwotItem('threats', item.id)}
                  className="text-red-500 hover:text-red-700 transition-colors duration-200"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
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
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
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
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weight (0-100)
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance (0-100)
                  </th>
                  <th className="px-6 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ksfItems.map((item: KsfItem) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateKsfItem(item.id, 'description', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter success factor"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={item.target}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateKsfItem(item.id, 'target', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter target"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={item.measure}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateKsfItem(item.id, 'measure', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter measure"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={item.weight}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateKsfItem(item.id, 'weight', parseFloat(e.target.value))}
                        min="0"
                        max="100"
                        step="1"
                        className="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={item.performance}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateKsfItem(item.id, 'performance', parseFloat(e.target.value))}
                        min="0"
                        max="100"
                        step="1"
                        className="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
            data={getKsfRadarData(ksfItems)}
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
          <p className="text-lg font-medium mt-4">Total KSF Score: {calculateKsfScore(ksfItems).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Layout className="h-8 w-8 mr-2" />
              <h1 className="text-2xl font-semibold text-gray-900">Strategic Management Tool</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Save to File
              </button>
              <button
                onClick={handleLoad}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Load from File
              </button>
              <button
                onClick={saveToSupabase}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
              >
                <Save className="h-4 w-4 mr-2" />
                Save to Cloud
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('swot')}
                className={`${
                  activeTab === 'swot'
                    ? 'border-black text-black'
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
                    ? 'border-black text-black'
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
                    ? 'border-black text-black'
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
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex-1 py-4 px-1 text-center border-b-2 font-medium flex items-center justify-center`}
              >
                <ListChecks className="h-4 w-4 mr-2" />
                EFE Matrix
              </button>
              <button
                className={`px-4 py-2 rounded-t-lg ${activeTab === 'cpm' ? 'bg-white text-blue-600 border-t border-x' : 'bg-gray-100'}`}
                onClick={() => setActiveTab('cpm')}
              >
                <ListChecks className="w-5 h-5 inline-block mr-2" />
                CPM
              </button>
            </nav>
          </div>

          {activeTab === 'swot' && renderSwotTab()}
          {activeTab === 'ksf' && renderKsfTab()}
          {(activeTab === 'ife' || activeTab === 'efe') && renderMatrixTab(activeTab)}
          {activeTab === 'cpm' && (
            <div className="p-6">
              <CompetitiveProfileMatrix
                competitors={competitors}
                ksf={ksfItems}
                onUpdateCompetitors={handleUpdateCompetitors}
              />
            </div>
          )}

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end space-x-4">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;