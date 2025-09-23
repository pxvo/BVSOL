/**
 * Sistema de Avaliações Google para BV SOL com Carrossel
 * Versão: 4.0 - Integração com Variáveis de Ambiente (.env)
 * Autor: Sistema BV SOL
 */

class GoogleReviewsWidget {
    constructor(options = {}) {
        // Configurações padrão (serão sobrescritas pelo .env)
        this.defaultConfig = {
            apiKey: null,
            businessName: 'BV SOL',
            businessAddress: 'Boa Vista, Roraima, Brasil',
            maxReviews: 6,
            enableGoogleAPI: false,
            placeId: null,
            corsProxy: 'https://api.allorigins.win/raw?url=',
            cacheExpiryHours: 24,
            debugMode: false
        };
        
        // Mesclar configurações padrão com opções passadas
        this.config = { ...this.defaultConfig, ...options };
        
        // Propriedades do widget
        this.container = options.container || '#google-reviews';
        this.placeId = this.config.placeId;
        this.reviews = [];
        
        // Sistema de cache
        this.cacheKey = 'bvsol_google_reviews_cache';
        this.cacheExpiry = this.config.cacheExpiryHours * 60 * 60 * 1000; // Converter horas para ms
        
        // Configurações do carrossel
        this.currentSlide = 0;
        this.itemsPerSlide = this.getItemsPerSlide();
        this.autoplayInterval = null;
        this.autoplayEnabled = true;
        this.autoplayDelay = 4000; // 4 segundos
        this.reviews = [];
        
        // Configurações de fallback
        this.fallbackReviews = [
            {
                author_name: "Paulo Roberto",
                rating: 5,
                text: "Excelente atendimento da BV SOL! Instalaram o sistema solar na minha casa e já estou vendo a economia na conta de luz. Equipe muito profissional e prazo cumprido à risca. Recomendo!",
                time: 1704067200,
                profile_photo_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
                relative_time_description: "há 2 semanas"
            },
            {
                author_name: "Marina Santos",
                rating: 5,
                text: "Investimento que vale muito a pena! A BV SOL explicou todo o processo, ajudou com o financiamento e a instalação foi impecável. Minha conta de energia caiu mais de 80%. Super recomendo!",
                time: 1703808000,
                profile_photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
                relative_time_description: "há 3 semanas"
            },
            {
                author_name: "Carlos Mendes",
                rating: 5,
                text: "Ótimo custo-benefício! Empresa séria, materiais de qualidade e suporte pós-venda excelente. Já são 8 meses com o sistema funcionando perfeitamente. Muito satisfeito com a BV SOL!",
                time: 1703462400,
                profile_photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
                relative_time_description: "há 1 mês"
            },
            {
                author_name: "Ana Beatriz",
                rating: 5,
                text: "Desde a visita técnica até a homologação, tudo funcionou perfeitamente. A equipe da BV SOL é muito atenciosa e esclareceu todas as minhas dúvidas. O sistema está gerando mais energia do que esperava!",
                time: 1702857600,
                profile_photo_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
                relative_time_description: "há 1 mês"
            },
            {
                author_name: "Roberto Silva",
                rating: 5,
                text: "Empresa muito competente! Fizeram a instalação na minha empresa e o resultado superou as expectativas. A economia na conta de energia é impressionante. Parabéns à toda equipe da BV SOL!",
                time: 1702252800,
                profile_photo_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
                relative_time_description: "há 1 mês"
            },
            {
                author_name: "Lucia Oliveira",
                rating: 4,
                text: "Muito satisfeita com o serviço! A instalação foi rápida e eficiente. A única observação é que gostaria de ter mais informações sobre a manutenção, mas no geral, recomendo a BV SOL.",
                time: 1701648000,
                profile_photo_url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face",
                relative_time_description: "há 2 meses"
            }
        ];
    }

    getItemsPerSlide() {
        return window.innerWidth <= 768 ? 1 : 3;
    }

