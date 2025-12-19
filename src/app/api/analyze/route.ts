import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File
    const ativo = formData.get("ativo") as string
    const timeframe = formData.get("timeframe") as string
    const tipoMercado = formData.get("tipoMercado") as string

    if (!image || !ativo || !timeframe || !tipoMercado) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      )
    }

    // Converter imagem para base64
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString("base64")
    const mimeType = image.type
    const imageUrl = `data:${mimeType};base64,${base64Image}`

    // Obter horário atual de Brasília
    const now = new Date()
    const brasiliaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))
    const currentTime = brasiliaTime.toLocaleTimeString("pt-BR", { 
      hour: "2-digit", 
      minute: "2-digit" 
    })

    // Calcular horário de entrada (2 minutos após)
    const entryTime = new Date(brasiliaTime.getTime() + 2 * 60000)
    const entryTimeStr = entryTime.toLocaleTimeString("pt-BR", { 
      hour: "2-digit", 
      minute: "2-digit" 
    })

    // Prompt detalhado para análise educacional
    const prompt = `Você é um analista técnico educacional especializado em gráficos candlestick para opções binárias.

INFORMAÇÕES FORNECIDAS:
- Ativo: ${ativo}
- Timeframe: ${timeframe}
- Tipo de mercado: ${tipoMercado}
- Horário atual (Brasília): ${currentTime}
- Horário mínimo para entrada: ${entryTimeStr}

INSTRUÇÕES DE ANÁLISE:
Analise APENAS o que está visível no gráfico enviado, seguindo esta ordem de prioridade:

1. **Estrutura do preço e Price Action**: Identifique tendência (alta, baixa, lateral), movimentos recentes
2. **Zonas de Suporte e Resistência**: Identifique níveis-chave onde o preço reagiu
3. **Linhas de Tendência**: Trace mentalmente linhas de tendência relevantes
4. **Padrões de Candlestick**: Identifique padrões relevantes (martelo, engolfo, doji, etc.)
5. **Confluência de fatores**: Verifique se múltiplos fatores apontam para mesma direção
6. **Indicadores técnicos**: Use NO MÁXIMO 2 indicadores apenas como confirmação (se visíveis)

REGRAS IMPORTANTES:
- Seja educacional, não prometa resultados
- Se o mercado estiver lateral, confuso ou sem confluência clara, responda: "Sem entrada recomendada no momento"
- Explique o PORQUÊ de forma simples para iniciantes
- Use linguagem clara, objetiva e profissional
- NUNCA use termos como "sinal", "garantia" ou "entrada certa"
- A entrada deve ser para a PRÓXIMA vela após ${entryTimeStr}

FORMATO OBRIGATÓRIO DA RESPOSTA:

Ativo: ${ativo}
Timeframe: ${timeframe}
Tipo de mercado: ${tipoMercado}

Cenário identificado:
[Descreva o cenário técnico observado no gráfico de forma clara e educativa]

Entrada sugerida: [CALL / PUT / Sem entrada]
Horário da possível entrada: ${entryTimeStr}
Grau de confiança: [Baixo / Médio / Alto]

Explicação simples:
[Explique de forma simples e didática o raciocínio técnico por trás da análise, mencionando os fatores observados]

Aprendizado prático:
[Ensine um conceito técnico relevante baseado no que foi observado no gráfico]

⚠️ Esta análise é educacional, baseada em probabilidade e não garante resultados. Opções binárias envolvem alto risco.

IMPORTANTE: Siga EXATAMENTE este formato. Seja objetivo, educacional e honesto sobre as limitações da análise.`

    // Chamar OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    })

    const analysis = response.choices[0]?.message?.content || "Não foi possível gerar a análise."

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Erro na análise:", error)
    return NextResponse.json(
      { error: "Erro ao processar a análise. Verifique sua chave da OpenAI." },
      { status: 500 }
    )
  }
}
