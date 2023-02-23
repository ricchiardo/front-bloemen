setTimeout(() => {
  const botoes = [...document.querySelectorAll(".calendar-base")];
  const botoesFiltrados = botoes.filter(botao => botao.className.includes('activeDayColor-'));
  botoesFiltrados.forEach((botao) => {
    const [child] = botao.children;
    botao.onclick = () =>
      (location.href = "http://localhost:5500/ingressos.html");
  });
}, 2000);

let resposeRequest;

const testScroll = document.querySelector(".corpo-infos");
const scrollHide = document.querySelector(".corpo-infosHide");

function animaScroll() {
  const scrollTop = testScroll.getBoundingClientRect().top;
  if (scrollTop < 0) {
    scrollHide.style.transform = "translateY(0px)";
  } else {
    scrollHide.style.transform = "translateY(-85px)";
  }
}

window.addEventListener("scroll", animaScroll);

async function pegarDadosMercadoria() {
  try {
    const response = await fetch(
      "https://sofalta.eu/api/baratheon/v4/empreendimentos/bloemenpark/produtos/ingressos/web?data=2023-03-01"
    );
    const responseJson = await response.json();
    resposeRequest = responseJson;
    //console.log(responseJson);
    const tituloMercadoria = document.querySelector(".corpo-mercadorias");
    responseJson.itens.forEach((mercadoria, index) => {
      const divMercadoria = criarMercadoria(mercadoria, index);
      tituloMercadoria.appendChild(divMercadoria);
    });
    const nomeGrupo = document.querySelector(".corpo-grupo");
    responseJson.grupos.forEach((grupo) => {
      const botaoGrupo = criarGrupo(grupo);
      nomeGrupo.appendChild(botaoGrupo);
    });
  } catch (erro) {
    console.error(erro);
  }
}

function criarMercadoria(mercadoria, index) {
  //console.log(mercadoria);
  const conferirQuantidade = localStorageContador.getItem() || {};

  //console.log(conferirQuantidade[mercadoria.iditens]);

  const div = document.createElement("div");
  div.classList.add("mercadoria");
  div.innerHTML = `
  <div class="img-mercadoria"> 
  <img src="${mercadoria.imagem}">
  </div>
  <div class="titulo-preco-mercadoria">
  <div class="texto-titulo">
  <span class="titulo">${mercadoria.nome}</span>
  </div>
  <div class="preco-mercadoria">
  <div class="texto-preco-mercadoria">
  <span class="moeda">R$</span>
  <span class="preco">${gerarPrecoMercadoria(mercadoria.valorOriginal)}</span>
    </div>
    </div>
    </div>
    <div class="descricao-mercadoria">
    <p>${mercadoria.descricao}</p>
    </div>
    <div class="regras-mercadoria">
    <div class="regra">
    <div class="regra-escrito">
    <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
    <span>Regras e condições</span>
    </div>
    </div>
  </div>
  <div class="botao-mercadoria">
  <div class="botao" id="${mercadoria.iditens}">
    ${
      conferirQuantidade[mercadoria.iditens] &&
      conferirQuantidade[mercadoria.iditens].quantidade > 0
        ? botaoComprando(
            index,
            conferirQuantidade[mercadoria.iditens].quantidade
          )
        : botaoComprarOriginal()
    }
  </div>
  </div>`;

  return div;
}

function botaoComprarOriginal() {
  return `<p class"contador">Comprar</p>`;
}

function botaoComprando(index, contador) {
  return `<div class="less-${index}" style="width: 34%; text-align: center; height: 100%; cursor: pointer;display: flex; justify-content: center; align-items: center; background-color: #01549D;color: white;">-</div>
  <div class="value-${index}" style="width: 33%; text-align: center;height: 100%;display: flex; justify-content: center; align-items: center;"><span class="value-text">${contador}</span></div>
  <div class="plus" style="width: 33%; text-align: center; height: 100%;cursor: pointer;display: flex; justify-content: center; align-items: center; background-color: #01549D;color: white;">+</div>`;
}

function criarGrupo(grupo) {
  const botaoGrupo = document.createElement("button");
  botaoGrupo.classList.add("botao-grupo");
  botaoGrupo.innerHTML = `<span>${grupo.nome}</span>`;

  return botaoGrupo;
}

