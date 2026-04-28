export type UserRole = 'admin' | 'teacher' | 'student';

export interface UserPermissions {
  canManageUsers: boolean;
  canManageDocuments: boolean;
  canViewStatistics: boolean;
  canGiveFeedback: boolean;
  canTakeQuiz: boolean;
  canViewResults: boolean;
  canManageSubjects: boolean;
  canConfigureLevels: boolean;
}

// Document types based on schema
export type DocType = 'CC' | 'TI' | 'CE' | 'PP' | 'PEP';

// Title/Treatment
export type Title = 'Sr.' | 'Sra.' | 'Dr.' | 'Dra.' | 'Ing.' | 'Lic.' | 'Prof.';

export interface User {
  id: string;
  // PERSONS table fields
  email: string;
  password: string;
  docType?: DocType;
  docNum?: string;
  title?: Title;
  firstName: string;
  lastName: string;
  phoneNum?: string;
  // USERS table fields
  role: UserRole;
  country?: string;
  program?: string;
  permissions: UserPermissions;
  status: 'active' | 'inactive';
  mfa?: boolean;
  createdAt: string;
  avatar?: string;
}

// Digital Dictionary entry based on schema
export interface DictionaryEntry {
  id: string;
  wordId: string;
  subjectId: string;
  definition: string;
  synonyms?: string;
  audio?: string;
  video?: string;
  image?: string;
}

// Ranking entry based on schema
export interface RankingEntry {
  subjectId: string;
  wordId: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  value: number;
}

