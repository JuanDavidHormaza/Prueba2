import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, GraduationCap, ArrowLeft, User, Mail, Lock, MapPin, BookOpen, Check } from "lucide-react";
import { senaPrograms } from "../data/users";

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    program: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Las contrasenas no coinciden");
      return;
    }
    if (!formData.acceptTerms) {
      alert("Debes aceptar los terminos y condiciones");
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    localStorage.setItem("userName", formData.fullName);
    localStorage.setItem("userRole", "student");
    localStorage.setItem("userId", Date.now().toString());
    localStorage.setItem("userProgram", formData.program);
    
    navigate("/dashboard");
  };

  const countries = [
    "Colombia", "Mexico", "Argentina", "Chile", "Peru", 
    "Ecuador", "Venezuela", "Bolivia", "Paraguay", "Uruguay"
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-sena-blue via-sena-blue-light to-sena-green relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOSAxLjc5MS00IDQtNHM0IDEuNzkxIDQgNC0xLjc5MSA0LTQgNC00LTEuNzkxLTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center max-w-md"
          >
            <div className="w-24 h-24 bg-white/10 backdrop-blur-lg rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <GraduationCap className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-bold mb-4 text-balance">
              Unete a la comunidad SENA
            </h3>
            <p className="text-white/80 text-lg leading-relaxed mb-8">
              Crea tu cuenta y comienza a evaluar tu nivel de ingles con herramientas interactivas y retroalimentacion personalizada.
            </p>
            
            {/* Features */}
            <div className="space-y-4 text-left">
              {[
                "Evaluaciones interactivas estilo Kahoot",
                "Retroalimentacion de docentes",
                "Certificado de nivel oficial",
                "Seguimiento de progreso"
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-white/90">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            className="absolute top-20 right-20 w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-lg"
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-32 left-20 w-16 h-16 bg-white/10 rounded-xl backdrop-blur-lg"
            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md my-8"
        >
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-sena-green rounded-xl flex items-center justify-center shadow-lg shadow-sena-green/25">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">English Level Test</h1>
              <p className="text-sm text-muted-foreground">Plataforma SENA</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-2">Crear cuenta</h2>
          <p className="text-muted-foreground mb-8">Registrate para comenzar tu evaluacion</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="fullName"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-sena-green/50 focus:border-sena-green transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Correo Electronico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-sena-green/50 focus:border-sena-green transition-all"
                />
              </div>
            </div>

            {/* Country & Program Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-foreground mb-2">
                  Pais
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-sena-green/50 focus:border-sena-green transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Seleccionar</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Program */}
              <div>
                <label htmlFor="program" className="block text-sm font-medium text-foreground mb-2">
                  Programa
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    id="program"
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-sena-green/50 focus:border-sena-green transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Seleccionar</option>
                    {senaPrograms.map((program) => (
                      <option key={program} value={program}>{program}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Contrasena
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-sena-green/50 focus:border-sena-green transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirmar Contrasena
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repite tu contrasena"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-sena-green/50 focus:border-sena-green transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 py-2">
              <input
                id="terms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                required
                className="mt-1 w-5 h-5 rounded border-border text-sena-green focus:ring-sena-green/50 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                Acepto los{" "}
                <span className="text-sena-green hover:underline">terminos y condiciones</span>
                {" "}y la{" "}
                <span className="text-sena-green hover:underline">politica de privacidad</span>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sena-green text-white py-4 rounded-xl font-semibold hover:bg-sena-green-dark transition-all shadow-lg shadow-sena-green/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.99 }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Crear Cuenta"
              )}
            </motion.button>

            {/* Login Link */}
            <p className="text-center text-muted-foreground">
              Ya tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sena-green hover:text-sena-green-dark font-medium transition-colors"
              >
                Iniciar sesion
              </button>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
