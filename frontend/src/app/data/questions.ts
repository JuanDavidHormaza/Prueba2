export type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Grammar' | 'Vocabulary' | 'Reading' | 'Pronunciation';
};

export const questions: Question[] = [
  // Easy - Vocabulario
  {
    id: 1,
    question: "What is the opposite of 'hot'?",
    options: ['Warm', 'Cold', 'Sunny', 'Dry'],
    correctAnswer: 1,
    difficulty: 'Easy',
    category: 'Vocabulary',
  },
  {
    id: 2,
    question: "What is the synonym of 'happy'?",
    options: ['Sad', 'Angry', 'Joyful', 'Tired'],
    correctAnswer: 2,
    difficulty: 'Easy',
    category: 'Vocabulary',
  },
  {
    id: 3,
    question: "Choose the correct article: '__ apple a day keeps the doctor away'",
    options: ['A', 'An', 'The', 'No article'],
    correctAnswer: 1,
    difficulty: 'Easy',
    category: 'Grammar',
  },
  {
    id: 4,
    question: "What does 'big' mean?",
    options: ['Small', 'Large', 'Fast', 'Slow'],
    correctAnswer: 1,
    difficulty: 'Easy',
    category: 'Vocabulary',
  },
  {
    id: 5,
    question: "Complete: 'She ___ to school every day'",
    options: ['go', 'goes', 'going', 'gone'],
    correctAnswer: 1,
    difficulty: 'Easy',
    category: 'Grammar',
  },
  
  // Medium - Gramática
  {
    id: 6,
    question: "If I _____ known about the party, I would have gone.",
    options: ['knew', 'had known', 'have known', 'would know'],
    correctAnswer: 1,
    difficulty: 'Medium',
    category: 'Grammar',
  },
  {
    id: 7,
    question: "She has been working here _____ 2015.",
    options: ['for', 'since', 'during', 'from'],
    correctAnswer: 1,
    difficulty: 'Medium',
    category: 'Grammar',
  },
  {
    id: 8,
    question: "Choose the correct form: 'I wish I _____ speak Chinese'",
    options: ['can', 'could', 'will', 'would'],
    correctAnswer: 1,
    difficulty: 'Medium',
    category: 'Grammar',
  },
  {
    id: 9,
    question: "What is a phrasal verb meaning 'to postpone'?",
    options: ['put off', 'put on', 'put up', 'put down'],
    correctAnswer: 0,
    difficulty: 'Medium',
    category: 'Vocabulary',
  },
  {
    id: 10,
    question: "By the time you arrive, I _____ dinner.",
    options: ['finish', 'will finish', 'will have finished', 'finished'],
    correctAnswer: 2,
    difficulty: 'Medium',
    category: 'Grammar',
  },
  {
    id: 11,
    question: "Choose the correct preposition: 'She is good ___ mathematics'",
    options: ['in', 'at', 'on', 'for'],
    correctAnswer: 1,
    difficulty: 'Medium',
    category: 'Grammar',
  },
  {
    id: 12,
    question: "What does 'break the ice' mean?",
    options: ['To destroy something', 'To start a conversation', 'To be very cold', 'To solve a problem'],
    correctAnswer: 1,
    difficulty: 'Medium',
    category: 'Vocabulary',
  },
  
  // Hard - Comprensión
  {
    id: 13,
    question: "Reading: 'The invention of the steam engine revolutionized manufacturing, transforming small-scale craft production into large-scale industrial output. This shift fundamentally altered society by creating urban centers.' What was one major consequence?",
    options: ['It reduced the need for craftspeople', 'It led to the development of urban centers', 'It decreased overall wealth', 'It eliminated the need for factories'],
    correctAnswer: 1,
    difficulty: 'Hard',
    category: 'Reading',
  },
  {
    id: 14,
    question: "Which sentence uses subjunctive mood correctly?",
    options: ['I suggest that she comes early', 'I suggest that she come early', 'I suggest that she will come early', 'I suggest that she is coming early'],
    correctAnswer: 1,
    difficulty: 'Hard',
    category: 'Grammar',
  },
  {
    id: 15,
    question: "Choose the word that best completes: 'His _____ attitude made it difficult to work with him'",
    options: ['amenable', 'intractable', 'affable', 'gregarious'],
    correctAnswer: 1,
    difficulty: 'Hard',
    category: 'Vocabulary',
  },
  {
    id: 16,
    question: "Reading: 'Despite the economic downturn, the company's revenue remained resilient, attributed largely to strategic diversification.' What helped the company?",
    options: ['Economic growth', 'Strategic diversification', 'Employee layoffs', 'Price increases'],
    correctAnswer: 1,
    difficulty: 'Hard',
    category: 'Reading',
  },
  {
    id: 17,
    question: "Which is correct? 'Neither of the solutions _____ acceptable'",
    options: ['is', 'are', 'were', 'be'],
    correctAnswer: 0,
    difficulty: 'Hard',
    category: 'Grammar',
  },
  {
    id: 18,
    question: "What does 'to beat around the bush' mean?",
    options: ['To be direct', 'To avoid the main topic', 'To work hard', 'To be confused'],
    correctAnswer: 1,
    difficulty: 'Hard',
    category: 'Vocabulary',
  },
  {
    id: 19,
    question: "Reading: 'Photosynthesis is the process by which plants convert light energy into chemical energy.' What do plants convert light energy into?",
    options: ['Water', 'Oxygen', 'Chemical energy', 'Carbon dioxide'],
    correctAnswer: 2,
    difficulty: 'Medium',
    category: 'Reading',
  },
  {
    id: 20,
    question: "Complete: 'Scarcely _____ arrived when the meeting started'",
    options: ['I had', 'had I', 'I have', 'have I'],
    correctAnswer: 1,
    difficulty: 'Hard',
    category: 'Grammar',
  },
];

export const getLevelFromScore = (score: number): { level: string; description: string; message: string } => {
  if (score >= 91) return { level: 'C2', description: 'Maestría - Dominio completo', message: '¡Perfectamente! Eres prácticamente bilingüe' };
  if (score >= 76) return { level: 'C1', description: 'Avanzado - Muy dominado', message: '¡Muy bien! Dominas muy bien' };
  if (score >= 56) return { level: 'B2', description: 'Intermedio-Alto - Competente', message: '¡Excelente! Nivel competente' };
  if (score >= 36) return { level: 'B1', description: 'Intermedio - Desarrollo', message: '¡Vas bien! Continúa mejorando' };
  if (score >= 21) return { level: 'A2', description: 'Elemental - Bajo', message: 'Buen inicio, sigue practicando' };
  return { level: 'A1', description: 'Principiante - Muy básico', message: 'Necesitas más práctica fundamental' };
};
