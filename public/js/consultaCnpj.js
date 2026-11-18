document.addEventListener("DOMContentLoaded", () => {
    const campo = document.getElementById("cnpj")
    const status = document.getElementById("cnpj-status")
    if (!campo || !status) return

    campo.addEventListener("blur", async () => {
        const cnpj = campo.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
        if (!/^\d{14}$/.test(cnpj)) { status.textContent = ""; return }

        status.textContent = "Consultando CNPJ..."
        const controle = new AbortController()
        const timer = setTimeout(() => controle.abort(), 5000)

        try {
            const resp = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, { signal: controle.signal })

            // resposta atrasada: o campo mudou enquanto consultava
            if (campo.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase() !== cnpj) return

            if (resp.status === 404) { status.textContent = "CNPJ não encontrado na Receita. Tente novamente."; return }
            if (!resp.ok) { status.textContent = "Não foi possível consultar agora."; return }

            const dados = await resp.json()
            status.textContent = dados.descricao_situacao_cadastral === "ATIVA"
                ? `✔ ${dados.razao_social} (ativa)`
                : `Atenção: situação ${dados.descricao_situacao_cadastral}.`
        } catch {
            status.textContent = "Não foi possível consultar agora."
        } finally {
            clearTimeout(timer)
        }
    })
})