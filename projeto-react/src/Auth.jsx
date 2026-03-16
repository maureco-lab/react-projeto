import { useState } from "react";
import { auth } from "./firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";

function Auth({ usuarioLogado }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modoLogin, setModoLogin] = useState(true); // Alterna entre Login e Cadastro
  const [erro, setErro] = useState("");

  const lidarComSubmissao = async (e) => {
    e.preventDefault();
    setErro("");

    try {
      if (modoLogin) {
        // Logar usuário existente
        await signInWithEmailAndPassword(auth, email, senha);
      } else {
        // Criar novo usuário
        await createUserWithEmailAndPassword(auth, email, senha);
      }
    } catch (error) {
      setErro("Erro: " + error.message);
    }
  };

  const deslogar = () => signOut(auth);

  if (usuarioLogado) {
    return (
      <div style={{ marginBottom: "20px" }}>
        <p>Bem-vindo, <strong>{usuarioLogado.email}</strong>!</p>
        <button onClick={deslogar}>Sair da Conta</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>{modoLogin ? "Login" : "Criar Conta"}</h2>
      <form onSubmit={lidarComSubmissao}>
        <input 
          type="email" 
          placeholder="E-mail" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <br /><br />
        <input 
          type="password" 
          placeholder="Senha (mín. 6 caracteres)" 
          value={senha}
          onChange={(e) => setSenha(e.target.value)} 
          required 
        />
        <br /><br />
        <button type="submit">{modoLogin ? "Entrar" : "Cadastrar"}</button>
      </form>
      
      {erro && <p style={{ color: "red" }}>{erro}</p>}

      <p onClick={() => setModoLogin(!modoLogin)} style={{ cursor: "pointer", color: "blue", fontSize: "0.9em" }}>
        {modoLogin ? "Não tem conta? Crie uma aqui." : "Já tem conta? Faça login."}
      </p>
    </div>
  );
}

export default Auth;