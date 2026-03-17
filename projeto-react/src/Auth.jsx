import { useState } from "react";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

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
        await createUserWithEmailAndPassword(auth, email, senha);
      }
    } catch (error) {
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