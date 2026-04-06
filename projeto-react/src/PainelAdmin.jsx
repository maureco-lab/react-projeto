import { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, onValue, update } from "firebase/database";

function PainelAdmin() {
  const [abaAtiva, setAbaAtiva] = useState("flags"); // 'flags' ou 'usuarios'
  const [flags, setFlags] = useState({});
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    // 1. Escuta as Flags (Configurações Globais)
    const settingsRef = ref(db, "settings");
    onValue(settingsRef, (snapshot) => {
      setFlags(snapshot.val() || {});
    });

    // 2. Escuta a lista de usuários registrados
    const usersRef = ref(db, "usuarios");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.entries(data).map(([id, valores]) => ({
          id,
          ...valores,
        }));
        setUsuarios(lista);
      }
    });
  }, []);

  // Função para ligar/desligar as flags
  const alternarFlag = (nomeFlag, valorAtual) => {
    update(ref(db, "settings"), { [nomeFlag]: !valorAtual });
  };

  // Função para mudar permissão de usuário
  const mudarRole = (uId, roleAtual) => {
    const novaRole = roleAtual === "admin" ? "user" : "admin";
    update(ref(db, `usuarios/${uId}`), { role: novaRole });
  };

  return (
    <div className="card" style={{ marginTop: '20px', border: '2px solid var(--primary)' }}>
      <h2 style={{ textAlign: 'center', color: 'var(--primary)' }}>🛡️ Painel Administrativo</h2>
      
      {/* Menu de Abas */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setAbaAtiva("flags")}
          className={abaAtiva !== "flags" ? "btn-secondary" : ""}
        >
          ⚙️ Funções (Flags)
        </button>
        <button 
          onClick={() => setAbaAtiva("usuarios")}
          className={abaAtiva !== "usuarios" ? "btn-secondary" : ""}
        >
          👥 Usuários
        </button>
      </div>

      {/* Conteúdo da Aba de Flags */}
      {abaAtiva === "flags" && (
        <div>
          <h3>Controle de Recursos</h3>
          <div className="task-item">
            <span>Permitir Upload de Imagens</span>
            <button 
              onClick={() => alternarFlag("mostrarUploadImage", flags.mostrarUploadImage)}
              style={{ width: 'auto', padding: '8px 15px', backgroundColor: flags.mostrarUploadImage ? '#22c55e' : '#ef4444' }}
            >
              {flags.mostrarUploadImage ? "ATIVO" : "INATIVO"}
            </button>
          </div>
          {/* Você pode adicionar mais flags aqui no futuro */}
        </div>
      )}

      {/* Conteúdo da Aba de Usuários */}
      {abaAtiva === "usuarios" && (
        <div>
          <h3>Lista de Acessos</h3>
          {usuarios.map((u) => (
            <div key={u.id} className="task-item" style={{ fontSize: '14px' }}>
              <div style={{ flex: 1 }}>
                <strong>{u.email}</strong> <br />
                <span style={{ color: 'var(--text-muted)' }}>ID: {u.id.substring(0, 8)}...</span>
              </div>
              <button 
                className="btn-secondary" 
                style={{ width: 'auto', fontSize: '12px' }}
                onClick={() => mudarRole(u.id, u.role)}
              >
                Cargo: {u.role === "admin" ? "⭐ ADM" : "👤 User"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PainelAdmin;