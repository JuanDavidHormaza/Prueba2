import { useState, useEffect, useCallback } from 'react';
import { apiService, Person, User, Subject, DigitalDictionary } from '../services/api';

// Hook generico para cargar datos del API
export function useApiData<T>(
  fetchFn: () => Promise<{ success: boolean; data?: T; error?: string }>,
  fallbackData: T,
  dependencies: unknown[] = []
) {
  const [data, setData] = useState<T>(fallbackData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const result = await fetchFn();
    
    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error || 'Error al cargar datos');
      // Usar datos de fallback si hay error
      setData(fallbackData);
    }
    
    setIsLoading(false);
  }, [fetchFn, fallbackData]);

  useEffect(() => {
    loadData();
  }, [loadData, ...dependencies]);

  return { data, isLoading, error, refetch: loadData };
}

// Hook para obtener personas
export function usePersons(fallbackData: Person[] = []) {
  return useApiData<Person[]>(
    () => apiService.getPersons(),
    fallbackData
  );
}

// Hook para obtener usuarios
export function useUsers(fallbackData: User[] = []) {
  return useApiData<User[]>(
    () => apiService.getUsers(),
    fallbackData
  );
}

// Hook para obtener materias
export function useSubjects(fallbackData: Subject[] = []) {
  return useApiData<Subject[]>(
    () => apiService.getSubjects(),
    fallbackData
  );
}

// Hook para obtener diccionario
export function useDictionary(fallbackData: DigitalDictionary[] = []) {
  return useApiData<DigitalDictionary[]>(
    () => apiService.getDictionary(),
    fallbackData
  );
}