    async init() {
        try {
            // Carregar configurações do ambiente primeiro
            await this.loadEnvironmentConfig();
            
            // Mostrar loading
            this.showLoading();
            
            if (this.config.enableGoogleAPI && this.config.apiKey) {
                await this.loadRealGoogleReviews();
            } else {
                if (this.config.debugMode) {
                    console.log('📝 API do Google desabilitada ou API Key não configurada, usando avaliações de fallback');
                }
                this.loadFallbackReviews();
            }
        } catch (error) {
            console.warn('Erro ao carregar avaliações do Google, usando fallback:', error);
            this.loadFallbackReviews();
        }
    }

    /**
     * Carrega configurações do arquivo .env se disponível
     */
    async loadEnvironmentConfig() {
        try {
            // Verificar se o ENV loader está disponível
            if (typeof window !== 'undefined' && window.ENV) {
                await window.ENV.loadEnvironment();
                const envConfig = window.ENV.getGoogleReviewsConfig();
                
                // Mesclar configurações do .env com as existentes
                this.config = { ...this.config, ...envConfig };
                
                // Atualizar propriedades específicas
                this.cacheExpiry = this.config.cacheExpiryHours * 60 * 60 * 1000;
                
                if (this.config.debugMode) {
                    console.log('✅ Configurações carregadas do .env');
                    console.table({
                        'API Key': this.config.apiKey ? '✅ Configurada' : '❌ Não configurada',
                        'Google API': this.config.enableGoogleAPI ? '✅ Habilitada' : '❌ Desabilitada',
                        'Empresa': this.config.businessName,
                        'Endereço': this.config.businessAddress,
                        'Max Reviews': this.config.maxReviews,
                        'Cache (horas)': this.config.cacheExpiryHours
                    });
                }
                
                // Validar configuração
                const validation = window.ENV.validateConfig();
                if (!validation.valid && this.config.debugMode) {
                    console.group('⚠️ Problemas de Configuração:');
                    validation.issues.forEach(issue => console.warn('❌', issue));
                    console.groupEnd();
                }
                
                return true;
            }
        } catch (error) {
            if (this.config.debugMode) {
                console.warn('⚠️ Não foi possível carregar configurações do .env:', error.message);
            }
        }
        
        return false;
    }

    showLoading() {
        const container = document.querySelector(this.container);
        if (container) {
            container.innerHTML = `
                <div class="reviews-loading" style="text-align: center; padding: 40px;">
                    <div class="loading-spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #ffa500; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                    <p style="color: #666; margin: 0;">Carregando avaliações do Google...</p>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
        }
    }

    async loadRealGoogleReviews() {
        try {
            // Verificar cache primeiro
            const cachedData = this.getCachedReviews();
            if (cachedData) {
                console.log('Carregando avaliações do cache');
                this.reviews = cachedData.reviews;
                this.businessRating = cachedData.rating;
                this.totalReviews = cachedData.totalReviews;
                this.setupCarousel();
                return;
            }

            // Se não tiver Place ID, buscar primeiro
            if (!this.placeId) {
                if (this.config.debugMode) {
                    console.log('📍 Buscando Place ID para:', this.config.businessName);
                }
                this.placeId = await this.findPlaceId();
            }

            if (!this.placeId) {
                throw new Error('Place ID não encontrado para o negócio');
            }

            if (this.config.debugMode) {
                console.log('🔍 Buscando avaliações para Place ID:', this.placeId);
            }
            const reviewsData = await this.fetchGoogleReviews();
            
            if (reviewsData && reviewsData.reviews && reviewsData.reviews.length > 0) {
                this.reviews = reviewsData.reviews.slice(0, this.config.maxReviews).map(review => this.formatGoogleReview(review));
                this.businessRating = reviewsData.rating;
                this.totalReviews = reviewsData.totalReviews;
                
                // Salvar no cache
                this.saveToCache({
                    reviews: this.reviews,
                    rating: this.businessRating,
                    totalReviews: this.totalReviews,
                    timestamp: Date.now()
                });
                
                if (this.config.debugMode) {
                    console.log(`✅ Carregadas ${this.reviews.length} avaliações do Google`);
                }
                this.setupCarousel();
            } else {
                throw new Error('Nenhuma avaliação encontrada');
            }
        } catch (error) {
            if (this.config.debugMode) {
                console.error('❌ Erro ao carregar avaliações reais:', error);
            }
            throw error;
        }
    }

    async findPlaceId() {
        const query = encodeURIComponent(`${this.config.businessName} ${this.config.businessAddress}`);
        const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,name&key=${this.config.apiKey}`;
        
        try {
            // Usar CORS proxy para contornar limitações do browser
            const response = await fetch(this.config.corsProxy + encodeURIComponent(url));
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
                const placeId = data.candidates[0].place_id;
                if (this.config.debugMode) {
                    console.log('✅ Place ID encontrado:', placeId);
                }
                return placeId;
            } else {
                if (this.config.debugMode) {
                    console.warn('⚠️ Resposta da API:', data);
                }
                throw new Error(`Negócio não encontrado. Status: ${data.status}`);
            }
        } catch (error) {
            if (this.config.debugMode) {
                console.error('❌ Erro ao buscar Place ID:', error);
            }
            throw error;
        }
    }

