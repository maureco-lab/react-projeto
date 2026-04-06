import { useState } from "react";
import { auth, db } from "./firebase"; // Importe o 'db' também
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { ref, update, get } from "firebase/database"; // Importes do Database

function Auth({ usuarioLogado }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modoLogin, setModoLogin] = useState(true);
  const [erro, setErro] = useState("");

  const lidarComSubmissao = async (e) => {
    e.preventDefault();
    setErro("");
    try {
      if (modoLogin) {
        await signInWithEmailAndPassword(auth, email, senha);
      } else {
        // 1. Cria o usuário no Auth
        const resultado = await createUserWithEmailAndPassword(auth, email, senha);
        const user = resultado.user;

        // 2. Registra o usuário no Realtime Database (Nó usuários)
        // Usamos update para não apagar dados caso o nó já exista
        await update(ref(db, `usuarios/${user.uid}`), {
          email: user.email,
          role: "user", 
          dataCadastro: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error(error);
      setErro("Ops! Verifique seus dados.");
    }
  };

  if (usuarioLogado) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <p>Logado como: <strong>{usuarioLogado.email}</strong></p>
        <button className="btn-secondary" onClick={() => signOut(auth)}>Sair da Conta</button>
      </div>
    );
  }

  // ... (mantenha o restante do seu return original igual)
  return (
    <div className="card">
      <h2>{modoLogin ? "Entrar" : "Criar Conta"}</h2>
      <form onSubmit={lidarComSubmissao}>
        <input type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        <button type="submit">{modoLogin ? "Entrar" : "Cadastrar"}</button>
      </form>
      {erro && <p style={{ color: "red", fontSize: "14px", textAlign: "center" }}>{erro}</p>}
      <button className="btn-secondary" onClick={() => setModoLogin(!modoLogin)}>
        {modoLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça Login"}
      </button>
    </div>
  );
}

export default Auth;