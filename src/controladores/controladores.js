let { contas, saques, depositos, transferencias } = require("../bancodedados");
const { format } = require("date-fns");
const {
  validarCamposPreenchidos,
  validarCPFeEmail,
  validarConta,
} = require("./validacoes");
let numero = 0;

const listarContas = (req, res) => {
  return res.status(200).json(contas);
};

const criarConta = (req, res) => {
  const validarCampos = validarCamposPreenchidos(req.body);
  if (validarCampos) {
    return res.status(validarCampos.status).json({
      mensagem: validarCampos.mensagem,
    });
  }

  const validacaoCPFeEmail = validarCPFeEmail(req.body);
  if (validacaoCPFeEmail) {
    return res.status(validacaoCPFeEmail.status).json({
      mensagem: validacaoCPFeEmail.mensagem,
    });
  }

  const conta = {
    numero: ++numero,
    saldo: 0,
    usuario: { ...req.body },
  };

  contas.push(conta);

  return res.status(201).json();
};

const atualizarUsuario = (req, res) => {
  const { numeroConta } = req.params;
  const { nome, cpf, email, data_nascimento, telefone, senha } = req.body;

  const validacaoConta = validarConta(req.params);
  if (validacaoConta) {
    return res.status(validacaoConta.status).json({
      mensagem: validacaoConta.mensagem,
    });
  }
  const validarCampos = validarCamposPreenchidos(req.body);
  if (validarCampos) {
    return res.status(validarCampos.status).json({
      mensagem: validarCampos.mensagem,
    });
  }
  const validacaoCPFeEmail = validarCPFeEmail(req.body);
  if (validacaoCPFeEmail) {
    return res.status(validacaoCPFeEmail.status).json({
      mensagem: validacaoCPFeEmail.mensagem,
    });
  }

  const conta = contas.find((conta) => {
    return conta.numero === Number(numeroConta);
  });

  conta.usuario.nome = nome;
  conta.usuario.cpf = cpf;
  conta.usuario.email = email;
  conta.usuario.data_nascimento = data_nascimento;
  conta.usuario.telefone = telefone;
  conta.usuario.senha = senha;

  return res.status(201).json();
};

const deletarConta = (req, res) => {
  const { numeroConta } = req.params;
  const validacaoConta = validarConta(req.params);
  if (validacaoConta) {
    return res.status(validacaoConta.status).json({
      mensagem: validacaoConta.mensagem,
    });
  }

  const conta = contas.find((conta) => {
    return conta.numero === Number(numeroConta);
  });
  if (conta.saldo !== 0) {
    return res.status(401).json({
      mensagem: "A conta só pode ser removida se o saldo for zero!",
    });
  } else {
    contas = contas.filter((conta) => {
      return conta.numero !== Number(numeroConta);
    });

    return res.status(200).json({
      mensagem: "Conta deletada.",
    });
  }
};

const depositar = (req, res) => {
  const { numero_conta, valor } = req.body;

  if (!numero_conta || !valor) {
    return res.status(401).json({
      mensagem: "O número da conta e o valor são obrigatórios!",
    });
  }
  const conta = contas.find((conta) => {
    return conta.numero === Number(numero_conta);
  });
  if (!conta) {
    return res.status(404).json({
      mensagem: "Não existe conta para o número informado.",
    });
  }

  if (valor <= 0) {
    return res.status(401).json({
      mensagem: "Não são permitidos depósitos com valores negativos ou zerados",
    });
  } else {
    conta.saldo += valor;
  }

  const date = new Date();
  const dataDeposito = format(date, "yyyy-MM-dd HH:mm:ss");

  const registroDeposito = {
    data: dataDeposito,
    numero_conta,
    valor,
  };

  depositos.push(registroDeposito);

  return res.status(200).json();
};
const sacar = (req, res) => {
  const { numero_conta, valor, senha } = req.body;

  if (!numero_conta || !valor || !senha) {
    return res.status(401).json({
      mensagem: "O número da conta, valor e senha são obrigatórios!",
    });
  }

  const conta = contas.find((conta) => {
    return conta.numero === Number(numero_conta);
  });
  if (!conta) {
    return res.status(404).json({
      mensagem: "Não existe conta para o número informado.",
    });
  }
  if (senha !== conta.usuario.senha) {
    return res.status(404).json({
      mensagem: "A senha está incorreta!",
    });
  }
  if (conta.saldo < valor) {
    return res.status(404).json({
      mensagem: "Não há saldo disponível para realização do saque!",
    });
  } else {
    conta.saldo -= valor;
  }

  const date = new Date();
  const dataSaque = format(date, "yyyy-MM-dd HH:mm:ss");

  const registroSaque = {
    data: dataSaque,
    numero_conta,
    valor,
  };
  saques.push(registroSaque);

  return res.status(200).json();
};