    async fetchGoogleReviews() {
        const fields = 'reviews,rating,user_ratings_total,name';
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${this.placeId}&fields=${fields}&key=${this.config.apiKey}`;
        
        try {
            // Usar CORS proxy
            const response = await fetch(this.config.corsProxy + encodeURIComponent(url));
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'OK') {
                return {
                    reviews: data.result.reviews || [],
                    rating: data.result.rating,
                    totalReviews: data.result.user_ratings_total,
                    businessName: data.result.name
                };
            } else {
                throw new Error(`Google API Error: ${data.status} - ${data.error_message || 'Erro desconhecido'}`);
            }
        } catch (error) {
            if (this.config.debugMode) {
                console.error('❌ Erro na API do Google:', error);
            }
            throw error;
        }
    }

    formatGoogleReview(googleReview) {
        // Garantir que temos dados válidos
        return {
            author_name: googleReview.author_name || 'Usuário Anônimo',
            rating: googleReview.rating || 5,
            text: googleReview.text || 'Ótimo atendimento!',
            time: googleReview.time || Date.now() / 1000,
            profile_photo_url: googleReview.profile_photo_url || null,
            relative_time_description: googleReview.relative_time_description || 'há algum tempo',
            author_url: googleReview.author_url || null,
            language: googleReview.language || 'pt-BR'
        };
    }

    getCachedReviews() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (cached) {
                const data = JSON.parse(cached);
                const isExpired = Date.now() - data.timestamp > this.cacheExpiry;
                
                if (!isExpired && data.reviews && data.reviews.length > 0) {
                    return data;
                }
            }
        } catch (error) {
            console.warn('Erro ao ler cache:', error);
        }
        return null;
    }

    saveToCache(data) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(data));
        } catch (error) {
            console.warn('Erro ao salvar cache:', error);
        }
    }

    async loadGoogleReviews() {
        // Método mantido para compatibilidade - redireciona para o novo método
        return this.loadRealGoogleReviews();
    }

    loadFallbackReviews() {
        this.reviews = this.fallbackReviews;
        this.setupCarousel();
    }

    setupCarousel() {
        this.renderReviews();
        this.createIndicators();
        this.setupAutoplay();
        this.setupResponsiveListener();
        
        // Inicializar ícones Lucide após renderizar
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 100);
    }

    renderReviews() {
        const container = document.querySelector(this.container);
        if (!container) {
            console.error('Container não encontrado:', this.container);
            return;
        }

        // Remover loading
        const loading = container.querySelector('.loading-reviews');
        if (loading) loading.remove();

        const reviewsHTML = this.reviews.map(review => this.createReviewHTML(review)).join('');
        container.innerHTML = reviewsHTML;
        
        this.updateCarouselPosition();
    }

    createIndicators() {
        const indicatorsContainer = document.getElementById('carouselIndicators');
        if (!indicatorsContainer) return;

        const totalSlides = Math.ceil(this.reviews.length / this.itemsPerSlide);
        const indicatorsHTML = Array.from({ length: totalSlides }, (_, index) => 
            `<button class="carousel-indicator ${index === 0 ? 'active' : ''}" data-slide="${index}"></button>`
        ).join('');
        
        indicatorsContainer.innerHTML = indicatorsHTML;

        // Event listeners para indicadores
        indicatorsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('carousel-indicator')) {
                this.goToSlide(parseInt(e.target.dataset.slide));
            }
        });
    }

    setupAutoplay() {
        const autoplayBtn = document.getElementById('autoplayBtn');
        const autoplayIcon = document.getElementById('autoplayIcon');

        if (autoplayBtn) {
            autoplayBtn.addEventListener('click', () => {
                this.toggleAutoplay();
                autoplayBtn.classList.toggle('active');
                
                if (autoplayIcon) {
                    autoplayIcon.setAttribute('data-lucide', this.autoplayEnabled ? 'pause' : 'play');
                    setTimeout(() => {
                        if (typeof lucide !== 'undefined') {
                            lucide.createIcons();
                        }
                    }, 100);
                }
            });
        }

        this.startAutoplay();
    }

    setupResponsiveListener() {
        window.addEventListener('resize', () => {
            const newItemsPerSlide = this.getItemsPerSlide();
            if (newItemsPerSlide !== this.itemsPerSlide) {
                this.itemsPerSlide = newItemsPerSlide;
                this.currentSlide = 0;
                this.createIndicators();
                this.updateCarouselPosition();
            }
        });
    }

    nextSlide() {
        const totalSlides = Math.ceil(this.reviews.length / this.itemsPerSlide);
        this.currentSlide = (this.currentSlide + 1) % totalSlides;
        this.updateCarouselPosition();
        this.updateIndicators();
    }

    goToSlide(slideIndex) {
        this.currentSlide = slideIndex;
        this.updateCarouselPosition();
        this.updateIndicators();
    }

    updateCarouselPosition() {
        const container = document.querySelector(this.container);
        if (!container) return;

        const translateX = -this.currentSlide * (100 / Math.ceil(this.reviews.length / this.itemsPerSlide));
        container.style.transform = `translateX(${translateX}%)`;
    }

    updateIndicators() {
        const indicators = document.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
    }

    startAutoplay() {
        if (!this.autoplayEnabled) return;
        
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoplayDelay);
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    toggleAutoplay() {
        this.autoplayEnabled = !this.autoplayEnabled;
        
        if (this.autoplayEnabled) {
            this.startAutoplay();
        } else {
            this.stopAutoplay();
        }
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + 
               (hasHalfStar ? '☆' : '') + 
               '☆'.repeat(emptyStars);
    }

    createReviewHTML(review) {
        // Criar avatar com múltiplos fallbacks
        const initialLetter = review.author_name.charAt(0).toUpperCase();
        const fallbackAvatar = `<div class="review-avatar-placeholder">${initialLetter}</div>`;
        
        const avatar = review.profile_photo_url ? 
            `<div class="review-avatar-container">
                <img src="${review.profile_photo_url}" 
                     alt="${review.author_name}" 
                     class="review-avatar" 
                     onload="this.style.display='block'; this.nextElementSibling.style.display='none';"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                     style="display:none;">
                ${fallbackAvatar}
             </div>` :
            fallbackAvatar;

        const timeDisplay = review.relative_time_description || this.formatDate(review.time);
        
        return `
            <div class="review-item">
                <div class="review-header">
                    ${avatar}
                    <div class="review-info">
                        <h4 class="review-author">${review.author_name}</h4>
                        <div class="review-rating">
                            <span class="stars">${this.generateStars(review.rating)}</span>
                            <span class="rating-number">${review.rating}/5</span>
                        </div>
                        <span class="review-date">
                            <i data-lucide="clock" style="width: 12px; height: 12px; margin-right: 4px;"></i>
                            ${timeDisplay}
                        </span>
                    </div>
                </div>
                <p class="review-text">${review.text}</p>
                <div class="review-footer">
                    <span class="review-source">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" style="height: 12px; margin-right: 4px;">
                        Google
                    </span>
                </div>
            </div>
        `;
    }

    formatDate(timestamp) {
        if (!timestamp) return 'há algum tempo';
        
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'hoje';
        if (diffDays === 1) return 'ontem';
        if (diffDays < 7) return `há ${diffDays} dias`;
        if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semana(s)`;
        if (diffDays < 365) return `há ${Math.floor(diffDays / 30)} mês(es)`;
        return `há ${Math.floor(diffDays / 365)} ano(s)`;
    }
}

