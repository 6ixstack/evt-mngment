import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  StarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Vendor {
  id: string;
  business_name: string;
  provider_type: string;
  location_city: string;
  location_province: string;
  description: string;
  logo_url: string;
  rating: number;
  reviews_count: number;
}

export const TrustedVendors: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mock data for demo - in production this would come from API
  const mockVendors: Vendor[] = [
    {
      id: '1',
      business_name: 'Elegant Moments Photography',
      provider_type: 'photographer',
      location_city: 'Toronto',
      location_province: 'Ontario',
      description: 'Professional wedding and event photography with a focus on capturing authentic emotions.',
      logo_url: 'https://images.unsplash.com/photo-1606868306217-dbf5046868d2?w=100&h=100&fit=crop&crop=face',
      rating: 4.9,
      reviews_count: 127
    },
    {
      id: '2',
      business_name: 'The Grand Ballroom',
      provider_type: 'venue',
      location_city: 'Vancouver',
      location_province: 'British Columbia',
      description: 'Luxurious event venue with capacity for 300 guests, featuring crystal chandeliers and marble floors.',
      logo_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=100&h=100&fit=crop',
      rating: 4.8,
      reviews_count: 89
    },
    {
      id: '3',
      business_name: 'Savory Delights Catering',
      provider_type: 'catering',
      location_city: 'Montreal',
      location_province: 'Quebec',
      description: 'Award-winning catering service specializing in international cuisine and dietary accommodations.',
      logo_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100&h=100&fit=crop',
      rating: 4.7,
      reviews_count: 156
    },
    {
      id: '4',
      business_name: 'Bloom & Blossom Florals',
      provider_type: 'florist',
      location_city: 'Calgary',
      location_province: 'Alberta',
      description: 'Creative floral designs using fresh, seasonal flowers sourced from local growers.',
      logo_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
      rating: 4.9,
      reviews_count: 94
    },
    {
      id: '5',
      business_name: 'Harmony Strings Quartet',
      provider_type: 'music',
      location_city: 'Ottawa',
      location_province: 'Ontario',
      description: 'Professional classical quartet available for ceremonies, cocktail hours, and receptions.',
      logo_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
      rating: 4.8,
      reviews_count: 73
    },
    {
      id: '6',
      business_name: 'Premier Transportation',
      provider_type: 'transportation',
      location_city: 'Edmonton',
      location_province: 'Alberta',
      description: 'Luxury vehicle rentals including limousines, party buses, and vintage cars.',
      logo_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop',
      rating: 4.6,
      reviews_count: 118
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setVendors(mockVendors);
      setLoading(false);
    }, 1000);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev === vendors.length - 3 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? vendors.length - 3 : prev - 1
    );
  };

  const getProviderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      photographer: 'Photography',
      venue: 'Venue',
      catering: 'Catering',
      florist: 'Floral Design',
      music: 'Music & Entertainment',
      transportation: 'Transportation'
    };
    return labels[type] || type;
  };

  const renderStars = (rating: number, reviewsCount: number = 0) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => {
          const starFilled = i < Math.floor(rating);
          return starFilled ? (
            <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarIcon key={i} className="h-4 w-4 text-gray-300" />
          );
        })}
        <span className="text-sm text-gray-600 ml-1">
          {rating} ({reviewsCount} reviews)
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with our network of verified, highly-rated service providers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with our network of verified, highly-rated service providers who have helped create thousands of memorable events
          </p>
        </div>

        <div className="relative">
          {/* Carousel Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
            >
              {vendors.map((vendor) => (
                <div key={vendor.id} className="w-full md:w-1/3 flex-shrink-0 px-3">
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <img
                          src={vendor.logo_url}
                          alt={vendor.business_name}
                          className="w-12 h-12 rounded-full object-cover mr-4"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50x50?text=Logo';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {vendor.business_name}
                          </h3>
                          <p className="text-sm text-primary-600">
                            {getProviderTypeLabel(vendor.provider_type)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        {renderStars(vendor.rating, vendor.reviews_count || 0)}
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {vendor.description}
                      </p>

                      <div className="flex items-center text-sm text-gray-500">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {vendor.location_city}, {vendor.location_province}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="sm"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 rounded-full w-10 h-10 p-0"
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 rounded-full w-10 h-10 p-0"
            onClick={nextSlide}
            disabled={currentIndex >= vendors.length - 3}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {[...Array(Math.max(1, vendors.length - 2))].map((_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex ? 'bg-primary-600' : 'bg-gray-300'
              }`}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
            Browse All Vendors
          </Button>
        </div>
      </div>
    </section>
  );
};