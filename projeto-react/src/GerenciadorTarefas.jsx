import { useState, useEffect } from "react";
import { db } from "./firebase"; 
import { ref, push, onValue, remove, update } from "firebase/database";

function GerenciadorTarefas() {
  const [textoTarefa, setTextoTarefa] = useState("");
  const [listaTarefas, setListaTarefas] = useState([]);

  // --- 1. CREATE (Criar Tarefa) ---
  const salvarTarefa = (e) => {
    e.preventDefault();
    if (textoTarefa.trim() === "") return;

    const tarefasRef = ref(db, "minhas_tarefas");
    push(tarefasRef, {
      nome: textoTarefa,
      concluida: false,
      dataCriacao: new Date().toLocaleString()
    });
    
    setTextoTarefa(""); // Limpa o campo
  };

  // --- 2. READ (Ler Dados em Tempo Real) ---
  useEffect(() => {
    const tarefasRef = ref(db, "minhas_tarefas");
    
    // O onValue fica vigiando o Firebase. Se algo mudar lá, ele avisa o React.
    onValue(tarefasRef, (snapshot) => {
      const data = snapshot.val();
      const tarefasFormatadas = [];
      
      for (let id in data) {
        tarefasFormatadas.push({ id, ...data[id] });
      }
      
      setListaTarefas(tarefasFormatadas);
    });
  }, []);

  // --- 3. UPDATE (Alternar entre concluída ou não) ---
  const alternarConclusao = (id, statusAtual) => {
    const tarefaRef = ref(db, `minhas_tarefas/${id}`);
    update(tarefaRef, { concluida: !statusAtual });
  };

  // --- 4. DELETE (Remover do Banco) ---
  const excluirTarefa = (id) => {
    const tarefaRef = ref(db, `minhas_tarefas/${id}`);
    remove(tarefaRef);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
      <h2>📝 Minha Lista Firebase</h2>
      
      <form onSubmit={salvarTarefa}>
        <input 
          type="text"
          placeholder="O que precisa fazer?"
          value={textoTarefa}
          onChange={(e) => setTextoTarefa(e.target.value)}
          style={{ padding: "8px", width: "70%" }}
        />
        <button type="submit" style={{ padding: "8px" }}>Add</button>
      </form>

      <div style={{ marginTop: "20px" }}>
        {listaTarefas.length === 0 && <p>Nenhuma tarefa por aqui...</p>}
        
        {listaTarefas.map((item) => (
          <div key={item.id} style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            padding: "10px",
            borderBottom: "1px solid #eee",
            textDecoration: item.concluida ? "line-through" : "none",
            color: item.concluida ? "gray" : "black"
          }}>
            <span onClick={() => alternarConclusao(item.id, item.concluida)} style={{ cursor: "pointer" }}>
              {item.nome}
            </span>
            
            <button 
              onClick={() => excluirTarefa(item.id)} 
              style={{ background: "red", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GerenciadorTarefas;