$(document).ready(function () {
    cardapio.eventos.init();
})

var cardapio = {};

var carrinho = [];

var meuEndereco = null;

var valorCarrinho = 0;
var valorEntrega = 5; //se o estabelecimento colocar centavos tem q ser 5.5 = R$ 5,50

var cllEmpresa = '5542991334898';

cardapio.eventos = {

    init: () => {
        cardapio.metodos.obterItensCardapio();
        cardapio.metodos.carregarBtnLigar();
        cardapio.metodos.carregarReserva();
    }

}

cardapio.metodos = {

    //obtém a lista de itens do cardápio
    obterItensCardapio: (categoria = 'burgers', vermais = false) => {

        var filtro = MENU[categoria];
        console.log(filtro);

        if (!vermais) {
            $("#itensCardapio").html('');
            $("#btnVerMais").removeClass('hidden');
        }


        $.each(filtro, (i, e) => {

            let temp = cardapio.templates.item.replace(/\${img}/g, e.img)
            .replace(/\${name}/g, e.name)
            .replace(/\${price}/g, e.price.toFixed(2).replace('.', ','))
            .replace(/\${id}/g, e.id)

            //botao ver mais foi clicado (12 itens)
            if (vermais && i >= 8 && i <12) {
                $("#itensCardapio").append(temp)
            }

            //paginação inicial (8 itens)
            if (!vermais && i < 8) {
                $("#itensCardapio").append(temp)
            }


        })

        //remove o active
        $(".container-menu a").removeClass('active');

        // seta o menu p ativo
        $("#menu-" + categoria).addClass('active')

    },

    //clique no botão de ver mais
    verMais: () => {

        var ativo = $(".container-menu a.active").attr('id').split('menu-')[1];
        cardapio.metodos.obterItensCardapio(ativo, true);

        $("#btnVerMais").addClass('hidden');

    },

    //diminui a quantidade de produtos
    diminuirQuantidade: (id) => {

        let quantiaAtual = parseInt($("#quantia-" + id).text());

        if(quantiaAtual > 0) {
            $("#quantia-" + id).text(quantiaAtual - 1)
        }

    },

    //aumenta a quantia de produtos
    aumentarQuantidade: (id) => {

        let quantiaAtual = parseInt($("#quantia-" + id).text());
        $("#quantia-" + id).text(quantiaAtual + 1)

    },

    //add item ao carrinho
    adicionarCarrinho: (id) => {

        let quantiaAtual = parseInt($("#quantia-" + id).text());

        if(quantiaAtual > 0) {

            //obter a categoria ativa
            var categoria = $(".container-menu a.active").attr('id').split('menu-')[1];

            //obtem a lista de itens
            let filtro = MENU[categoria];

            //obtem o item
            let item = $.grep(filtro, (e, i) => { return e.id == id});

            if (item.length > 0) {

                //validar se já tem o item no carrinho
                let existe = $.grep(carrinho, (elem, index) => { return elem.id ==id});

                //caso já exista o item no carrinho
                if (existe.length > 0) {
                    let objIndex = carrinho.findIndex((obj => obj.id == id));
                    carrinho[objIndex].quantia = carrinho[objIndex].quantia + quantiaAtual;
                }
                //caso ainda não exista, add ele
                else {
                    item[0].quantia = quantiaAtual;
                    carrinho.push(item[0])
                }

                cardapio.metodos.mensagem('Item adicionado ao carrinho', 'green')
                //após add no carrinho, reseta a quantia pra 0
                $("#quantia-" + id).text(0);

                cardapio.metodos.atualizarBadgeTotal();

            }

        }

    },

    //atualiza a quantia de itens no badge do meu carrinho
    atualizarBadgeTotal: () => {

        var total = 0;

        $.each(carrinho, (i, e) => {
            total += e.quantia
        })

        if (total > 0) {
            //se tiver item no botão remove o hidden e ele aparece
            $(".botao-carrinho").removeClass('hidden');
            $(".container-total-carrinho").removeClass('hidden');
        }
        else{
            //se o total for 0, o item continua sem aparecer
            $(".botao-carrinho").addClass('hidden');
            $(".container-total-carrinho").addClass('hidden');
        }

        $(".badge-total-carrinho").html(total);

    },

    //abrir a modal de carrinho
    abrirCarrinho: (abrir) => {

        if(abrir) {
            $("#modalCarrinho").removeClass('hidden');
            cardapio.metodos.carregarCarrinho();
        }
        else {
            $("#modalCarrinho").addClass('hidden');
        }

    },

    //altera os textos e exibe os botões das etapas
    carregarEtapa: (etapa) => {

        if(etapa == 1) {
            $("#lblTituloEtapa").text('Seu carrinho:');
            $("#itensCarrinho").removeClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").addClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');

            $("#btnEtapaPedido").removeClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").addClass('hidden');
        }

        else if(etapa == 2) {
            $("#lblTituloEtapa").text('Endereço de entrega:');
            $("#itensCarrinho").addClass('hidden');
            $("#localEntrega").removeClass('hidden');
            $("#resumoCarrinho").addClass('hidden');

            //Etapas ativas
            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');
            //
            
            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").removeClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }

        else if(etapa == 3) {
            $("#lblTituloEtapa").text('Resumo do pedido:');
            $("#itensCarrinho").addClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").removeClass('hidden');

            //Etapas ativas
            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');
            $(".etapa3").addClass('active');
            //
            
            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").removeClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }

    },

    //botão de voltar
    voltarEtapa: () => {
        let etapa = $(".etapa.active").length;
        cardapio.metodos.carregarEtapa(etapa - 1);
    },

    //carrega a lista de itens do carinho
    carregarCarrinho: () => {

        cardapio.metodos.carregarEtapa(1);

        if(carrinho.length > 0) {

            $("#itensCarrinho").html('');

            $.each(carrinho, (i, e) => {

                let temp = cardapio.templates.itemCarrinho.replace(/\${img}/g, e.img)
                .replace(/\${name}/g, e.name)
                .replace(/\${price}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${id}/g, e.id)
                .replace(/\${quantia}/g, e.quantia)

                $("#itensCarrinho").append(temp);

                //último item
                if ((i + 1) == carrinho.length) {
                    cardapio.metodos.carregarValores();
                }

            })

        }
        else {
            $("#itensCarrinho").html('<p class="carrinho-vazio" ><i class="fa fa-shopping-bag"></i>Seu carrinho está vazio.</p>');
            cardapio.metodos.carregarValores();
        }

    },

    //diminui a quantia do item no carrinho
    diminuirQuantidadeCarrinho: (id) => {

        let quantiaAtual = parseInt($("#quantia-carrinho-" + id).text());

        if (quantiaAtual > 1) {
            $("#quantia-carrinho-" + id).text(quantiaAtual - 1);
            cardapio.metodos.atualizarCarrinho(id, quantiaAtual - 1);
        } 
        else {
            cardapio.metodos.removerItemCarrinho(id)
        }

    },

    //aumenta a quantia de itens no carrinho
    aumentarQuantidadeCarrinho: (id) => {

        let quantiaAtual = parseInt($("#quantia-carrinho-" + id).text());

        $("#quantia-carrinho-" + id).text(quantiaAtual + 1);
        cardapio.metodos.atualizarCarrinho(id, quantiaAtual + 1);

    },

    //botao de remover item do carrinho
    removerItemCarrinho: (id) => {

        carrinho = $.grep(carrinho, (e, i) => { return e.id != id });
        cardapio.metodos.carregarCarrinho();

        cardapio.metodos.atualizarBadgeTotal();

    },

    //atualiza o carrinho com a quantia atual
    atualizarCarrinho: (id, quantia) => {
        
        let objIndex = carrinho.findIndex((obj => obj.id == id));
        carrinho[objIndex].quantia = quantia;

        cardapio.metodos.atualizarBadgeTotal();

        //atualiza os valores totais do carrinho
        cardapio.metodos.carregarValores();

    },

    //carrega os valores de Subtotal, entrega e total
    carregarValores: () => {

        valorCarrinho = 0;

        $("#lblSubTotal").text('R$ 0,00');
        $("#lblValorEntrega").text('+ R$ 0,00');
        $("#lblTotal").text('R$ 0,00');

        $.each(carrinho, (i, e) => {

            valorCarrinho += parseFloat(e.price * e.quantia);

            if ((i + 1) == carrinho.length) {
                $("#lblSubTotal").text(`R$ ${valorCarrinho.toFixed(2).replace('.', ',')}`);
                $("#lblValorEntrega").text(`+ ${valorEntrega.toFixed(2).replace('.', ',')}`);
                $("#lblTotal").text(`R$ ${(valorCarrinho + valorEntrega).toFixed(2).replace('.', ',')}`);
            }

        })

    },

    carregarEndereco: () => {

        if (carrinho.length <= 0) {
            cardapio.metodos.mensagem('Seu carrinho está vazio.')
            return;
        }

        cardapio.metodos.carregarEtapa(2);

    },

    //API ViaCEP
    buscarCep: () => {

        //cria a var com o valor do cep
        var cep = $("#txtCEP").val().trim().replace(/\D/g, '');  
                                                                //val remove os icones do cep, lê apenas os nmr
                                                                 //trim remove os espaços desnecessários colocados acidentalmente, lendo apenas o texto

        //verifica se o CEP possui valor informado
        if(cep != "") {

            //expressão regular p validar o cep
            var validacep = /^[0-9]{8}$/;

            if(validacep.test(cep)){

                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function(dados) {

                    if(!("erro" in dados)) {

                        //atualizar os campos com os valores retornados
                        $("#txtEndereco").val(dados.logradouro);
                        $("#txtBairro").val(dados.bairro);
                        $("#txtCidade").val(dados.localidade);
                        $("#ddlUf").val(dados.uf);
                        $("#txtNumero").focus();

                    }
                    else{
                        cardapio.metodos.mensagem('CEP não encontrado. Preencha as informações manualmente.');
                        $("#txtEndereço").focus();
                    }

                })

            }
            else{
                cardapio.metodos.mensagem('Formato do CEP inválido.');
                $("#txtCEP").focus();
            }

        }
        else{
            cardapio.metodos.mensagem('Informe o CEP, por favor.');
            $("#txtCEP").focus();
        }

    },

    //validação antes de prosseguir p etapa 3
    resumoPedido: () => {

        let cep = $("#txtCEP").val().trim();
        let endereco = $("#txtEndereco").val().trim();
        let bairro = $("#txtBairro").val().trim();
        let cidade = $("#txtCidade").val().trim();
        let uf = $("#ddlUf").val().trim();
        let numero = $("#txtNumero").val().trim();
        let complemento = $("#txtComplemento").val().trim();
        

        if(cep.length <= 0) {
            cardapio.metodos.mensagem('Informe o CEP');
            $("txtCEP").focus(); //foca na caixa de txt do CEP
            return;
        }

        if(endereco.length <= 0) {
            cardapio.metodos.mensagem('Informe o Endereço');
            $("txtEndereco").focus();
            return;
        }
        
        if(bairro.length <= 0) {
            cardapio.metodos.mensagem('Informe o Bairro');
            $("txtBairro").focus();
            return;
        }

        if(cidade.length <= 0) {
            cardapio.metodos.mensagem('Informe a Cidade');
            $("txtCidade").focus();
            return;
        }

        if(uf == "-1") {
            cardapio.metodos.mensagem('Informe a UF');
            $("ddlUf").focus();
            return;
        }

        if(numero.length <= 0) {
            cardapio.metodos.mensagem('Informe o Número');
            $("txtNumero").focus();
            return;
        }

        meuEndereco = {
            cep: cep,
            endereco: endereco,
            bairro: bairro,
            cidade: cidade,
            uf: uf,
            numero: numero,
            complemento: complemento
        }

        cardapio.metodos.carregarEtapa(3);
        cardapio.metodos.carregarResumo();

    },

    //carrega a etapa de resumo do pedido
    carregarResumo: () => {

        $("#listaItensResumo").html('');

        $.each(carrinho, (i, e) => {

            let temp = cardapio.templates.itemResumo.replace(/\${img}/g, e.img)
            .replace(/\${name}/g, e.name)
            .replace(/\${price}/g, e.price.toFixed(2).replace('.', ','))
            .replace(/\${quantia}/g, e.quantia)

            $("#listaItensResumo").append(temp);

        });

        $("#resumoEndereco").html(`${meuEndereco.endereco}, ${meuEndereco.numero}, ${meuEndereco.bairro}`);
        $("#cidadeEndereco").html(`${meuEndereco.cidade}-${meuEndereco.uf} / ${meuEndereco.cep} ${meuEndereco.complemento}`);

        cardapio.metodos.finalizarPedido();

    },

    //atualiza o link do btn do zap
    finalizarPedido: () => {
        if (carrinho.length > 0 && meuEndereco != null) {
            var itens = '';  // Declare 'itens' no início da função
    
            var texto = 'Olá, gostaria de fazer um pedido:';
    
            // Adicionando os itens ao texto
            $.each(carrinho, (i, e) => {
                itens += `*${e.quantia}x* ${e.name} ....... R$ ${e.price.toFixed(2).replace('.', ',')} \n`;
    
                //último item
                if ((i + 1) == carrinho.length) {
                    texto += `\n*Itens do pedido:*\n\n${itens}`;  // Use ${itens} diretamente
                    texto += '\n*Endereço de entrega:*';    // '\n' quebra linhas
                    texto += `\n${meuEndereco.endereco}, ${meuEndereco.numero}, ${meuEndereco.bairro}`;
                    texto += `\n${meuEndereco.cidade}-${meuEndereco.uf} / ${meuEndereco.cep} \n${meuEndereco.complemento}`;
                    texto += `\n\n*Total (com entrega): R$ ${(valorCarrinho + valorEntrega).toFixed(2).replace('.', ',')}*`;

                    //converte a url
                    let encode = encodeURI(texto);
                    let URL = `https://wa.me/${cllEmpresa}?text=${encode}`;

                    $("#btnEtapaResumo").attr('href', URL);

                }
            });
        }
    },

    carregarReserva: () => {

        var texto = 'Olá, gostaria de fazer uma reserva.';

        let encode = encodeURI(texto);
        let URL = `https://wa.me/${cllEmpresa}?text=${encode}`;

        $("#btnReserva").attr('href', URL);

    },

    //faz a ligação qdo aperta o btn ligar
    carregarBtnLigar:() => {

        $("btnLigar").attr('href', `tel:${cllEmpresa}`);

    },

    //abre depoimentos
    abrirDepoimento:(depoimento) => {

        $("#depoimento-1").addClass('hidden');
        $("#depoimento-2").addClass('hidden');
        $("#depoimento-3").addClass('hidden');

        $("#btn-depoimento-1").removeClass('active');
        $("#btn-depoimento-2").removeClass('active');
        $("#btn-depoimento-3").removeClass('active');

        $("#depoimento-" + depoimento).removeClass('hidden');
        $("#btn-depoimento-" + depoimento).addClass('active');

    },
    
    //alertas/mensagens
    mensagem: (texto, cor = 'red', tempo = 3500) => {

        let id = Math.floor(Date.now() * Math.random()).toString();
    
        let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`;
    
        $(".container-msg").append(msg);
    
        setTimeout(() => {
            $(`#msg-${id}`).removeClass('fadeInDown');
            $(`#msg-${id}`).addClass('fadeOutUp');
            setTimeout(() => {
                $(`#msg-${id}`).remove();
            }, 800);
        }, tempo);
    }
    

}

