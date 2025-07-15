import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'tasks' | 'clients' | 'payments'>('all');

  // Advanced search with full-text search
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', searchQuery, searchType],
    queryFn: async () => {
      if (!searchQuery.trim()) return { tasks: [], clients: [], payments: [] };

      const results = { tasks: [], clients: [], payments: [] };

      // Search tasks using full-text search
      if (searchType === 'all' || searchType === 'tasks') {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,client_name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
          .eq('is_deleted', false)
          .limit(20);
        results.tasks = tasks || [];
      }

      // Search clients
      if (searchType === 'all' || searchType === 'clients') {
        const { data: clients } = await supabase
          .from('clients')
          .select('*')
          .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,client_code.ilike.%${searchQuery}%`)
          .eq('is_deleted', false)
          .limit(20);
        results.clients = clients || [];
      }

      // Search payments
      if (searchType === 'all' || searchType === 'payments') {
        const { data: payments } = await supabase
          .from('payments')
          .select(`
            *,
            clients (name, email)
          `)
          .or(`payment_id.ilike.%${searchQuery}%,payment_method.ilike.%${searchQuery}%`)
          .eq('is_deleted', false)
          .limit(20);
        results.payments = payments || [];
      }

      return results;
    },
    enabled: searchQuery.length > 2,
  });

  const filteredResults = useMemo(() => {
    if (!searchResults) return { tasks: [], clients: [], payments: [] };
    return searchResults;
  }, [searchResults]);

  return {
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    searchResults: filteredResults,
    isLoading,
    hasResults: searchQuery.length > 2 && (
      filteredResults.tasks.length > 0 || 
      filteredResults.clients.length > 0 || 
      filteredResults.payments.length > 0
    ),
  };
};