const transferir = (req, res) => {
  const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

  if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
    return res.status(401).json({
      mensagem:
        "O número das contas de origem e destino, valor e senha são obrigatórios!",
    });
  }

  const contaDeOrigem = contas.find((conta) => {
    return conta.numero === Number(numero_conta_origem);
  });
  if (!contaDeOrigem) {
    return res.status(404).json({
      mensagem:
        "Não existe conta de origem de transferência para o número informado.",
    });
  }
  const contaDeDestino = contas.find((conta) => {
    return conta.numero === Number(numero_conta_destino);
  });
  if (!contaDeDestino) {
    return res.status(404).json({
      mensagem:
        "Não existe conta de destinho de transferência para o número informado.",
    });
  }

  if (senha !== contaDeOrigem.usuario.senha) {
    return res.status(404).json({
      mensagem: "A senha está incorreta!",
    });
  }
  if (contaDeOrigem.saldo < valor) {
    return res.status(404).json({
      mensagem: "Saldo insuficiente!",
    });
  } else {
    contaDeOrigem.saldo -= valor;
    contaDeDestino.saldo += valor;
  }

  const date = new Date();
  const dataTransferencia = format(date, "yyyy-MM-dd HH:mm:ss");

  const registroTransferencia = {
    data: dataTransferencia,
    numero_conta_origem,
    numero_conta_destino,
    valor,
  };

  transferencias.push(registroTransferencia);

  return res.status(200).json();
};

const saldo = (req, res) => {
  const { numero_conta, senha } = req.query;

  if (!numero_conta || !senha) {
    return res.status(401).json({
      mensagem: "O número da conta e senha são obrigatórios!",
    });
  }

  const conta = contas.find((conta) => {
    return conta.numero === Number(numero_conta);
  });
  if (!conta) {
    return res.status(404).json({
      mensagem: "Conta bancária não encontrada!",
    });
  }
  if (senha !== conta.usuario.senha) {
    return res.status(404).json({
      mensagem: "A senha está incorreta!",
    });
  }

  return res.status(200).json({ saldo: conta.saldo });
};

const extrato = (req, res) => {
  const { numero_conta, senha } = req.query;

  if (!numero_conta || !senha) {
    return res.status(401).json({
      mensagem: "O número da conta e senha são obrigatórios!",
    });
  }

  const conta = contas.find((conta) => {
    return conta.numero === Number(numero_conta);
  });
  if (!conta) {
    return res.status(404).json({
      mensagem: "Conta bancária não encontrada!",
    });
  }
  if (senha !== conta.usuario.senha) {
    return res.status(404).json({
      mensagem: "A senha está incorreta!",
    });
  }

  const depositosConta = depositos.filter((deposito) => {
    if (deposito.numero_conta === numero_conta) {
      return deposito;
    }
  });

  const saquesConta = saques.filter((saque) => {
    if (saque.numero_conta === numero_conta) {
      return saque;
    }
  });

  const transferenciasEnviadas = transferencias.filter((transferencia) => {
    if (transferencia.numero_conta_origem === numero_conta) {
      return transferencia;
    }
  });

  const transferenciasRecebidas = transferencias.filter((transferencia) => {
    if (transferencia.numero_conta_destino === numero_conta) {
      return transferencia;
    }
  });

  return res.status(200).json({
    depositos: depositosConta,
    saques: saquesConta,
    transferenciasEnviadas,
    transferenciasRecebidas,
  });
};

module.exports = {
  listarContas,
  criarConta,
  atualizarUsuario,
  deletarConta,
  depositar,
  sacar,
  transferir,
  saldo,
  extrato,
};
