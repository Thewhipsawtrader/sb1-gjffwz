import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { SolutionGuide } from '../services/solutionGuide';
import { SolutionViewer } from '../components/SolutionViewer';
import { Solution, SolutionCategory } from '../types/solutions';

export function SolutionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SolutionCategory | 'ALL'>('ALL');
  
  const solutions = SolutionGuide.getInstance().getAllSolutions();

  const filteredSolutions = solutions.filter(solution => {
    const matchesSearch = 
      solution.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solution.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'ALL' || solution.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900">Solution Guide</h1>
        <p className="mt-1 text-sm text-gray-600">
          Find solutions for common issues and technical problems.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search solutions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="sm:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as SolutionCategory | 'ALL')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
              >
                <option value="ALL">All Categories</option>
                <option value="MIKROTIK">Mikrotik</option>
                <option value="WEBSITE">Website</option>
                <option value="TECHNICAL">Technical</option>
                <option value="SECURITY">Security</option>
                <option value="INTEGRATION">Integration</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {filteredSolutions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No solutions found matching your criteria.</p>
            </div>
          ) : (
            filteredSolutions.map((solution: Solution) => (
              <SolutionViewer key={solution.id} solution={solution} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}