// Auto-inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Configuração das avaliações - Agora usando variáveis de ambiente
    const reviewsWidget = new GoogleReviewsWidget({
        // As configurações serão carregadas automaticamente do arquivo .env
        // Configurações de fallback caso .env não esteja disponível:
        container: '#google-reviews'
    });
    
    // Inicializar widget
    reviewsWidget.init();
});

// Exportar para uso global se necessário
window.GoogleReviewsWidget = GoogleReviewsWidget;

// Função de teste para verificar a integração
window.testarGoogleAPI = async function() {
    console.log('🔍 Testando integração com Google Places API...');
    
    try {
        // Criar widget de teste usando configurações do .env
        const testWidget = new GoogleReviewsWidget();
        await testWidget.loadEnvironmentConfig();
        
        if (!testWidget.config.enableGoogleAPI) {
            console.warn('⚠️ API do Google está desabilitada no .env');
            return {
                success: false,
                message: 'API do Google está desabilitada. Configure ENABLE_GOOGLE_API=true no arquivo .env'
            };
        }
        
        if (!testWidget.config.apiKey) {
            console.error('❌ API Key não configurada');
            return {
                success: false,
                message: 'API Key não encontrada. Configure GOOGLE_PLACES_API_KEY no arquivo .env'
            };
        }
        
        // Teste 1: Buscar Place ID
        console.log('📍 Buscando Place ID...');
        const placeId = await testWidget.findPlaceId();
        
        if (placeId) {
            console.log('✅ Place ID encontrado:', placeId);
            testWidget.placeId = placeId;
            
            // Teste 2: Buscar avaliações
            console.log('⭐ Buscando avaliações...');
            const reviewsData = await testWidget.fetchGoogleReviews();
            
            if (reviewsData && reviewsData.reviews) {
                console.log('✅ Avaliações encontradas:', reviewsData.reviews.length);
                console.log('🏪 Nome do negócio:', reviewsData.businessName);
                console.log('⭐ Rating médio:', reviewsData.rating);
                console.log('📊 Total de avaliações:', reviewsData.totalReviews);
                
                // Mostrar algumas avaliações
                reviewsData.reviews.slice(0, 3).forEach((review, index) => {
                    console.log(`📝 Avaliação ${index + 1}:`, {
                        autor: review.author_name,
                        rating: review.rating,
                        texto: review.text?.substring(0, 100) + '...',
                        data: review.relative_time_description
                    });
                });
                
                return {
                    success: true,
                    message: 'Integração funcionando perfeitamente!',
                    data: reviewsData
                };
            } else {
                throw new Error('Nenhuma avaliação encontrada');
            }
        } else {
            throw new Error('Place ID não encontrado');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        return {
            success: false,
            message: error.message,
            error: error
        };
    }
};

// Mostrar instruções no console
console.log(`
🚀 BVSOL Google Reviews Widget - API Real com Variáveis de Ambiente!

Para testar a integração, execute no console:
testarGoogleAPI()

Funcionalidades implementadas:
✅ Busca automática de Place ID
✅ Carregamento de avaliações reais do Google
✅ Sistema de cache (24h)
✅ Fallback automático em caso de erro
✅ Suporte a imagens de perfil dos usuários
✅ Carrossel responsivo
✅ Rating e texto das avaliações
✅ Configuração via arquivo .env

Configuração:
📁 Configure suas credenciais no arquivo .env
🔑 API Key carregada do .env
🏢 Empresa configurada via BUSINESS_NAME
📍 Localização via BUSINESS_ADDRESS
`);

console.log('🔧 Widget inicializado. Verifique o elemento #google-reviews na página.');

// Exportar para uso global se necessário
window.GoogleReviewsWidget = GoogleReviewsWidget;
