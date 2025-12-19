"use client"

import { useState } from "react"
import { Upload, TrendingUp, Clock, BarChart3, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [ativo, setAtivo] = useState("")
  const [timeframe, setTimeframe] = useState("")
  const [tipoMercado, setTipoMercado] = useState("")
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<string>("")
  const [error, setError] = useState("")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setError("")
      setAnalysis("")
    }
  }

  const handleAnalyze = async () => {
    if (!imageFile || !ativo || !timeframe || !tipoMercado) {
      setError("Por favor, preencha todos os campos e envie uma imagem do gráfico.")
      return
    }

    setLoading(true)
    setError("")
    setAnalysis("")

    try {
      const formData = new FormData()
      formData.append("image", imageFile)
      formData.append("ativo", ativo)
      formData.append("timeframe", timeframe)
      formData.append("tipoMercado", tipoMercado)

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao analisar o gráfico")
      }

      setAnalysis(data.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar análise")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  PrinceLens
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Análise Educacional de Candlestick
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Upload Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Enviar Gráfico
                </CardTitle>
                <CardDescription>
                  Faça upload de um print do gráfico de candlestick
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {imagePreview ? (
                      <div className="space-y-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-lg shadow-md"
                        />
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Clique para alterar a imagem
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-12 h-12 mx-auto text-slate-400" />
                        <p className="text-slate-600 dark:text-slate-400">
                          Clique para selecionar uma imagem
                        </p>
                        <p className="text-xs text-slate-500">
                          PNG, JPG ou JPEG (máx. 10MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Informações do Gráfico
                </CardTitle>
                <CardDescription>
                  Preencha os dados para análise precisa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ativo">Ativo</Label>
                  <Input
                    id="ativo"
                    placeholder="Ex: EUR/USD, USDJPY, BTCUSD"
                    value={ativo}
                    onChange={(e) => setAtivo(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger id="timeframe">
                      <SelectValue placeholder="Selecione o timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1 Minuto</SelectItem>
                      <SelectItem value="5m">5 Minutos</SelectItem>
                      <SelectItem value="15m">15 Minutos</SelectItem>
                      <SelectItem value="30m">30 Minutos</SelectItem>
                      <SelectItem value="1h">1 Hora</SelectItem>
                      <SelectItem value="4h">4 Horas</SelectItem>
                      <SelectItem value="1d">1 Dia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mercado">Tipo de Mercado</Label>
                  <Select value={tipoMercado} onValueChange={setTipoMercado}>
                    <SelectTrigger id="mercado">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mercado Aberto">Mercado Aberto</SelectItem>
                      <SelectItem value="OTC">OTC (Over The Counter)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={loading || !imageFile || !ativo || !timeframe || !tipoMercado}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Analisar Gráfico
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Warning Alert */}
            <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                <strong>Aviso Importante:</strong> Este aplicativo é exclusivamente educacional. 
                Opções binárias envolvem alto risco financeiro. Não utilize como recomendação de investimento.
              </AlertDescription>
            </Alert>
          </div>

          {/* Right Column - Results */}
          <div>
            <Card className="shadow-lg min-h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Análise Técnica Educacional
                </CardTitle>
                <CardDescription>
                  Resultado da análise do gráfico enviado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {analysis ? (
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {analysis}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                      <TrendingUp className="w-12 h-12 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Aguardando Análise
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                      Envie um gráfico de candlestick e preencha as informações para receber 
                      uma análise técnica educacional detalhada.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Educational Footer */}
        <div className="mt-8 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                📚 Objetivo Educacional
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 max-w-3xl mx-auto">
                Este aplicativo utiliza inteligência artificial para ensinar análise técnica de gráficos candlestick. 
                A análise considera estrutura de preço, suportes, resistências, tendências e padrões de candlestick. 
                As sugestões são baseadas em probabilidade e não garantem resultados financeiros.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
