import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  EnvelopeIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface Lead {
  id: string;
  event_id: string;
  user_id: string;
  step_id: string;
  message: string;
  status: 'new' | 'contacted' | 'booked';
  created_at: string;
  user: {
    name: string;
    email: string;
  };
  event: {
    event_type: string;
    prompt: string;
  };
  step: {
    step_title: string;
  };
}

interface LeadsTabProps {
  providerId: string;
}

export const LeadsTab: React.FC<LeadsTabProps> = ({ providerId }) => {
  const { session } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'booked'>('all');

  useEffect(() => {
    if (providerId) {
      fetchLeads();
    }
  }, [providerId]);

  const fetchLeads = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/leads?provider_id=${providerId}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Fetch leads error:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, status: 'contacted' | 'booked') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update lead status');
      }

      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status } : lead
      ));

      toast.success(`Lead marked as ${status}`);
    } catch (error) {
      console.error('Update lead error:', error);
      toast.error('Failed to update lead status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'booked': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <EnvelopeIcon className="h-4 w-4" />;
      case 'contacted': return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
      case 'booked': return <CheckCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const filteredLeads = filter === 'all' 
    ? leads 
    : leads.filter(lead => lead.status === filter);

  const leadsStats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    booked: leads.filter(l => l.status === 'booked').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{leadsStats.total}</p>
            </div>
            <EnvelopeIcon className="h-8 w-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New</p>
              <p className="text-2xl font-bold text-blue-600">{leadsStats.new}</p>
            </div>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contacted</p>
              <p className="text-2xl font-bold text-yellow-600">{leadsStats.contacted}</p>
            </div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Booked</p>
              <p className="text-2xl font-bold text-green-600">{leadsStats.booked}</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leads Management</CardTitle>
            <div className="flex gap-2">
              {(['all', 'new', 'contacted', 'booked'] as const).map(status => (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== 'all' && (
                    <Badge variant="secondary" className="ml-2">
                      {leadsStats[status]}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <EnvelopeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "You haven't received any leads yet. Make sure your profile is complete and your subscription is active."
                  : `No ${filter} leads at the moment.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <Card key={lead.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={getStatusColor(lead.status)}>
                          {getStatusIcon(lead.status)}
                          <span className="ml-1 capitalize">{lead.status}</span>
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <UserIcon className="h-4 w-4" />
                            Customer
                          </div>
                          <p className="font-medium">{lead.user.name}</p>
                          <p className="text-sm text-gray-600">
                            {lead.status === 'new' ? '***@***.com' : lead.user.email}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <CalendarIcon className="h-4 w-4" />
                            Event Type
                          </div>
                          <p className="font-medium">{lead.event.event_type}</p>
                          <p className="text-sm text-gray-600">{lead.step.step_title}</p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <ChatBubbleLeftRightIcon className="h-4 w-4" />
                            Request
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {lead.message}
                          </p>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-600 mb-1">Event Description:</p>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {lead.event.prompt}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      {lead.status === 'new' && (
                        <Button
                          size="sm"
                          onClick={() => updateLeadStatus(lead.id, 'contacted')}
                        >
                          Mark Contacted
                        </Button>
                      )}
                      {lead.status === 'contacted' && (
                        <Button
                          size="sm"
                          onClick={() => updateLeadStatus(lead.id, 'booked')}
                        >
                          Mark Booked
                        </Button>
                      )}
                      {lead.status === 'booked' && (
                        <Badge variant="secondary" className="justify-center">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};