cardapio.templates = {

    item: `
            <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 animated fadeInUp delay-05s">
            <div class="card card-item" id="\${id}">
                <div class="img-produto">
                    <img src="\${img}" />
                </div>
                
                <p class="titulo-produto text-center mt-4">
                    <b>\${name}</b>
                </p>
                <p class="preço text-center">
                    <b>R$ \${price}</b>
                </p>
                <div class="add-carrinho">
                    <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                    <span class="add-numero-itens" id="quantia-\${id}">0</span>
                    <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                    <span class="btn btn-add" onclick="cardapio.metodos.adicionarCarrinho('\${id}')"><i class="fa fa-shopping-bag"></i></span>
                </div>
            </div>
        </div>
    `,

    itemCarrinho: `
    <div class="col-12 item-carrinho animated fadeInUp delay-01s">
        <div class="img-produto">
            <img src="\${img}" alt="">
        </div>

        <div class="dados-produto">
            <p class="titulo-produto"><b>\${name}</b></p>
            <p class="preço"><b>R$ \${price}</b></p>
        </div>

        <div class="add-carrinho">
            <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
            <span class="add-numero-itens" id="quantia-carrinho-\${id}">\${quantia}</span>
            <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
            <span class="btn btn-remove hidden-mobile" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fa fa-times"></i></span>
        </div>
    </div>
`,

    itemResumo: `
        <div class="col-12 item-carrinho resumo">
            <div class="img-produto-resumo">
                <img src="\${img}">
            </div>

            <div class="dados-produto">
                <p class="titulo-produto-resumo">
                    <b>\${name}</b>
                </p>

                <p class="preço-produto-resumo">
                    <b>R$ \${price}</b>
                </p>
            </div>

            <p class="quantidade-produto-resumo">
                x <b>\${quantia}</b>
            </p>
        </div>
    `

}