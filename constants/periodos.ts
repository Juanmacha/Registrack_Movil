import { Periodo } from '@/types/dashboard';

export const PERIODOS: Periodo[] = [
  { label: '1 Mes', value: '1mes' },
  { label: '3 Meses', value: '3meses' },
  { label: '6 Meses', value: '6meses' },
  { label: '12 Meses', value: '12meses' },
  { label: '18 Meses', value: '18meses' },
  { label: '2 Años', value: '2anos' },
  { label: '3 Años', value: '3anos' },
  { label: '5 Años', value: '5anos' },
  { label: 'Todos', value: 'todo' },
];

export const PERIODO_DEFAULT: Periodo['value'] = '12meses';

