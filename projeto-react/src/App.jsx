import { useState, useEffect } from "react";
import { auth, db } from "./firebase"; // Importe o db aqui
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue } from "firebase/database"; // Importe o ref e onValue
import PainelAdmin from "./PainelAdmin";
import Auth from "./Auth";
import GerenciadorTarefas from "./GerenciadorTarefas";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Novo estado para controlar o ADM

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Busca a role do usuário no Banco de Dados
        const userRef = ref(db, `usuarios/${currentUser.uid}/role`);
        onValue(userRef, (snapshot) => {
          setIsAdmin(snapshot.val() === "admin");
          setLoading(false);
        });
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
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

      {/* Se for Admin, mostra o Painel ANTES das tarefas */}
      {user && isAdmin && <PainelAdmin />}

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