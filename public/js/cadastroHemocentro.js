document.addEventListener('DOMContentLoaded', () => {
    const listaContatos = document.getElementById('lista-contatos');
    const btnAdicionar = document.querySelector('.btn-adicionar');

   
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

    // 1. Evento para adicionar nova linha
    btnAdicionar.addEventListener('click', () => {
        const primeiraLinha = listaContatos.querySelector('.contato-item');
        const novaLinha = primeiraLinha.cloneNode(true);

        const select = novaLinha.querySelector('select');
        select.value = 'whatsapp';
        atualizarCampoContato(select);

        const input = novaLinha.querySelector('input');
        input.value = '';

        const btnRemover = novaLinha.querySelector('.btn-remover');
        btnRemover.classList.remove('oculto');

        listaContatos.appendChild(novaLinha);
        input.focus();
    });

    listaContatos.addEventListener('change', (evento) => {
        if (evento.target.matches('select[name="contatoTipo[]"]')) {
            atualizarCampoContato(evento.target);
        }
    });


    listaContatos.addEventListener('click', (evento) => {
        if (evento.target.matches('.btn-remover')) {
            const linha = evento.target.closest('.contato-item');
            linha.remove();
        }
    });
});
