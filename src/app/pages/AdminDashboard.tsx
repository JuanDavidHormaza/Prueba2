import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { 
  LogOut, Users, Upload, FileText, Trash2, Plus, Search, 
  GraduationCap, BarChart3, BookOpen, Settings, Edit2, X,
  ChevronDown, Check, Filter, Eye, ToggleLeft, ToggleRight,
  FolderOpen, Tag, Download, AlertCircle
} from "lucide-react";
import { 
  mockUsers, User, UserPermissions, getDefaultPermissions, 
  mockDocuments, Document, mockSubjects, Subject, senaPrograms 
} from "../data/users";

type TabType = "overview" | "users" | "documents" | "subjects";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Selected states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  
  // Form states
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "student" as "admin" | "teacher" | "student",
    country: "",
    program: "",
  });
  
  const [newSubject, setNewSubject] = useState({
    name: "",
    description: "",
    color: "#39A900",
  });
  
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    subjectId: "",
    program: "",
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // User Management
  const handleDeleteUser = (userId: string) => {
    if (confirm("Estas seguro de eliminar este usuario?")) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ));
  };

  const handleEditUserPermissions = (user: User) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleSaveUserPermissions = (permissions: UserPermissions) => {
    if (selectedUser) {
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, permissions } : u
      ));
      setShowEditUserModal(false);
      setSelectedUser(null);
    }
  };

  const handleChangeUserRole = (userId: string, newRole: "admin" | "teacher" | "student") => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, role: newRole, permissions: getDefaultPermissions(newRole) } : u
    ));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      country: newUser.country,
      program: newUser.program,
      permissions: getDefaultPermissions(newUser.role),
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, user]);
    setShowUserModal(false);
    setNewUser({ name: "", email: "", password: "", role: "student", country: "", program: "" });
  };

  // Subject Management
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const subject: Subject = {
      id: Date.now().toString(),
      name: newSubject.name,
      description: newSubject.description,
      color: newSubject.color,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSubjects([...subjects, subject]);
    setShowSubjectModal(false);
    setNewSubject({ name: "", description: "", color: "#39A900" });
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (confirm("Estas seguro de eliminar esta asignatura?")) {
      setSubjects(subjects.filter(s => s.id !== subjectId));
    }
  };

  // Document Management
  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadForm.file) {
      const selectedSubject = subjects.find(s => s.id === uploadForm.subjectId);
      const newDoc: Document = {
        id: Date.now().toString(),
        name: uploadForm.file.name,
        subjectId: uploadForm.subjectId || null,
        subjectName: selectedSubject?.name || "Sin asignar",
        program: uploadForm.program || "Todos los programas",
        uploadedAt: new Date().toISOString().split('T')[0],
        fileType: uploadForm.file.name.split('.').pop()?.toUpperCase() || "FILE",
        size: `${(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedBy: "Administrador SENA",
      };
      setDocuments([...documents, newDoc]);
      setShowUploadModal(false);
      setUploadForm({ file: null, subjectId: "", program: "" });
    }
  };

  const handleDeleteDocument = (docId: string) => {
    if (confirm("Estas seguro de eliminar este documento?")) {
      setDocuments(documents.filter(d => d.id !== docId));
    }
  };

  const handleAssignSubject = (docId: string, subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    setDocuments(documents.map(d => 
      d.id === docId ? { 
        ...d, 
        subjectId: subjectId || null, 
        subjectName: subject?.name || "Sin asignar" 
      } : d
    ));
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Stats
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalDocuments: documents.length,
    totalSubjects: subjects.length,
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
  };

  const tabs = [
    { id: "overview", label: "Resumen", icon: BarChart3 },
    { id: "users", label: "Usuarios", icon: Users },
    { id: "documents", label: "Documentos", icon: FileText },
    { id: "subjects", label: "Asignaturas", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-border z-40 hidden lg:block">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 bg-sena-green rounded-xl flex items-center justify-center shadow-lg shadow-sena-green/25">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">English Test</h1>
              <p className="text-xs text-muted-foreground">Panel Admin</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? "bg-sena-green text-white shadow-lg shadow-sena-green/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesion
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-border z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sena-green rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-foreground">Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        {/* Mobile Tabs */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-sena-green text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 pt-32 lg:pt-0">
        <div className="p-6 lg:p-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Panel de Administracion</h2>
                <p className="text-muted-foreground">Bienvenido al centro de control de English Level Test</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Usuarios", value: stats.totalUsers, icon: Users, color: "sena-green" },
                  { label: "Usuarios Activos", value: stats.activeUsers, icon: Check, color: "sena-blue" },
                  { label: "Documentos", value: stats.totalDocuments, icon: FileText, color: "warning" },
                  { label: "Asignaturas", value: stats.totalSubjects, icon: BookOpen, color: "destructive" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-5 border border-border shadow-sm"
                  >
                    <div className={`w-12 h-12 bg-${stat.color}/10 rounded-xl flex items-center justify-center mb-3`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
                  <h3 className="font-semibold text-foreground mb-4">Distribucion de Usuarios</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Estudiantes</span>
                        <span className="font-medium">{stats.students}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-sena-green rounded-full transition-all"
                          style={{ width: `${(stats.students / stats.totalUsers) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Docentes</span>
                        <span className="font-medium">{stats.teachers}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-sena-blue rounded-full transition-all"
                          style={{ width: `${(stats.teachers / stats.totalUsers) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
                  <h3 className="font-semibold text-foreground mb-4">Acciones Rapidas</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowUserModal(true)}
                      className="flex items-center gap-2 p-3 bg-sena-green/10 text-sena-green rounded-xl hover:bg-sena-green/20 transition-all font-medium text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Nuevo Usuario
                    </button>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="flex items-center gap-2 p-3 bg-sena-blue/10 text-sena-blue rounded-xl hover:bg-sena-blue/20 transition-all font-medium text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      Subir Documento
                    </button>
                    <button
                      onClick={() => setShowSubjectModal(true)}
                      className="flex items-center gap-2 p-3 bg-warning/10 text-warning rounded-xl hover:bg-warning/20 transition-all font-medium text-sm"
                    >
                      <BookOpen className="w-4 h-4" />
                      Nueva Asignatura
                    </button>
                    <button
                      onClick={() => setActiveTab("users")}
                      className="flex items-center gap-2 p-3 bg-muted text-muted-foreground rounded-xl hover:bg-muted/80 transition-all font-medium text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      Gestionar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Gestion de Usuarios</h2>
                  <p className="text-muted-foreground">Administra usuarios y sus permisos</p>
                </div>
                <button
                  onClick={() => setShowUserModal(true)}
                  className="flex items-center gap-2 bg-sena-green text-white px-5 py-2.5 rounded-xl hover:bg-sena-green-dark transition-all font-medium shadow-lg shadow-sena-green/25"
                >
                  <Plus className="w-5 h-5" />
                  Agregar Usuario
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-sena-green/50"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="pl-12 pr-8 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-sena-green/50 appearance-none cursor-pointer"
                  >
                    <option value="all">Todos los roles</option>
                    <option value="admin">Administrador</option>
                    <option value="teacher">Docente</option>
                    <option value="student">Estudiante</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left py-4 px-5 text-sm font-medium text-muted-foreground">Usuario</th>
                        <th className="text-left py-4 px-5 text-sm font-medium text-muted-foreground">Rol</th>
                        <th className="text-left py-4 px-5 text-sm font-medium text-muted-foreground">Programa</th>
                        <th className="text-left py-4 px-5 text-sm font-medium text-muted-foreground">Estado</th>
                        <th className="text-left py-4 px-5 text-sm font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-medium ${
                                user.role === 'admin' ? 'bg-destructive' : user.role === 'teacher' ? 'bg-sena-blue' : 'bg-sena-green'
                              }`}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <select
                              value={user.role}
                              onChange={(e) => handleChangeUserRole(user.id, e.target.value as any)}
                              disabled={user.email === 'admin@gmail.com'}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer disabled:cursor-not-allowed ${
                                user.role === 'admin' 
                                  ? 'bg-destructive/10 text-destructive' 
                                  : user.role === 'teacher' 
                                  ? 'bg-sena-blue/10 text-sena-blue' 
                                  : 'bg-sena-green/10 text-sena-green'
                              }`}
                            >
                              <option value="admin">Administrador</option>
                              <option value="teacher">Docente</option>
                              <option value="student">Estudiante</option>
                            </select>
                          </td>
                          <td className="py-4 px-5">
                            <span className="text-sm text-muted-foreground">{user.program || "-"}</span>
                          </td>
                          <td className="py-4 px-5">
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              disabled={user.email === 'admin@gmail.com'}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                user.status === 'active' 
                                  ? 'bg-sena-green/10 text-sena-green hover:bg-sena-green/20' 
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                            >
                              {user.status === 'active' ? (
                                <><ToggleRight className="w-4 h-4" /> Activo</>
                              ) : (
                                <><ToggleLeft className="w-4 h-4" /> Inactivo</>
                              )}
                            </button>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditUserPermissions(user)}
                                className="p-2 text-sena-blue hover:bg-sena-blue/10 rounded-lg transition-colors"
                                title="Editar permisos"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={user.email === 'admin@gmail.com'}
                                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Diccionarios y Documentos</h2>
                  <p className="text-muted-foreground">Gestiona el material educativo por asignatura</p>
                </div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 bg-sena-green text-white px-5 py-2.5 rounded-xl hover:bg-sena-green-dark transition-all font-medium shadow-lg shadow-sena-green/25"
                >
                  <Upload className="w-5 h-5" />
                  Subir Documento
                </button>
              </div>

              {/* Documents Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        doc.fileType === 'PDF' ? 'bg-destructive/10' : 
                        doc.fileType === 'DOCX' ? 'bg-sena-blue/10' : 'bg-sena-green/10'
                      }`}>
                        <FileText className={`w-6 h-6 ${
                          doc.fileType === 'PDF' ? 'text-destructive' : 
                          doc.fileType === 'DOCX' ? 'text-sena-blue' : 'text-sena-green'
                        }`} />
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-2 text-muted-foreground hover:text-sena-blue hover:bg-sena-blue/10 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-sena-green hover:bg-sena-green/10 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-foreground mb-2 line-clamp-1">{doc.name}</h4>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <FolderOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{doc.program}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">{doc.size}</span>
                        <span className="text-muted-foreground">-</span>
                        <span className="text-muted-foreground">{doc.uploadedAt}</span>
                      </div>
                    </div>
                    
                    {/* Subject Assignment */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Asignatura
                      </label>
                      <select
                        value={doc.subjectId || ""}
                        onChange={(e) => handleAssignSubject(doc.id, e.target.value)}
                        className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sena-green/50"
                      >
                        <option value="">Sin asignar</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                ))}
              </div>

              {documents.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-border">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No hay documentos</h3>
                  <p className="text-muted-foreground mb-4">Sube tu primer documento para comenzar</p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center gap-2 bg-sena-green text-white px-5 py-2.5 rounded-xl font-medium"
                  >
                    <Upload className="w-5 h-5" />
                    Subir Documento
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Subjects Tab */}
          {activeTab === "subjects" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Asignaturas</h2>
                  <p className="text-muted-foreground">Organiza el contenido por areas tematicas</p>
                </div>
                <button
                  onClick={() => setShowSubjectModal(true)}
                  className="flex items-center gap-2 bg-sena-green text-white px-5 py-2.5 rounded-xl hover:bg-sena-green-dark transition-all font-medium shadow-lg shadow-sena-green/25"
                >
                  <Plus className="w-5 h-5" />
                  Nueva Asignatura
                </button>
              </div>

              {/* Subjects Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject) => {
                  const docsCount = documents.filter(d => d.subjectId === subject.id).length;
                  return (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                    >
                      <div 
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ backgroundColor: subject.color }}
                      />
                      <div className="flex items-start justify-between mb-4 pt-2">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${subject.color}20` }}
                        >
                          <BookOpen className="w-6 h-6" style={{ color: subject.color }} />
                        </div>
                        <button
                          onClick={() => handleDeleteSubject(subject.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <h4 className="font-semibold text-foreground mb-2">{subject.name}</h4>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{subject.description}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>{docsCount} documento{docsCount !== 1 ? 's' : ''}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{subject.createdAt}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Add User Modal */}
      <AnimatePresence>
        {showUserModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Agregar Usuario</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Nombre Completo</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-sena-green/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-sena-green/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Contrasena</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-sena-green/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Rol</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                      className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-sena-green/50"
                    >
                      <option value="student">Estudiante</option>
                      <option value="teacher">Docente</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Pais</label>
                    <input
                      type="text"
                      value={newUser.country}
                      onChange={(e) => setNewUser({ ...newUser, country: e.target.value })}
                      placeholder="Colombia"
                      className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-sena-green/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Programa SENA</label>
                  <select
                    value={newUser.program}
                    onChange={(e) => setNewUser({ ...newUser, program: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-sena-green/50"
                  >
                    <option value="">Seleccionar programa</option>
                    {senaPrograms.map((program) => (
                      <option key={program} value={program}>{program}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-sena-green text-white py-2.5 rounded-xl hover:bg-sena-green-dark transition-all font-medium"
                  >
                    Agregar Usuario
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 bg-muted text-muted-foreground py-2.5 rounded-xl hover:bg-muted/80 transition-all font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit User Permissions Modal */}
      <AnimatePresence>
        {showEditUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Editar Permisos</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.name}</p>
                </div>
                <button
                  onClick={() => { setShowEditUserModal(false); setSelectedUser(null); }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <PermissionsEditor
                permissions={selectedUser.permissions}
                onSave={handleSaveUserPermissions}
                onCancel={() => { setShowEditUserModal(false); setSelectedUser(null); }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {showSubjectModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Nueva Asignatura</h3>
                <button
                  onClick={() => setShowSubjectModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddSubject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Nombre</label>
                  <input
                    type="text"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    required
                    placeholder="Ej: Gramatica Avanzada"
                    className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-sena-green/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Descripcion</label>
                  <textarea
                    value={newSubject.description}
                    onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                    required
                    rows={3}
                    placeholder="Breve descripcion de la asignatura..."
                    className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-sena-green/50 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Color</label>
                  <div className="flex gap-2">
                    {["#39A900", "#1F4E78", "#D89E00", "#E21B3C", "#9333EA", "#06B6D4"].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewSubject({ ...newSubject, color })}
                        className={`w-10 h-10 rounded-xl transition-all ${
                          newSubject.color === color ? 'ring-2 ring-offset-2 ring-foreground scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-sena-green text-white py-2.5 rounded-xl hover:bg-sena-green-dark transition-all font-medium"
                  >
                    Crear Asignatura
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubjectModal(false)}
                    className="flex-1 bg-muted text-muted-foreground py-2.5 rounded-xl hover:bg-muted/80 transition-all font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Document Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Subir Documento</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Archivo</label>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-sena-green/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.xlsx"
                      onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                      {uploadForm.file ? (
                        <p className="text-sm font-medium text-foreground">{uploadForm.file.name}</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-foreground">Haz clic para seleccionar</p>
                          <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT, XLSX</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Asignatura</label>
                  <select
                    value={uploadForm.subjectId}
                    onChange={(e) => setUploadForm({ ...uploadForm, subjectId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-sena-green/50"
                  >
                    <option value="">Sin asignar</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Programa SENA</label>
                  <select
                    value={uploadForm.program}
                    onChange={(e) => setUploadForm({ ...uploadForm, program: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-sena-green/50"
                  >
                    <option value="">Todos los programas</option>
                    {senaPrograms.map((program) => (
                      <option key={program} value={program}>{program}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={!uploadForm.file}
                    className="flex-1 bg-sena-green text-white py-2.5 rounded-xl hover:bg-sena-green-dark transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Subir Documento
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 bg-muted text-muted-foreground py-2.5 rounded-xl hover:bg-muted/80 transition-all font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Permissions Editor Component
function PermissionsEditor({ 
  permissions, 
  onSave, 
  onCancel 
}: { 
  permissions: UserPermissions; 
  onSave: (permissions: UserPermissions) => void;
  onCancel: () => void;
}) {
  const [editedPermissions, setEditedPermissions] = useState(permissions);

  const permissionLabels: { key: keyof UserPermissions; label: string; description: string }[] = [
    { key: "canManageUsers", label: "Gestionar Usuarios", description: "Crear, editar y eliminar usuarios" },
    { key: "canManageDocuments", label: "Gestionar Documentos", description: "Subir y eliminar documentos" },
    { key: "canViewStatistics", label: "Ver Estadisticas", description: "Acceder a reportes y metricas" },
    { key: "canGiveFeedback", label: "Dar Retroalimentacion", description: "Comentar en resultados de estudiantes" },
    { key: "canTakeQuiz", label: "Realizar Pruebas", description: "Acceso a evaluaciones de ingles" },
    { key: "canViewResults", label: "Ver Resultados", description: "Ver resultados de pruebas" },
    { key: "canManageSubjects", label: "Gestionar Asignaturas", description: "Crear y editar asignaturas" },
    { key: "canConfigureLevels", label: "Configurar Niveles", description: "Ajustar rangos de evaluacion" },
  ];

  const togglePermission = (key: keyof UserPermissions) => {
    setEditedPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
        {permissionLabels.map((perm) => (
          <button
            key={perm.key}
            type="button"
            onClick={() => togglePermission(perm.key)}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
              editedPermissions[perm.key]
                ? 'border-sena-green bg-sena-green/5'
                : 'border-border bg-white hover:border-muted-foreground/30'
            }`}
          >
            <div className="text-left">
              <p className="font-medium text-foreground">{perm.label}</p>
              <p className="text-sm text-muted-foreground">{perm.description}</p>
            </div>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
              editedPermissions[perm.key] 
                ? 'bg-sena-green text-white' 
                : 'bg-muted'
            }`}>
              {editedPermissions[perm.key] && <Check className="w-4 h-4" />}
            </div>
          </button>
        ))}
      </div>
      
      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          onClick={() => onSave(editedPermissions)}
          className="flex-1 bg-sena-green text-white py-2.5 rounded-xl hover:bg-sena-green-dark transition-all font-medium"
        >
          Guardar Cambios
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-muted text-muted-foreground py-2.5 rounded-xl hover:bg-muted/80 transition-all font-medium"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
