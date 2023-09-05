import bancodedados from "../bancodedados.js";

const { contas } = bancodedados;

const verificarDadosUnicos = (req, res, next) => {
  try {
    const { cpf, email } = req.body;

    const cpfCadastrado = contas.find((i) => i.usuario.cpf === cpf);
    const emailCadastrado = contas.find((i) => i.usuario.email === email);

    if (cpfCadastrado && cpf)
      return res.status(422).json({ mensagem: "CPF já cadastrado" });

    if (emailCadastrado && email)
      return res.status(422).json({ mensagem: "Email já cadastrado" });

    req.autorizado = { cpf, email };

    next();
  } catch (err) {
    return res.status(500).json({ mensagem: err.message });
  }
};
const procurarConta = (req, res, next) => {
  try {
    const numeroContaParams = req.params.numeroConta;
    const numeroContaBody = req.body.numero_conta;
    const numeroContaQuery = req.query.numero_conta;
    const numeroParaConta =
      numeroContaBody ?? numeroContaParams ?? numeroContaQuery;

    const conta = contas.findIndex((i) => i.numero === numeroParaConta);

    if (conta < 0)
      return res.status(404).json({ mensagem: "Conta não encontrada" });

    req.contasId = { idDaContraEncontrada: conta };
    req.contas = { contaEncontrada: contas[conta] };
    next();
  } catch (err) {
    return res.status(500).json({ mensagem: err.message });
  }
};

const verificarSenha = (req, res, next) => {
  try {
    const { contaEncontrada, contaOrigem } = req.contas;
    const senhaQuery = req.query.senha;
    const senhaBody = req.body.senha;

    const senha = senhaQuery ?? senhaBody;
    const contaEncontradaValida = contaEncontrada ?? contaOrigem;

    if (senha === undefined || contaEncontradaValida.usuario.senha !== senha)
      return res.status(401).json({ mensagem: "senha incorreta" });

    next();
  } catch (err) {
    return res.status(500).json({ mensagem: err.message });
  }
};

const valorValido = (req, res, next) => {
  try {
    const { contaOrigem, contaEncontrada } = req.contas;
    const { valor } = req.body;
    const conta = contaOrigem ?? contaEncontrada;

    if (isNaN(valor))
      return res.status(400).json({ mensagem: "O valor é invalido" });

    if (conta.saldo < valor || 0 >= +valor)
      return res.status(403).json({
        mensagem:
          "O valor não pode ser menor ou igual a zero e não pode ser maior do que o saldo na conta",
      });

    next();
  } catch (err) {
    return res.status(500).json({ mensagem: err.message });
  }
};

const procurarContaTransferencia = (req, res, next) => {
  try {
    const { numero_conta_origem, numero_conta_destino, valor } = req.body;

    const contaOrigemId = contas.findIndex(
      (i) => i.numero === numero_conta_origem
    );
    const contaDestinoId = contas.findIndex(
      (i) => i.numero === numero_conta_destino
    );

    if (!numero_conta_origem || !numero_conta_destino || isNaN(valor))
      return res.status(400).json({
        mensagem:
          "Preencha todos os campos corretamente para realizar a transferência",
      });

    if (contaOrigemId < 0)
      return res
        .status(404)
        .json({ mensagem: "Conta de origem não encontrada" });

    if (contaDestinoId < 0)
      return res
        .status(404)
        .json({ mensagem: "Conta de destino não encontrada" });

    if (contaDestinoId === contaOrigemId)
      return res.status(400).json({
        mensagem: "Você não pode transferir dinheiro para você mesmo",
      });

    req.contasId = { contaOrigemId, contaDestinoId };
    req.contas = {
      contaOrigem: contas[contaOrigemId],
      contaDestino: contas[contaDestinoId],
      valor,
    };
    next();
  } catch (err) {
    return res.status(500).json({ mensagem: err.message });
  }
};
export {
  verificarDadosUnicos,
  procurarConta,
  verificarSenha,
  procurarContaTransferencia,
  valorValido,
};