// Post entry based on schema
export interface Post {
  id: string;
  userId: string;
  title: string;
  body?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

// User activity log based on schema
export interface UserLog {
  userId: string;
  transaction: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  subjectId: string | null;
  subjectName: string;
  program: string;
  uploadedAt: string;
  fileType: string;
  size: string;
  uploadedBy: string;
}

export interface TestResult {
  id: string;
  userId: string;
  userName: string;
  score: number;
  level: string;
  correctAnswers: number;
  totalQuestions: number;
  answers: {
    questionId: number;
    question: string;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    category: string;
  }[];
  feedback?: string;
  completedAt: string;
  duration?: string;
}

// Default permissions by role
export const getDefaultPermissions = (role: UserRole): UserPermissions => {
  switch (role) {
    case 'admin':
      return {
        canManageUsers: true,
        canManageDocuments: true,
        canViewStatistics: true,
        canGiveFeedback: true,
        canTakeQuiz: false,
        canViewResults: true,
        canManageSubjects: true,
        canConfigureLevels: true,
      };
    case 'teacher':
      return {
        canManageUsers: false,
        canManageDocuments: true,
        canViewStatistics: true,
        canGiveFeedback: true,
        canTakeQuiz: false,
        canViewResults: true,
        canManageSubjects: false,
        canConfigureLevels: false,
      };
    case 'student':
      return {
        canManageUsers: false,
        canManageDocuments: false,
        canViewStatistics: false,
        canGiveFeedback: false,
        canTakeQuiz: true,
        canViewResults: true,
        canManageSubjects: false,
        canConfigureLevels: false,
      };
  }
};

// Mock subjects
export const mockSubjects: Subject[] = [
  {
    id: 'sub1',
    name: 'Ingles Tecnico',
    description: 'Vocabulario y expresiones tecnicas en ingles',
    color: '#39A900',
    createdAt: '2026-01-15',
  },
  {
    id: 'sub2',
    name: 'Gramatica Basica',
    description: 'Fundamentos gramaticales del idioma ingles',
    color: '#1F4E78',
    createdAt: '2026-01-20',
  },
  {
    id: 'sub3',
    name: 'Comprension Lectora',
    description: 'Desarrollo de habilidades de lectura en ingles',
    color: '#D89E00',
    createdAt: '2026-02-01',
  },
  {
    id: 'sub4',
    name: 'Conversacion',
    description: 'Practica de expresion oral en ingles',
    color: '#E21B3C',
    createdAt: '2026-02-10',
  },
];

// Document type options
export const docTypes: { value: DocType; label: string }[] = [
  { value: 'CC', label: 'Cedula de Ciudadania' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'CE', label: 'Cedula de Extranjeria' },
  { value: 'PP', label: 'Pasaporte' },
  { value: 'PEP', label: 'Permiso Especial de Permanencia' },
];

// Title options
export const titles: { value: Title; label: string }[] = [
  { value: 'Sr.', label: 'Senor' },
  { value: 'Sra.', label: 'Senora' },
  { value: 'Dr.', label: 'Doctor' },
  { value: 'Dra.', label: 'Doctora' },
  { value: 'Ing.', label: 'Ingeniero/a' },
  { value: 'Lic.', label: 'Licenciado/a' },
  { value: 'Prof.', label: 'Profesor/a' },
];

// Mock users database
export const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'Administrador',
    lastName: 'SENA',
    email: 'admin@gmail.com',
    password: '123',
    docType: 'CC',
    docNum: '1234567890',
    title: 'Ing.',
    phoneNum: '3001234567',
    role: 'admin',
    permissions: getDefaultPermissions('admin'),
    status: 'active',
    mfa: true,
    createdAt: '2026-01-01',
  },
  {
    id: '2',
    firstName: 'Carlos',
    lastName: 'Martinez',
    email: 'docente@gmail.com',
    password: '123',
    docType: 'CC',
    docNum: '9876543210',
    title: 'Prof.',
    phoneNum: '3109876543',
    role: 'teacher',
    program: 'Desarrollo de Software',
    permissions: getDefaultPermissions('teacher'),
    status: 'active',
    mfa: false,
    createdAt: '2026-01-15',
  },
  {
    id: '3',
    firstName: 'Juan David',
    lastName: 'Perez',
    email: 'juan@gmail.com',
    password: '123',
    docType: 'TI',
    docNum: '1098765432',
    phoneNum: '3201234567',
    role: 'student',
    country: 'Colombia',
    program: 'Desarrollo de Software',
    permissions: getDefaultPermissions('student'),
    status: 'active',
    createdAt: '2026-02-01',
  },
  {
    id: '4',
    firstName: 'Maria',
    lastName: 'Garcia Lopez',
    email: 'maria@gmail.com',
    password: '123',
    docType: 'CC',
    docNum: '1122334455',
    phoneNum: '3156789012',
    role: 'student',
    country: 'Colombia',
    program: 'Analisis de Datos',
    permissions: getDefaultPermissions('student'),
    status: 'active',
    createdAt: '2026-02-05',
  },
  {
    id: '5',
    firstName: 'Carlos Andres',
    lastName: 'Lopez',
    email: 'carlos@gmail.com',
    password: '123',
    docType: 'CC',
    docNum: '5544332211',
    phoneNum: '3187654321',
    role: 'student',
    country: 'Colombia',
    program: 'Redes y Telecomunicaciones',
    permissions: getDefaultPermissions('student'),
    status: 'inactive',
    createdAt: '2026-02-10',
  },
  {
    id: '6',
    firstName: 'Ana Sofia',
    lastName: 'Rodriguez',
    email: 'ana@gmail.com',
    password: '123',
    docType: 'CC',
    docNum: '6677889900',
    title: 'Lic.',
    phoneNum: '3123456789',
    role: 'teacher',
    program: 'Analisis de Datos',
    permissions: {
      ...getDefaultPermissions('teacher'),
      canManageSubjects: true,
    },
    status: 'active',
    mfa: true,
    createdAt: '2026-02-15',
  },
];

// Mock dictionary entries
export const mockDictionaryEntries: DictionaryEntry[] = [
  {
    id: 'dict1',
    wordId: 'W001',
    subjectId: 'sub1',
    definition: 'A systematic method or way of doing something.',
    synonyms: 'approach, technique, procedure',
  },
  {
    id: 'dict2',
    wordId: 'W002',
    subjectId: 'sub2',
    definition: 'An action word that describes what the subject is doing.',
    synonyms: 'action word, doing word',
  },
];

// Mock posts
export const mockPosts: Post[] = [
  {
    id: 'post1',
    userId: '2',
    title: 'Tips para mejorar tu pronunciacion',
    body: 'En este articulo compartimos las mejores tecnicas para mejorar tu pronunciacion en ingles...',
    status: 'published',
    createdAt: '2026-04-10',
  },
  {
    id: 'post2',
    userId: '6',
    title: 'Guia de Phrasal Verbs',
    body: 'Los phrasal verbs son combinaciones de verbos con preposiciones o adverbios que cambian el significado...',
    status: 'published',
    createdAt: '2026-04-12',
  },
];

