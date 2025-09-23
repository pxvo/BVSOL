# 🌞 BV SOL - Sistema de Energia Solar

> Energia sustentável que cabe no seu bolso - Agora com avaliações reais do Google!

## 📋 Sobre o Projeto

Site institucional da **BV SOL**, empresa especializada em energia solar fotovoltaica. O projeto apresenta soluções sustentáveis de energia com foco em economia e preservação ambiental, incluindo sistema de avaliações reais do Google Places API.

## ✨ Características

- 💰 **Economia**: Até 90% de redução na conta de luz
- 🌱 **Sustentável**: Energia limpa que não agride o meio ambiente
- 📱 **Responsivo**: Design adaptável para todos os dispositivos
- 🎨 **Moderno**: Interface clean e intuitiva
- ⭐ **Avaliações Reais**: Integração com Google Places API
- 🔒 **Seguro**: Configuração via variáveis de ambiente

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript ES6+
- jQuery
- Google Places API
- Sistema de variáveis de ambiente (.env)
- Google Fonts (Poppins)

---

## � Configuração das Variáveis de Ambiente

### 📋 Pré-requisitos

1. **Google Cloud Console**: Conta ativa no Google Cloud
2. **Places API**: API habilitada no seu projeto
3. **API Key**: Chave de API válida com permissões

### ⚡ Configuração Rápida

#### 1. Configure o Arquivo .env

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

#### 2. Edite as Configurações

Abra o arquivo `.env` e configure suas variáveis:

```env
# API Key do Google Places API
GOOGLE_PLACES_API_KEY=sua_api_key_aqui

# Configurações do negócio
BUSINESS_NAME=Sua Empresa
BUSINESS_ADDRESS=Sua Cidade, Estado, País

# Configurações do widget
MAX_REVIEWS=6
ENABLE_GOOGLE_API=true
```

### 🗝️ Como Obter a API Key do Google

#### Passo 1: Google Cloud Console
1. Vá para [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente

#### Passo 2: Ative a Places API
1. Vá para **APIs e Serviços** → **Biblioteca**
2. Procure por "**Places API**" e habilite

#### Passo 3: Crie uma API Key
1. Vá para **APIs e Serviços** → **Credenciais**
2. Clique em **+ Criar Credenciais** → **Chave da API**
3. Configure restrições de domínio e API

---

## 🚀 Como Executar

### 1. Desenvolvimento Local

```bash
# Usando Python
python -m http.server 8080

# Abrir no navegador
http://localhost:8080
```

### 2. Testar a Integração com Google

Abra o console do navegador (F12) e execute:

```javascript
testarGoogleAPI()
```

### 3. Verificar Configurações

```javascript
ENV.debugConfig()
```

## 📂 Estrutura do Projeto

```
BVSOL/
├── .env                 # ⚠️ Suas credenciais (NÃO COMMITAR)
├── .env.example         # 📄 Template de configuração
├── .gitignore          # 🔒 Protege .env do Git
├── env-loader.js       # 🔧 Carregador de variáveis
├── google-reviews.js   # ⭐ Widget de avaliações
├── index.html          # 🏠 Página principal
├── sobre.html          # 📄 Página sobre a empresa
├── style.css           # 🎨 Estilos do projeto
├── script.js           # ⚙️ Scripts JavaScript
└── img/                # 🖼️ Imagens e assets
```

## 🔒 Segurança

### ✅ Boas Práticas Implementadas

- **`.env` no .gitignore**: Credenciais nunca vão para o Git
- **API Key mascarada**: Logs nunca mostram a chave completa
- **Validação automática**: Sistema verifica configurações
- **Fallback seguro**: Funciona mesmo sem API configurada

### ⚠️ Importante

1. **NUNCA** commite o arquivo `.env`
2. **SEMPRE** use `.env.example` como template
3. **Configure restrições** na API Key no Google Cloud
4. **Monitore o uso** da API para evitar custos inesperados

## 🛠️ Configurações Disponíveis

| Variável | Descrição | Padrão | Obrigatória |
|----------|-----------|---------|-------------|
| `GOOGLE_PLACES_API_KEY` | Chave da API do Google | - | ✅ |
| `BUSINESS_NAME` | Nome da empresa | BV SOL | ✅ |
| `BUSINESS_ADDRESS` | Endereço da empresa | Boa Vista, RR | ✅ |
| `MAX_REVIEWS` | Máximo de avaliações | 6 | ❌ |
| `CACHE_EXPIRY_HOURS` | Cache em horas | 24 | ❌ |
| `ENABLE_GOOGLE_API` | Habilitar API real | true | ❌ |

## 🐛 Solução de Problemas

### ❌ "API Key não configurada"
- Verifique se o arquivo `.env` existe
- Confirme se `GOOGLE_PLACES_API_KEY` está preenchido

### ❌ "Place ID não encontrado"
- Confirme se `BUSINESS_NAME` e `BUSINESS_ADDRESS` estão corretos
- Verifique se a API Places está habilitada

### ❌ "Quota exceeded"
- Verifique limites no Google Cloud Console
- Configure alertas de billing

## 💰 Custos da API

- **Gratuito**: 100 requests/dia
- **Pago**: ~$0.017 por request adicional
- **Cache**: Reduz requests (24h padrão)

## 📋 Checklist de Implementação

- [ ] Criar conta no Google Cloud Console
- [ ] Ativar Places API
- [ ] Gerar API Key
- [ ] Configurar restrições de segurança
- [ ] Copiar `.env.example` para `.env`
- [ ] Configurar variáveis no `.env`
- [ ] Testar com `testarGoogleAPI()`
- [ ] Verificar avaliações no site

## 📞 Contato

Entre em contato conosco pelo WhatsApp para mais informações sobre nossos serviços de energia solar!

---

<div align="center">
  <strong>🌟 Energia Solar com Avaliações Reais - O futuro é agora! 🌟</strong><br>
  <em>✅ Sistema implementado seguindo as diretrizes do Google e GitHub para segurança de API Keys!</em>
</div>
