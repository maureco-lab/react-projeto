import { useState, useEffect } from "react";
// Importamos apenas o necessário do Database e Storage
import { db, storage } from "./firebase"; 
import { ref as dbRef, push, onValue, remove, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

function GerenciadorTarefas({ userId }) {
  const [textoTarefa, setTextoTarefa] = useState("");
  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [listaTarefas, setListaTarefas] = useState([]);
  const [enviando, setEnviando] = useState(false);
  
  // Estado que será controlado pelo seu Painel Admin
  const [podeSubirImagem, setPodeSubirImagem] = useState(false);

  const caminhoBase = `usuarios/${userId}/tarefas`;

  // useEffect corrigido para escutar o DATABASE em tempo real
  useEffect(() => {
    // 1. ESCUTA A FLAG NO BANCO (O nó que seu Painel Admin altera)
    const settingsRef = dbRef(db, "settings/mostrarUploadImage");
    
    const unsubSettings = onValue(settingsRef, (snapshot) => {
      const valorDoBanco = snapshot.val();
      // Define se mostra ou não o upload baseado no que o Admin clicou
      setPodeSubirImagem(!!valorDoBanco); 
    });

    // 2. ESCUTA AS TAREFAS
    const tarefasRef = dbRef(db, caminhoBase);
    const unsubTarefas = onValue(tarefasRef, (snapshot) => {
      const data = snapshot.val();
      const formatadas = data 
        ? Object.entries(data).map(([id, val]) => ({ id, ...val })) 
        : [];
      setListaTarefas(formatadas.reverse());
    });

    return () => {
      unsubSettings();
      unsubTarefas();
    };
  }, [userId, caminhoBase]);

  const lidarComArquivo = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagemSelecionada(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const salvarTarefa = async (e) => {
    e.preventDefault();
    if (!textoTarefa.trim() && !imagemSelecionada) return;

    setEnviando(true);
    let urlDaImagem = "";

    try {
      // Só faz o upload se a imagem existir E a flag estiver ativa no banco
      if (imagemSelecionada && podeSubirImagem) {
        const nomeArquivo = `${Date.now()}_${imagemSelecionada.name}`;
        const sRef = storageRef(storage, `usuarios/${userId}/fotos/${nomeArquivo}`);
        await uploadBytes(sRef, imagemSelecionada);
        urlDaImagem = await getDownloadURL(sRef);
      }

      await push(dbRef(db, caminhoBase), {
        nome: textoTarefa,
        concluida: false,
        url: urlDaImagem,
        dataCriacao: new Date().toISOString()
      });

      setTextoTarefa("");
      setImagemSelecionada(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: '20px' }}>Minhas Tarefas</h3>
      
      <form onSubmit={salvarTarefa}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <input 
            value={textoTarefa}
            onChange={(e) => setTextoTarefa(e.target.value)}
            placeholder="O que vamos fazer?"
            disabled={enviando}
          />
          <button 
            type="submit" 
            disabled={enviando} 
            className={imagemSelecionada ? "btn-salvar-ativo" : ""}
            style={{ width: '90px' }}
          >
            {enviando ? "..." : (imagemSelecionada ? "SALVAR" : "+")}
          </button>
        </div>

        {/* RENDERIZAÇÃO CONDICIONAL CONTROLADA PELO ADMIN */}
        {podeSubirImagem && (
          <div className="upload-container">
            <input 
              type="file" 
              id="arquivo-input" 
              className="input-file-oculto" 
              accept="image/*" 
              onChange={lidarComArquivo} 
              disabled={enviando}
            />
            <label htmlFor="arquivo-input" className="label-file">
              {imagemSelecionada ? `📷 ${imagemSelecionada.name}` : "📁 Anexar foto"}
            </label>
            
            {previewUrl && (
              <div style={{ position: 'relative', marginTop: '10px' }}>
                <img src={previewUrl} alt="Preview" className="img-preview" />
                <button 
                  type="button" 
                  className="btn-remover-preview"
                  onClick={() => {setImagemSelecionada(null); setPreviewUrl(null);}}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}
      </form>

      <div style={{ marginTop: '25px' }}>
        {listaTarefas.map((item) => (
          <div key={item.id} className="task-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span 
                className={`task-text ${item.concluida ? 'completed' : ''}`}
                onClick={() => update(dbRef(db, `${caminhoBase}/${item.id}`), { concluida: !item.concluida })}
              >
                {item.nome || "Anexo de imagem"}
              </span>
              <button className="btn-delete" onClick={() => remove(dbRef(db, `${caminhoBase}/${item.id}`))}>
                🗑️
              </button>
            </div>
            
            {item.url && (
              <a href={item.url} target="_blank" rel="noreferrer" style={{ width: '100%', marginTop: '8px' }}>
                <img src={item.url} alt="anexo" className="task-image" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GerenciadorTarefas;