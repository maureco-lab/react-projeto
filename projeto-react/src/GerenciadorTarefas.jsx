import { useState, useEffect } from "react";
import { db } from "./firebase"; 
import { ref, push, onValue, remove, update } from "firebase/database";

function GerenciadorTarefas({ userId }) {
  const [textoTarefa, setTextoTarefa] = useState("");
  const [listaTarefas, setListaTarefas] = useState([]);

  // Referência base para o caminho: usuarios/ID_DO_USUARIO/tarefas
  const caminhoTarefas = `usuarios/${userId}/tarefas`;

  // --- CREATE ---
  const salvarTarefa = (e) => {
    e.preventDefault();
    if (textoTarefa.trim() === "") return;

    const tarefasRef = ref(db, caminhoTarefas);
    push(tarefasRef, {
      nome: textoTarefa,
      concluida: false,
      dataCriacao: new Date().toISOString()
    });
    
    setTextoTarefa("");
  };

  // --- READ (Tempo Real) ---
  useEffect(() => {
    const tarefasRef = ref(db, caminhoTarefas);
    
    const unsubscribe = onValue(tarefasRef, (snapshot) => {
      const data = snapshot.val();
      const tarefasFormatadas = [];
      
      for (let id in data) {
        tarefasFormatadas.push({ id, ...data[id] });
      }
      
      setListaTarefas(tarefasFormatadas);
    });

    return () => unsubscribe(); // Limpa o listener ao desmontar
  }, [userId, caminhoTarefas]);

  // --- UPDATE ---
  const alternarConclusao = (id, statusAtual) => {
    const tarefaRef = ref(db, `${caminhoTarefas}/${id}`);
    update(tarefaRef, { concluida: !statusAtual });
  };

  // --- DELETE ---
  const excluirTarefa = (id) => {
    const tarefaRef = ref(db, `${caminhoTarefas}/${id}`);
    remove(tarefaRef);
  };

  return (
    <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "10px" }}>
      <h3>Minhas Tarefas Privadas</h3>
      
      <form onSubmit={salvarTarefa} style={{ display: "flex", gap: "10px" }}>
        <input 
          type="text"
          placeholder="Nova tarefa..."
          value={textoTarefa}
          onChange={(e) => setTextoTarefa(e.target.value)}
          style={{ flex: 1, padding: "8px" }}
        />
        <button type="submit" style={{ padding: "8px 15px", cursor: "pointer" }}>
          Adicionar
        </button>
      </form>

      <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
        {listaTarefas.map((item) => (
          <li key={item.id} style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            padding: "10px", 
            borderBottom: "1px solid #ddd",
            background: "white",
            marginBottom: "5px",
            borderRadius: "4px"
          }}>
            <span 
              onClick={() => alternarConclusao(item.id, item.concluida)}
              style={{ 
                cursor: "pointer", 
                textDecoration: item.concluida ? "line-through" : "none",
                color: item.concluida ? "#aaa" : "#333",
                flex: 1
              }}
            >
              {item.nome}
            </span>
            
            <button 
              onClick={() => excluirTarefa(item.id)} 
              style={{ background: "#ff4d4d", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer" }}
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
      {listaTarefas.length === 0 && <p style={{ textAlign: "center", color: "#999" }}>Lista vazia.</p>}
    </div>
  );
}

export default GerenciadorTarefas;