window.addEventListener("load", async () => {
  const contadorLocalStorage = CartCount();

  const valueLocalStorage = CashCount();

  if (contadorLocalStorage) {
    document.querySelector(".bolinha-contador").innerText =
      contadorLocalStorage;
    document.querySelector(".bolinha-contador2").innerText =
      contadorLocalStorage;
  }

  if (valueLocalStorage) {
    document.querySelector(".preco-box").innerText = valueLocalStorage;
    document.querySelector(".preco-box2").innerText = valueLocalStorage;
  }

  await pegarDadosMercadoria();
  const botaoComprar = document.querySelectorAll(".botao");

  botaoComprar.forEach((botao, index) => {
    var contador = localStorageContador.getItem()[botao.id]?.quantidade || 0;

    botao.addEventListener("click", function () {
      botao.innerHTML = botaoComprando(index, ++contador);

      const lessButton = document.querySelector(`.less-${index}`);
      const value = document.querySelector(`.value-${index}`);

      if (contador <= 0) {
        botao.innerHTML = botaoComprarOriginal();
      }

      lessButton.addEventListener("click", () => {
        contador--;
        value.innerHTML = --contador;
      });

      const cartHideCount = document.querySelector(".bolinha-contador");
      const cartCount = document.querySelector(".bolinha-contador2");

      const valueTotalHide = document.querySelector(".preco-box");
      const valueTotal = document.querySelector(".preco-box2");

      const buttonFinalizar = document.querySelector(".finalizar-compra");

      const idAndCount = localStorageContador.getItem();

      idAndCount[botao.id] = {
        quantidade: contador,
        valor: buscaValor(botao.id),
      };

      const { valorTotal, quantidadeTotal } = CartAndCashCount(idAndCount);

      localStorageContador.setItem(idAndCount);

      cartHideCount.innerText = quantidadeTotal;
      cartCount.innerText = quantidadeTotal;

      valueTotalHide.innerText = `R$ ${gerarPrecoMercadoria(valorTotal)}`;
      valueTotal.innerText = `R$ ${gerarPrecoMercadoria(valorTotal)}`;

      buttonFinalizar.style.backgroundColor =
        quantidadeTotal > 0 ? "#83ba31" : "#c4cdd4";
    });
  });
});

const localStorageContador = {
  getItem: () => JSON.parse(localStorage.getItem("contador")) || {},
  setItem: (value) => localStorage.setItem("contador", JSON.stringify(value)),
};

function CartCount() {
  let countCart = localStorageContador.getItem() || 0;
  let arrayCount = Object.values(countCart);
  var soma = 0;

  for (let i = 0; i < arrayCount.length; i++) {
    const { quantidade } = arrayCount[i];
    soma += quantidade;
  }
  return soma;
}

function CashCount() {
  let cashCountCart = localStorageContador.getItem() || 0;
  let arrayCashCount = Object.values(cashCountCart);
  const reduceCashCount = arrayCashCount.reduce((acc, item) => {
    return (acc += item.quantidade * item.valor);
  }, 0);
  return `R$ ${gerarPrecoMercadoria(reduceCashCount)}`;
}

function CartAndCashCount(cashCountCart) {
  let arrayCashCount = Object.values(cashCountCart);
  return arrayCashCount.reduce(count, { valorTotal: 0, quantidadeTotal: 0 });
}

function count(acc, item) {
  console.log(item);
  const quantidadeTotal = acc.quantidadeTotal + item.quantidade;
  const valorTotal = (acc.valorTotal += item.valor * item.quantidade);
  return { valorTotal, quantidadeTotal };
}

function buscaValor(iditens) {
  const { valorOriginal } = resposeRequest.itens.find(
    (item) => item.iditens === iditens
  );
  return valorOriginal;
}

function gerarPrecoMercadoria(valorOriginal) {
  return (valorOriginal / 100).toFixed(2).replace(".", ",");
}

const divOpen = document.querySelector(".corpo-infos");
const divSeta = document.querySelector(".infos-boxs");
const divInfos = criarDivInfos();

function openDiv() {
  this.classList.toggle("ativo");
  divSeta.classList.toggle("ativo");
  if(divOpen.classList.contains('ativo') && divSeta.classList.contains('ativo')) {
    this.style.transform = "scale(1.05)";
    this.style.transition = "0.5s";
    this.style.height = "174px";
    divOpen.appendChild(divInfos);

    divSeta.style.transform = "translateY(-3px) rotate(180deg)";

  } else {
    this.style.removeProperty("transform");
    this.style.removeProperty("height");
    divOpen.removeChild(divInfos);

    divSeta.style.transform = "translateY(5px)";

  }
}

function criarDivInfos() {
  const div = document.createElement("div");
    div.innerHTML = `
      <div class="mercadorias-carrinho">
      <p>Nenhum produto adicionado ao carrinho</p>
      </div>
    `;
    return div;
}

divOpen.addEventListener("click", openDiv);
divSeta.addEventListener("click", openDiv);