// Mock rankings
export const mockRankings: RankingEntry[] = [
  { subjectId: 'sub1', wordId: 'W001', level: 'B1', value: 85 },
  { subjectId: 'sub2', wordId: 'W002', level: 'A2', value: 70 },
];

// Mock documents
export const mockDocuments: Document[] = [
  {
    id: 'doc1',
    name: 'Diccionario Basico A1-A2.pdf',
    subjectId: 'sub2',
    subjectName: 'Gramatica Basica',
    program: 'Todos los programas',
    uploadedAt: '2026-04-01',
    fileType: 'PDF',
    size: '2.5 MB',
    uploadedBy: 'Administrador SENA',
  },
  {
    id: 'doc2',
    name: 'Vocabulario Tecnico Software.pdf',
    subjectId: 'sub1',
    subjectName: 'Ingles Tecnico',
    program: 'Desarrollo de Software',
    uploadedAt: '2026-04-05',
    fileType: 'PDF',
    size: '1.8 MB',
    uploadedBy: 'Carlos Martinez',
  },
  {
    id: 'doc3',
    name: 'Lecturas Nivel Intermedio.docx',
    subjectId: 'sub3',
    subjectName: 'Comprension Lectora',
    program: 'Todos los programas',
    uploadedAt: '2026-04-10',
    fileType: 'DOCX',
    size: '3.2 MB',
    uploadedBy: 'Administrador SENA',
  },
  {
    id: 'doc4',
    name: 'Phrasal Verbs Comunes.xlsx',
    subjectId: null,
    subjectName: 'Sin asignar',
    program: 'Todos los programas',
    uploadedAt: '2026-04-12',
    fileType: 'XLSX',
    size: '890 KB',
    uploadedBy: 'Ana Sofia Rodriguez',
  },
];

// Mock test results
export const mockTestResults: TestResult[] = [
  {
    id: 'r1',
    userId: '3',
    userName: 'Juan David Perez',
    score: 85,
    level: 'B2',
    correctAnswers: 17,
    totalQuestions: 20,
    completedAt: '2026-04-10T10:30:00',
    duration: '8:45',
    answers: [],
  },
  {
    id: 'r2',
    userId: '3',
    userName: 'Juan David Perez',
    score: 70,
    level: 'B1',
    correctAnswers: 14,
    totalQuestions: 20,
    completedAt: '2026-04-05T14:20:00',
    duration: '9:12',
    answers: [],
    feedback: 'Buen progreso Juan. Te recomiendo practicar mas los tiempos verbales condicionales.',
  },
  {
    id: 'r3',
    userId: '4',
    userName: 'Maria Garcia Lopez',
    score: 92,
    level: 'C1',
    correctAnswers: 18,
    totalQuestions: 20,
    completedAt: '2026-04-12T09:15:00',
    duration: '7:30',
    answers: [],
  },
  {
    id: 'r4',
    userId: '5',
    userName: 'Carlos Andres Lopez',
    score: 60,
    level: 'B1',
    correctAnswers: 12,
    totalQuestions: 20,
    completedAt: '2026-04-08T16:45:00',
    duration: '10:15',
    answers: [],
  },
];

// Helper to get full name from user
export const getFullName = (user: User): string => {
  return `${user.firstName} ${user.lastName}`;
};

// SENA Programs
export const senaPrograms = [
  'Desarrollo de Software',
  'Analisis de Datos',
  'Redes y Telecomunicaciones',
  'Diseño Grafico',
  'Marketing Digital',
  'Contabilidad y Finanzas',
  'Gestion Empresarial',
  'Produccion Multimedia',
  'Seguridad Informatica',
  'Automatizacion Industrial',
];

// Helper functions
export const authenticateUser = (email: string, password: string): User | null => {
  const user = mockUsers.find(u => u.email === email && u.password === password && u.status === 'active');
  return user || null;
};

export const getUsersByRole = (role: UserRole): User[] => {
  return mockUsers.filter(u => u.role === role);
};

export const getTestResultsByUser = (userId: string): TestResult[] => {
  return mockTestResults.filter(r => r.userId === userId);
};

export const getDocumentsBySubject = (subjectId: string): Document[] => {
  return mockDocuments.filter(d => d.subjectId === subjectId);
};

export const getSubjectById = (subjectId: string): Subject | undefined => {
  return mockSubjects.find(s => s.id === subjectId);
};
