import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { VendorCard } from '@/components/VendorCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Provider {
  id: string;
  business_name: string;
  provider_type: string;
  location_city: string;
  location_province: string;
  description: string;
  tags: string[];
  logo_url: string;
  sample_images: string[];
  distance?: number;
}

interface ProviderSearchProps {
  eventType?: string;
  onProviderSelect?: (provider: Provider) => void;
}

export const ProviderSearch: React.FC<ProviderSearchProps> = ({ 
  eventType,
  onProviderSelect: _onProviderSelect 
}) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState(eventType || '');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const providerTypes = [
    { value: '', label: 'All Services' },
    { value: 'venue', label: 'Venues' },
    { value: 'catering', label: 'Catering' },
    { value: 'photographer', label: 'Photography' },
    { value: 'videographer', label: 'Videography' },
    { value: 'florist', label: 'Flowers' },
    { value: 'decorator', label: 'Decoration' },
    { value: 'music', label: 'Music & Entertainment' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'makeup', label: 'Makeup & Beauty' },
    { value: 'clothing', label: 'Clothing & Fashion' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'invitations', label: 'Invitations' },
    { value: 'other', label: 'Other Services' }
  ];

  const provinces = [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
    'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
    'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'
  ];

  useEffect(() => {
    searchProviders();
  }, [selectedType, selectedCity, selectedProvince]);

  const searchProviders = async () => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedType) params.append('type', selectedType);
      if (selectedCity) params.append('city', selectedCity);
      if (selectedProvince) params.append('province', selectedProvince);
      params.append('limit', '20');

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/providers?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }

      const data = await response.json();
      setProviders(data.providers || []);

    } catch (error) {
      console.error('Search providers error:', error);
      toast.error('Failed to search providers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchProviders();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType(eventType || '');
    setSelectedCity('');
    setSelectedProvince('');
    setShowFilters(false);
  };

  const getProviderTypeLabel = (type: string) => {
    return providerTypes.find(pt => pt.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MagnifyingGlassIcon className="h-5 w-5" />
              Find Service Providers
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by business name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {providerTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Province
                </label>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Provinces</option>
                  {provinces.map(province => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <Input
                  type="text"
                  placeholder="Enter city name"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(searchTerm || selectedType || selectedCity || selectedProvince) && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="hover:bg-primary-200 rounded-full p-0.5"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedType && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {getProviderTypeLabel(selectedType)}
                  <button
                    onClick={() => setSelectedType('')}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedProvince && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <MapPinIcon className="h-3 w-3" />
                  {selectedProvince}
                  <button
                    onClick={() => setSelectedProvince('')}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCity && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  <MapPinIcon className="h-3 w-3" />
                  {selectedCity}
                  <button
                    onClick={() => setSelectedCity('')}
                    className="hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters to find more results.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Found {providers.length} provider{providers.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <VendorCard
                  key={provider.id}
                  provider={provider}
                  stepId="search"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};