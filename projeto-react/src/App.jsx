import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Auth from "./Auth";
import GerenciadorTarefas from "./GerenciadorTarefas";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center" }}>
        <p>Carregando app...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🎯 Tarefas Pro</h1>
        <p style={{ color: "var(--text-muted)" }}>Sua lista pessoal e segura</p>
      </div>
      
      {/* Componente de Autenticação */}
      <Auth usuarioLogado={user} />

      {/* Se o usuário estiver logado, mostra o Gerenciador */}
      {user && <GerenciadorTarefas userId={user.uid} />}

      {!user && (
        <div style={{ textAlign: "center", marginTop: "20px", color: "var(--text-muted)" }}>
          <small>Crie uma conta gratuita para começar.</small>
        </div>
      )}
    </div>
  );
}

export default App;