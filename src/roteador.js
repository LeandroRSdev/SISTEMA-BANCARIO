const express = require("express");

const {
  listarContas,
  criarConta,
  atualizarUsuario,
  deletarConta,
  depositar,
  sacar,
  transferir,
  saldo,
  extrato,
} = require("./controladores/controladores");

const { validarSenha } = require("./intermediarios");

const rotas = express();

rotas.get("/contas", validarSenha, listarContas);
rotas.post("/contas", criarConta);
rotas.put("/contas/:numeroConta/usuario", atualizarUsuario);
rotas.delete("/contas/:numeroConta", deletarConta);
rotas.post("/transacoes/depositar", depositar);
rotas.post("/transacoes/sacar", sacar);
rotas.post("/transacoes/transferir", transferir);
rotas.get("/contas/saldo", saldo);
rotas.get("/contas/extrato", extrato);

module.exports = rotas;
