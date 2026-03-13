
export const DOSP_BASE_URL = 'https://diariooficial.prefeitura.sp.gov.br';

export const MOCK_MONITORS = [
  { id: '1', name: 'JOÃO SILVA PINTO', rf: '1234567', role: 'Assessor Técnico', active: true, createdAt: Date.now() },
  { id: '2', name: 'MARIA APARECIDA SOUZA', rf: '7654321', role: 'Analista de Saúde', active: true, createdAt: Date.now() },
  { id: '3', name: 'RICARDO OLIVEIRA SANTOS', rf: '1122334', role: 'Professor de Ensino Fundamental', active: false, createdAt: Date.now() }
];

export const MOCK_OCCURRENCES = (date: string) => [
  {
    id: 'occ1',
    monitorId: '1',
    monitorName: 'JOÃO SILVA PINTO',
    monitorRf: '1234567',
    title: 'NOMEAÇÃO DE CARGO EM COMISSÃO',
    content: '... fica nomeado JOÃO SILVA PINTO, RF 1.234.567, para exercer o cargo de Diretor...',
    page: '12',
    section: 'Secretaria de Gestão',
    url: `${DOSP_BASE_URL}/materia/123`,
    confidence: 'high',
    matchType: 'proximity'
  }
];
