import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Auth from "./Auth";
import GerenciadorTarefas from "./GerenciadorTarefas";

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

  if (loading) return <div style={{ padding: "20px" }}>Carregando...</div>;

  return (
    <div style={{ 
      fontFamily: "Arial, sans-serif", 
      maxWidth: "600px", 
      margin: "0 auto", 
      padding: "20px" 
    }}>
      <h1 style={{ textAlign: "center" }}>Lista de Tarefas</h1>
      
      {/* Passamos o usuário logado para o componente de Auth */}
      <Auth usuarioLogado={user} />

      <hr style={{ margin: "30px 0" }} />

      {/* Renderização Condicional: Só mostra o CRUD se houver um usuário */}
      {user ? (
        <GerenciadorTarefas userId={user.uid} />
      ) : (
        <div style={{ textAlign: "center", color: "#666" }}>
          <p>Você precisa estar logado para gerenciar suas tarefas.</p>
        </div>
      )}
    </div>
  );
}

export default App;