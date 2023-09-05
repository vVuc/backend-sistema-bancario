import bancodedados from "../bancodedados.js";
import { format } from "date-fns";

const { contas, banco, depositos, saques, transferencias } = bancodedados;

const listarContas = (req, res) => {
  try {
    const { senha_banco } = req.query;

    if (banco.senha !== senha_banco)
      return res.status(401).json({ mensagem: "Senha errada" });

    return res.status(200).json(contas);
  } catch (err) {
    return res.status(500).json({ mensagem: err.message });
  }
};
const criarConta = (req, res) => {
  try {
    const { nome, data_nascimento, telefone, senha } = req.body;
    const { cpf, email } = req.autorizado;

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha)
      return res
        .status(400)
        .json({ mensagem: "Prencha todas os campos para se cadastrar" });

    if (typeof senha !== "string")
      return res.status(400).json({ mensagem: "Senha invalida" });

    let numeroDeConto = contas.length
      ? Number(contas[contas.length - 1].numero)
      : 0;
    const novoUsuario = {
      numero: `${++numeroDeConto}`,
      saldo: 0,
      usuario: {
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha,
      },
    };
    contas.push(novoUsuario);
    return res.status(201).json(novoUsuario);
  } catch (err) {
    return res.status(500).json({ mensagem: err.message });
  }
};

const atualizarUsuario = (req, res) => {
  try {
    const { nome, data_nascimento, telefone, senha } = req.body;
    const { cpf, email } = req.autorizado;
    const { contaEncontrada } = req.contas;

    const usuario = contaEncontrada.usuario;

    if (!nome && !cpf && !data_nascimento && !telefone && !email && !senha)
      return res.status(400).json({ mensagem: "Nenhum dado foi enviado" });

    usuario.nome = nome ?? usuario.nome;
    usuario.cpf = cpf ?? usuario.cpf;
    usuario.data_nascimento = data_nascimento ?? usuario.data_nascimento;
    usuario.telefone = telefone ?? usuario.telefone;
    usuario.email = email ?? usuario.email;
    usuario.senha = senha ?? usuario.senha;

    return res.status(200).json({ mensagem: "Conta atualizada com sucesso" });
  } catch (err) {
    return res.status(500).json({ mensagem: err.message });
  }
};
const depositar = (req, res) => {
  try {
    const { valor } = req.body;
    const { contaEncontrada } = req.contas;

    if (isNaN(valor))
      return res.status(400).json({ mensagem: "O valor é invalido" });

    if (valor <= 0)
      return res.status(400).json({
        mensagem:
          "não são permitidos depósitos com valores negativos ou zerados",
      });

    contaEncontrada.saldo = +contaEncontrada.saldo + +valor;
    depositos.push({
      data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      numero_conta: contaEncontrada.numero,
      valor: +valor,
    });

    return res.status(200).json({ mensagem: "Depósito realizado com sucesso" });
  } catch (err) {
    return res.status(500).json({ mensagem: err.message });
  }
};
const excluirConta = (req, res) => {
  try {
    const { idDaContraEncontrada } = req.contasId;
    const { contaEncontrada } = req.contas;

    if (contaEncontrada.saldo !== 0)
      return res
        .status(400)
        .json({ mensagem: "O saldo da conta precisa estar igual a zero" });

    contas.splice(idDaContraEncontrada, 1);

    return res.status(200).json({ mensagem: "Conta excluída com sucesso" });
  } catch (err) {
    return res.status(500).json({ mensagem: err.message });
  }
};

const sacar = (req, res) => {
  try {
    const { contaEncontrada } = req.contas;
    const { valor } = req.body;

    if (contaEncontrada.saldo < valor || 0 >= valor)
      return res.status(403).json({
        mensagem:
          "O valor sacado não pode ser zero ou maior do que o saldo na conta",
      });

    contaEncontrada.saldo -= +valor;
    saques.push({
      data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      numero_conta: contaEncontrada.numero,
      valor: +valor,
    });

    return res.status(200).json({ mensagem: "Saque realizado com sucesso" });
  } catch (err) {
    return res.status(500).json({ mensagem: err.message });
  }
};

const transferir = (req, res) => {
  try {
    const { contaOrigem, contaDestino } = req.contas;
    const { valor } = req.body;

    if (contaOrigem.saldo < valor || 0 >= +valor)
      return res.status(403).json({
        mensagem:
          "O valor não pode ser menor ou igual a zero e não pode ser maior do que o saldo na conta",
      });

    contaOrigem.saldo -= +valor;
    contaDestino.saldo += +valor;

    transferencias.push({
      data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      numero_conta_origem: contaOrigem.numero,
      numero_conta_destino: contaDestino.numero,
      valor: +valor,
    });
    return res
      .status(201)
      .json({ mensagem: "Transferência realizado com sucesso" });
  } catch (err) {
    return res.status(500).json({ mensagem: err.message });
  }
};

const consultarSaldo = (req, res) => {
  try {
    const { contaEncontrada } = req.contas;
    return res.status(200).json({ saldo: contaEncontrada.saldo });
  } catch (err) {
    return res.status(500).json({ mensagem: err.message });
  }
};

const extrato = (req, res) => {
  try {
    const { contaEncontrada } = req.contas;

    const depositosDaConta = depositos.filter(
      (i) => i.numero_conta === contaEncontrada.numero
    );
    const saquesDaConta = saques.filter(
      (i) => i.numero_conta === contaEncontrada.numero
    );
    const transferenciasEnviadas = transferencias.filter(
      (i) => i.numero_conta_origem === contaEncontrada.numero
    );
    const transferenciasRecebidas = transferencias.filter(
      (i) => i.numero_conta_destino === contaEncontrada.numero
    );

    return res.status(200).json({
      depositos: depositosDaConta,
      saques: saquesDaConta,
      transferenciasEnviadas,
      transferenciasRecebidas,
    });
  } catch (err) {
    return res.status(500).json({ mensagem: err.message });
  }
};
export {
  listarContas,
  criarConta,
  atualizarUsuario,
  depositar,
  excluirConta,
  sacar,
  transferir,
  consultarSaldo,
  extrato,
};
