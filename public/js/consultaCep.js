document.addEventListener("DOMContentLoaded", () => {
    const campoCep = document.getElementById("cep")
    const status = document.getElementById("cep-status")
    if (!campoCep || !status) return

    const logradouro = document.getElementById("logradouro")
    const bairro = document.getElementById("bairro")
    const cidade = document.getElementById("cidade")
    const estado = document.getElementById("estado")
    const numero = document.getElementById("numero")

    const textos = [logradouro, bairro, cidade]
    let ultimoCep = ""

    const soDigitos = (v) => v.replace(/\D/g, "")

  
    ;[...textos, estado].forEach((c) =>
        c.addEventListener("input", () => { c.dataset.auto = "" })
    )

    function preencher(campo, valor) {
        campo.value = valor || ""
        campo.dataset.auto = valor ? "1" : ""
    }

    function limparAutopreenchidos() {
        textos.forEach((c) => {
            if (c.dataset.auto === "1") { c.value = ""; c.dataset.auto = "" }
        })
        if (estado.dataset.auto === "1") { estado.value = ""; estado.dataset.auto = "" }
    }

    campoCep.addEventListener("blur", async () => {
        const cep = soDigitos(campoCep.value)
        if (cep.length !== 8) { status.textContent = ""; return }
        if (cep === ultimoCep) return

        limparAutopreenchidos()
        status.textContent = "Buscando endereço..."

        const controle = new AbortController()
        const timer = setTimeout(() => controle.abort(), 5000)

        try {
            const resp = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`, { signal: controle.signal })

            if (soDigitos(campoCep.value) !== cep) return   // resposta atrasada

            if (resp.status === 404) {
                ultimoCep = cep
                status.textContent = "CEP não encontrado. Preencha o endereço manualmente."
                return
            }
            if (!resp.ok) throw new Error("falha")

            const dados = await resp.json()
            ultimoCep = cep

            preencher(logradouro, dados.street)
            preencher(bairro, dados.neighborhood)
            preencher(cidade, dados.city)
            if (dados.state) { estado.value = dados.state; estado.dataset.auto = "1" }

            status.textContent = ""
            ;(dados.street ? numero : logradouro).focus()
        } catch {
            status.textContent = "Não foi possível buscar o endereço agora. Preencha manualmente."
        } finally {
            clearTimeout(timer)
        }
    })
})