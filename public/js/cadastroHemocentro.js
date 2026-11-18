document.addEventListener('DOMContentLoaded', () => {
    const listaContatos = document.getElementById('lista-contatos');
    const btnAdicionar = document.querySelector('.btn-adicionar');
    const modelo = document.getElementById('modelo-contato');


   
    function atualizarCampoContato(select) {
        const linha = select.closest('.contato-item');
        const inputValor = linha.querySelector('input[name="contatoValor[]"]');
        const tipo = select.value;

        if (tipo === 'whatsapp' || tipo === 'telefone') {
            inputValor.type = 'tel';
            inputValor.placeholder = '(00) 00000-0000';
        } else if (tipo === '0800') {
            inputValor.type = 'tel';
            inputValor.placeholder = '0800 000 0000';
        } else if (tipo === 'email') {
            inputValor.type = 'email';
            inputValor.placeholder = 'agendamento@hemocentro.org.br';
        } else if (tipo === 'instagram') {
            inputValor.type = 'text';
            inputValor.placeholder = '@hemocentro';
        }
    }

function atualizarBotoesRemover() {
        const linhas = listaContatos.querySelectorAll('.contato-item');
        linhas.forEach((linha) => {
            linha.querySelector('.btn-remover')
                .classList.toggle('oculto', linhas.length === 1);
        });
    }
listaContatos.querySelectorAll('select[name="contatoTipo[]"]').forEach(atualizarCampoContato);
atualizarBotoesRemover();


// 1. Evento para adicionar nova linha
btnAdicionar.addEventListener('click', () => {
        const fragmento = modelo.content.cloneNode(true);
        const select = fragmento.querySelector('select');
        const input = fragmento.querySelector('input');

        atualizarCampoContato(select);
        listaContatos.appendChild(fragmento);
        atualizarBotoesRemover();
        input.focus();
    });

listaContatos.addEventListener('change', (evento) => {
if (evento.target.matches('select[name="contatoTipo[]"]')) {
    atualizarCampoContato(evento.target);
}
});


listaContatos.addEventListener('click', (evento) => {
if (evento.target.matches('.btn-remover')) {
    const linha = evento.target.closest('.contato-item').remove();
    atualizarBotoesRemover()
}
});
});
