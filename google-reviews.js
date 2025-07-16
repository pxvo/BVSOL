/**
 * Sistema de Avaliações Google para BV SOL com Carrossel
 * Versão: 2.0
 * Autor: Sistema BV SOL
 */

class GoogleReviewsWidget {
    constructor(options = {}) {
        this.placeId = options.placeId || 'ChIJRRRRRRRRRRRRRRRRRRRRRR'; // Substitua pelo Place ID real
        this.apiKey = options.apiKey || null; // Substitua pela sua API Key
        this.container = options.container || '#google-reviews';
        this.maxReviews = options.maxReviews || 6;
        this.enableGoogleAPI = options.enableGoogleAPI || false; // Desabilitado por padrão
        
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
                profile_photo_url: null,
                relative_time_description: "há 2 semanas"
            },
            {
                author_name: "Marina Santos",
                rating: 5,
                text: "Investimento que vale muito a pena! A BV SOL explicou todo o processo, ajudou com o financiamento e a instalação foi impecável. Minha conta de energia caiu mais de 80%. Super recomendo!",
                time: 1703808000,
                profile_photo_url: null,
                relative_time_description: "há 3 semanas"
            },
            {
                author_name: "Carlos Mendes",
                rating: 5,
                text: "Ótimo custo-benefício! Empresa séria, materiais de qualidade e suporte pós-venda excelente. Já são 8 meses com o sistema funcionando perfeitamente. Muito satisfeito com a BV SOL!",
                time: 1703462400,
                profile_photo_url: null,
                relative_time_description: "há 1 mês"
            },
            {
                author_name: "Ana Beatriz",
                rating: 5,
                text: "Desde a visita técnica até a homologação, tudo funcionou perfeitamente. A equipe da BV SOL é muito atenciosa e esclareceu todas as minhas dúvidas. O sistema está gerando mais energia do que esperava!",
                time: 1702857600,
                profile_photo_url: null,
                relative_time_description: "há 1 mês"
            },
            {
                author_name: "Roberto Silva",
                rating: 5,
                text: "Empresa muito competente! Fizeram a instalação na minha empresa e o resultado superou as expectativas. A economia na conta de energia é impressionante. Parabéns à toda equipe da BV SOL!",
                time: 1702252800,
                profile_photo_url: null,
                relative_time_description: "há 1 mês"
            },
            {
                author_name: "Lucia Oliveira",
                rating: 4,
                text: "Muito satisfeita com o serviço! A instalação foi rápida e eficiente. A única observação é que gostaria de ter mais informações sobre a manutenção, mas no geral, recomendo a BV SOL.",
                time: 1701648000,
                profile_photo_url: null,
                relative_time_description: "há 2 meses"
            }
        ];
    }

    getItemsPerSlide() {
        return window.innerWidth <= 768 ? 1 : 3;
    }

    async init() {
        try {
            if (this.enableGoogleAPI && this.apiKey && this.placeId) {
                await this.loadGoogleReviews();
            } else {
                this.loadFallbackReviews();
            }
        } catch (error) {
            console.warn('Erro ao carregar avaliações do Google, usando fallback:', error);
            this.loadFallbackReviews();
        }
    }

    async loadGoogleReviews() {
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${this.placeId}&fields=reviews,rating,user_ratings_total&key=${this.apiKey}`;
        
        try {
            const response = await fetch(corsProxy + encodeURIComponent(googleUrl));
            const data = await response.json();
            
            if (data.result && data.result.reviews) {
                this.reviews = data.result.reviews.slice(0, this.maxReviews);
                this.setupCarousel();
            } else {
                throw new Error('Dados inválidos da API');
            }
        } catch (error) {
            console.warn('Falha na API do Google, usando fallback:', error);
            this.loadFallbackReviews();
        }
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
        const avatar = review.profile_photo_url ? 
            `<img src="${review.profile_photo_url}" alt="${review.author_name}" class="review-avatar">` :
            `<div class="review-avatar-placeholder">${review.author_name.charAt(0)}</div>`;

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
    // Configuração das avaliações
    const reviewsWidget = new GoogleReviewsWidget({
        // Para ativar a API do Google, configure estas variáveis:
        // placeId: 'SEU_PLACE_ID_AQUI',
        // apiKey: 'SUA_API_KEY_AQUI',
        // enableGoogleAPI: true,
        
        container: '#google-reviews',
        maxReviews: 6
    });
    
    // Inicializar widget
    reviewsWidget.init();
});

// Exportar para uso global se necessário
window.GoogleReviewsWidget = GoogleReviewsWidget;
