import { useState, useCallback } from 'react';
import axios from '../config/axios';
import { Group, Balance, Settlement } from '../types/group.types';
import { API_ENDPOINTS } from '../constants/group.constants';

interface UseGroupDataReturn {
  group: Group | null;
  balances: Balance[];
  settlements: Settlement[];
  loading: boolean;
  error: string | null;
  fetchGroupData: (groupId: string) => Promise<void>;
}

export const useGroupData = (): UseGroupDataReturn => {
  const [group, setGroup] = useState<Group | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupData = useCallback(async (groupId: string) => {
    if (!groupId) {
      setError('Group ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [groupRes, balancesRes, settlementsRes] = await Promise.all([
        axios.get(API_ENDPOINTS.GROUPS),
        axios.get(`${API_ENDPOINTS.SETTLEMENTS}/group/${groupId}/balances`),
        axios.get(`${API_ENDPOINTS.SETTLEMENTS}/group/${groupId}`)
      ]);

      const currentGroup = groupRes.data.find((g: Group) => g._id === groupId);
      
      if (!currentGroup) {
        throw new Error('Group not found');
      }
      
      setGroup(currentGroup);
      setBalances(balancesRes.data);
      setSettlements(settlementsRes.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch group data';
      setError(errorMessage);
      console.error('Failed to fetch group data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    group,
    balances,
    settlements,
    loading,
    error,
    fetchGroupData,
  };
};