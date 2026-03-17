import { useState, useEffect } from "react";
import { db } from "./firebase"; 
import { ref, push, onValue, remove, update } from "firebase/database";

function GerenciadorTarefas({ userId }) {
  const [textoTarefa, setTextoTarefa] = useState("");
  const [listaTarefas, setListaTarefas] = useState([]);
  const caminhoBase = `usuarios/${userId}/tarefas`;

  useEffect(() => {
    const tarefasRef = ref(db, caminhoBase);
    const unsubscribe = onValue(tarefasRef, (snapshot) => {
      const data = snapshot.val();
      const formatadas = data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : [];
      setListaTarefas(formatadas);
    });
    return () => unsubscribe();
  }, [userId]);

  const adicionar = (e) => {
    e.preventDefault();
    if (!textoTarefa.trim()) return;
    push(ref(db, caminhoBase), { nome: textoTarefa, concluida: false });
    setTextoTarefa("");
  };

  const alternar = (id, status) => update(ref(db, `${caminhoBase}/${id}`), { concluida: !status });
  const excluir = (id) => remove(ref(db, `${caminhoBase}/${id}`));

  return (
    <div className="card">
      <h3 style={{ marginBottom: "20px" }}>Minhas Tarefas</h3>
      <form onSubmit={adicionar} style={{ display: "flex", gap: "10px" }}>
        <input 
          value={textoTarefa} 
          onChange={(e) => setTextoTarefa(e.target.value)} 
          placeholder="O que precisa ser feito?" 
        />
        <button type="submit" style={{ width: "auto" }}>+</button>
      </form>

      <div style={{ marginTop: "20px" }}>
        {listaTarefas.map((t) => (
          <div key={t.id} className="task-item">
            <span 
              className={`task-text ${t.concluida ? 'completed' : ''}`} 
              onClick={() => alternar(t.id, t.concluida)}
            >
              {t.nome}
            </span>
            <button className="btn-delete" onClick={() => excluir(t.id)}>Excluir</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GerenciadorTarefas;