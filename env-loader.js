/**
 * Sistema de Carregamento de Variáveis de Ambiente
 * Versão: 1.0 - Para uso em frontend (client-side)
 * Autor: Sistema BV SOL
 */

class EnvironmentLoader {
    constructor() {
        this.envVars = {};
        this.loaded = false;
        this.envFile = '.env';
    }

    /**
     * Carrega as variáveis de ambiente do arquivo .env
     */
    async loadEnvironment() {
        if (this.loaded) {
            return this.envVars;
        }

        try {
            // Tentar carregar o arquivo .env
            const response = await fetch(this.envFile);
            
            if (!response.ok) {
                console.warn('⚠️ Arquivo .env não encontrado, usando configurações padrão');
                this.setDefaultValues();
                return this.envVars;
            }

            const envContent = await response.text();
            this.parseEnvContent(envContent);
            this.loaded = true;
            
            console.log('✅ Variáveis de ambiente carregadas com sucesso');
            return this.envVars;

        } catch (error) {
            console.warn('⚠️ Erro ao carregar .env, usando configurações padrão:', error.message);
            this.setDefaultValues();
            return this.envVars;
        }
    }

    /**
     * Faz o parse do conteúdo do arquivo .env
     */
    parseEnvContent(content) {
        const lines = content.split('\n');
        
        lines.forEach(line => {
            line = line.trim();
            
            // Ignorar comentários e linhas vazias
            if (line === '' || line.startsWith('#')) {
                return;
            }

            // Fazer parse das variáveis KEY=value
            const equalIndex = line.indexOf('=');
            if (equalIndex !== -1) {
                const key = line.substring(0, equalIndex).trim();
                let value = line.substring(equalIndex + 1).trim();
                
                // Remover aspas se existirem
                if ((value.startsWith('"') && value.endsWith('"')) || 
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                
                // Converter valores booleanos
                if (value.toLowerCase() === 'true') value = true;
                if (value.toLowerCase() === 'false') value = false;
                
                // Converter números
                if (!isNaN(value) && value !== '') {
                    const num = Number(value);
                    if (Number.isInteger(num)) value = num;
                }
                
                this.envVars[key] = value;
            }
        });
    }

    /**
     * Define valores padrão caso o .env não seja carregado
     */
    setDefaultValues() {
        this.envVars = {
            GOOGLE_PLACES_API_KEY: null,
            BUSINESS_NAME: 'BV SOL',
            BUSINESS_ADDRESS: 'Boa Vista, Roraima, Brasil',
            MAX_REVIEWS: 6,
            CACHE_EXPIRY_HOURS: 24,
            ENABLE_GOOGLE_API: false, // Desabilitado por padrão sem .env
            NODE_ENV: 'development',
            DEBUG_GOOGLE_API: true,
            CONSOLE_LOGS: true,
            GOOGLE_PLACE_ID: '',
            CORS_PROXY: 'https://api.allorigins.win/raw?url=',
            USE_FALLBACK_ON_ERROR: true
        };
        this.loaded = true;
    }

    /**
     * Obtém uma variável de ambiente
     */
    get(key, defaultValue = null) {
        return this.envVars[key] !== undefined ? this.envVars[key] : defaultValue;
    }

    /**
     * Obtém todas as variáveis
     */
    getAll() {
        return { ...this.envVars };
    }

    /**
     * Verifica se uma variável existe
     */
    has(key) {
        return this.envVars.hasOwnProperty(key);
    }

    /**
     * Obtém configurações específicas para o Google Reviews
     */
    getGoogleReviewsConfig() {
        return {
            apiKey: this.get('GOOGLE_PLACES_API_KEY'),
            businessName: this.get('BUSINESS_NAME', 'BV SOL'),
            businessAddress: this.get('BUSINESS_ADDRESS', 'Boa Vista, Roraima, Brasil'),
            maxReviews: this.get('MAX_REVIEWS', 6),
            enableGoogleAPI: this.get('ENABLE_GOOGLE_API', false),
            placeId: this.get('GOOGLE_PLACE_ID', null),
            corsProxy: this.get('CORS_PROXY', 'https://api.allorigins.win/raw?url='),
            cacheExpiryHours: this.get('CACHE_EXPIRY_HOURS', 24),
            useFallbackOnError: this.get('USE_FALLBACK_ON_ERROR', true),
            debugMode: this.get('DEBUG_GOOGLE_API', false),
            consoleLogs: this.get('CONSOLE_LOGS', true)
        };
    }

    /**
     * Valida se todas as configurações necessárias estão presentes
     */
    validateConfig() {
        const config = this.getGoogleReviewsConfig();
        const issues = [];

        if (config.enableGoogleAPI && !config.apiKey) {
            issues.push('GOOGLE_PLACES_API_KEY é obrigatória quando ENABLE_GOOGLE_API=true');
        }

        if (!config.businessName) {
            issues.push('BUSINESS_NAME não pode estar vazio');
        }

        if (!config.businessAddress) {
            issues.push('BUSINESS_ADDRESS não pode estar vazio');
        }

        if (config.maxReviews < 1 || config.maxReviews > 10) {
            issues.push('MAX_REVIEWS deve estar entre 1 e 10');
        }

        return {
            valid: issues.length === 0,
            issues: issues,
            config: config
        };
    }

    /**
     * Modo de debug - mostra todas as configurações (sem revelar API Key)
     */
    debugConfig() {
        const config = this.getGoogleReviewsConfig();
        const safeConfig = { ...config };
        
        // Mascarar API Key para segurança
        if (safeConfig.apiKey) {
            safeConfig.apiKey = safeConfig.apiKey.substring(0, 8) + '...' + safeConfig.apiKey.substring(safeConfig.apiKey.length - 4);
        }

        console.group('🔧 Configurações do Environment');
        console.table(safeConfig);
        console.groupEnd();

        const validation = this.validateConfig();
        if (!validation.valid) {
            console.group('⚠️ Problemas de Configuração');
            validation.issues.forEach(issue => console.warn('❌', issue));
            console.groupEnd();
        } else {
            console.log('✅ Todas as configurações estão válidas');
        }
    }
}

// Instância global
const ENV = new EnvironmentLoader();

// Auto-carregar quando possível
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', async () => {
        await ENV.loadEnvironment();
        
        // Debug em modo desenvolvimento
        if (ENV.get('DEBUG_GOOGLE_API', false)) {
            ENV.debugConfig();
        }
    });
}

// Exportar para uso global
window.ENV = ENV;
window.EnvironmentLoader = EnvironmentLoader;

// Exportar como módulo se suportado
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ENV, EnvironmentLoader };
}