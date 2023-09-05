import express from "express";
import {
  atualizarUsuario,
  consultarSaldo,
  criarConta,
  depositar,
  excluirConta,
  extrato,
  listarContas,
  sacar,
  transferir,
} from "./controladores/controlador.js";
import {
  procurarConta,
  procurarContaTransferencia,
  valorValido,
  verificarDadosUnicos,
  verificarSenha,
} from "./intermediarios/intermediarios.js";

const router = express.Router();

router.get("/contas", listarContas);
router.get("/contas/extrato", procurarConta, verificarSenha, extrato);
router.get("/contas/saldo", procurarConta, verificarSenha, consultarSaldo);

router.post("/contas", verificarDadosUnicos, criarConta);
router.post(
  "/transacoes/transferir",
  procurarContaTransferencia,
  verificarSenha,
  valorValido,
  transferir
);
router.post("/transacoes/depositar", procurarConta, depositar);
router.post(
  "/transacoes/sacar",
  procurarConta,
  verificarSenha,
  valorValido,
  sacar
);

router.put(
  "/contas/:numeroConta/usuario",
  procurarConta,
  verificarDadosUnicos,
  atualizarUsuario
);

router.delete("/contas/:numeroConta", procurarConta, excluirConta);

export default router;
