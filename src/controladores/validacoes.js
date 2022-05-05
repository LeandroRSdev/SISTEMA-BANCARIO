let { contas } = require("../bancodedados");

const validarCamposPreenchidos = (dados) => {
  const { nome, cpf, email, data_nascimento, telefone, senha } = dados;

  if (!nome || !cpf || !email || !data_nascimento || !telefone || !senha) {
    return {
      status: 400,
      mensagem: "Todos os campos são obrigatórios!",
    };
  }
};

const validarCPFeEmail = (dados) => {
  const { cpf, email } = dados;

  const resultado = contas.find((campoCPF) => {
    return campoCPF.usuario.cpf === cpf || campoCPF.usuario.email === email;
  });

  if (resultado) {
    return {
      status: 401,
      mensagem: "Já existe uma conta com o cpf ou e-mail informado!",
    };
  }
};

const validarConta = (dados) => {
  const { numeroConta, numero_conta } = dados;
  const conta = contas.find((conta) => {
    return (
      conta.numero === Number(numeroConta) ||
      conta.numero === Number(numero_conta)
    );
  });
  if (!conta) {
    return {
      status: 401,
      mensagem: "Não existe conta para o número informado.",
    };
  }
};

module.exports = {
  validarCamposPreenchidos,
  validarCPFeEmail,
  validarConta,
};
