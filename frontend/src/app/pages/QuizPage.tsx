import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Star, Clock, Trophy, Zap, X, GraduationCap } from "lucide-react";
import { questions } from "../data/questions";

type AnswerState = "idle" | "correct" | "incorrect";

interface UserAnswer {
  questionId: number;
  question: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  category: string;
}

export function QuizPage() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && answerState === "idle") {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && answerState === "idle") {
      handleNextQuestion();
    }
  }, [timeLeft, answerState]);

  const handleAnswerClick = (answerIndex: number) => {
    if (answerState !== "idle") return;

    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === question.correctAnswer;

    const answer: UserAnswer = {
      questionId: question.id,
      question: question.question,
      userAnswer: answerIndex,
      correctAnswer: question.correctAnswer,
      isCorrect,
      category: question.category,
    };
    setUserAnswers([...userAnswers, answer]);

    if (isCorrect) {
      setAnswerState("correct");
      setScore(score + 1);
    } else {
      setAnswerState("incorrect");
    }

    setTimeout(() => {
      handleNextQuestion();
    }, 2000);
  };

  const handleNextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(30);
      setSelectedAnswer(null);
      setAnswerState("idle");
    } else {
      const finalScore = Math.round((score / questions.length) * 100);
      const userId = localStorage.getItem("userId") || "unknown";
      const userName = localStorage.getItem("userName") || "Usuario";
      
      const testResult = {
        id: Date.now().toString(),
        userId,
        userName,
        score: finalScore,
        correctAnswers: score,
        totalQuestions: questions.length,
        answers: userAnswers,
        completedAt: new Date().toISOString(),
      };
      
      localStorage.setItem("quizScore", finalScore.toString());
      localStorage.setItem("correctAnswers", score.toString());
      localStorage.setItem("lastTestResult", JSON.stringify(testResult));
      
      navigate("/results");
    }
  };

  const answerColors = [
    { bg: "bg-answer-red", hover: "hover:bg-answer-red/90" },
    { bg: "bg-answer-blue", hover: "hover:bg-answer-blue/90" },
    { bg: "bg-answer-yellow", hover: "hover:bg-answer-yellow/90" },
    { bg: "bg-answer-green", hover: "hover:bg-answer-green/90" },
  ];

  const getButtonStyle = (index: number) => {
    if (answerState === "idle") {
      return `${answerColors[index].bg} ${answerColors[index].hover}`;
    }
    if (index === question.correctAnswer) {
      return "bg-sena-green";
    }
    if (index === selectedAnswer && answerState === "incorrect") {
      return "bg-destructive";
    }
    return "bg-muted-foreground/30";
  };

  const getDifficultyStars = () => {
    const count = question.difficulty === "Easy" ? 1 : question.difficulty === "Medium" ? 2 : 3;
    return Array(count).fill(0);
  };

  const getDifficultyLabel = () => {
    switch (question.difficulty) {
      case "Easy": return "Basico";
      case "Medium": return "Intermedio";
      case "Hard": return "Avanzado";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sena-blue via-sena-blue-light to-sena-green relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMi4yMDkgMS43OTEtNCA0LTRzNCAxLjc5MSA0IDQtMS43OTEgNC00IDQtNC0xLjc5MS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

      <div className="container mx-auto max-w-4xl px-4 py-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-lg rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-medium hidden sm:block">English Level Test</span>
          </div>
          <button
            onClick={() => setShowExitConfirm(true)}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between text-white/80 text-sm mb-2">
            <span>Pregunta {currentQuestion + 1} de {questions.length}</span>
            <span>{Math.round(progress)}% completado</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-lg">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-xl">
            <Clock className={`w-5 h-5 ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-white'}`} />
            <span className={`font-bold text-lg ${timeLeft <= 10 ? 'text-destructive' : 'text-white'}`}>
              {timeLeft}s
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-xl">
            <Trophy className="w-5 h-5 text-warning" />
            <span className="font-bold text-lg text-white">{score}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-xl">
            <Zap className="w-5 h-5 text-sena-green" />
            <span className="font-bold text-lg text-white">{userAnswers.filter(a => a.isCorrect).length}</span>
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Question Header */}
            <div className="px-6 lg:px-8 pt-6 lg:pt-8">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-sena-blue/10 text-sena-blue rounded-lg text-sm font-medium">
                  {question.category}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {getDifficultyStars().map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{getDifficultyLabel()}</span>
                </div>
              </div>
              
              <h2 className="text-xl lg:text-2xl font-bold text-foreground leading-relaxed mb-6">
                {question.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="px-6 lg:px-8 pb-6 lg:pb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswerClick(index)}
                  disabled={answerState !== "idle"}
                  className={`${getButtonStyle(index)} text-white p-5 lg:p-6 rounded-2xl text-left transition-all disabled:cursor-not-allowed shadow-lg`}
                  whileHover={answerState === "idle" ? { scale: 1.02, y: -2 } : {}}
                  whileTap={answerState === "idle" ? { scale: 0.98 } : {}}
                  animate={
                    selectedAnswer === index && answerState === "incorrect"
                      ? { x: [0, -8, 8, -8, 8, 0], transition: { duration: 0.4 } }
                      : selectedAnswer === index && answerState === "correct"
                      ? { scale: [1, 1.05, 1], transition: { duration: 0.3 } }
                      : {}
                  }
                >
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-medium text-base lg:text-lg leading-snug">{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {answerState !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`px-6 lg:px-8 py-5 text-center text-white ${
                    answerState === "correct" ? "bg-sena-green" : "bg-destructive"
                  }`}
                >
                  {answerState === "correct" ? (
                    <div className="flex items-center justify-center gap-3">
                      <Trophy className="w-6 h-6" />
                      <span className="text-lg font-bold">Correcto! +1 punto</span>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold mb-1">Incorrecto</p>
                      <p className="text-white/90 text-sm">
                        La respuesta correcta es: {question.options[question.correctAnswer]}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-warning" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Salir de la prueba?</h3>
              <p className="text-muted-foreground mb-6">
                Perderas todo tu progreso actual. Esta accion no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-3 bg-muted text-muted-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
                >
                  Continuar
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 py-3 bg-destructive text-white rounded-xl font-medium hover:bg-destructive/90 transition-colors"
                >
                  Salir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
