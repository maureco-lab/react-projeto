import { useState, useEffect } from "react";
// 1. Adicionado remoteConfig na importação local
import { db, storage, remoteConfig } from "./firebase"; 
import { ref as dbRef, push, onValue, remove, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
// 2. Adicionadas funções do Remote Config
import { getValue, fetchAndActivate } from "firebase/remote-config";

function GerenciadorTarefas({ userId }) {
  const [textoTarefa, setTextoTarefa] = useState("");
  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [listaTarefas, setListaTarefas] = useState([]);
  const [enviando, setEnviando] = useState(false);
  
  // 3. Novo estado para a Feature Flag
  const [podeSubirImagem, setPodeSubirImagem] = useState(false);

  const caminhoBase = `usuarios/${userId}/tarefas`;

  // 4. useEffect para buscar a Feature Flag no Firebase
  useEffect(() => {
    const buscarFlags = async () => {
      try {
        // Força a atualização (0 ms de cache para teste, mude para 3600000 em produção)
        remoteConfig.settings.minimumFetchIntervalMillis = 0;
        await fetchAndActivate(remoteConfig);
        
        // Pega o valor da flag (certifique-se que o nome no console é "mostrar_upload")
        const habilitado = getValue(remoteConfig, "mostrarUploadImage").asBoolean();
        setPodeSubirImagem(habilitado);
      } catch (error) {
        console.error("Erro ao carregar Remote Config:", error);
      }
    };
    buscarFlags();
  }, []);

  useEffect(() => {
    const tarefasRef = dbRef(db, caminhoBase);
    const unsubscribe = onValue(tarefasRef, (snapshot) => {
      const data = snapshot.val();
      const formatadas = data 
        ? Object.entries(data).map(([id, val]) => ({ id, ...val })) 
        : [];
      setListaTarefas(formatadas.reverse());
    });
    return () => unsubscribe();
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
      if (imagemSelecionada && podeSubirImagem) { // Verifica a flag também no salvamento
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
      alert("Erro ao salvar. Verifique sua conexão.");
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

        {/* 5. CONDICIONAL DA FEATURE FLAG ENVOLVENDO O UPLOAD */}
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
                
                <div className="aviso-confirmar">
                  ⚠️ Clique em SALVAR para confirmar a foto!
                </div>

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
        {/* FIM DA CONDICIONAL */}
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