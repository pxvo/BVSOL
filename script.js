$(document).ready(function() {
    // Inicializar ícones Lucide imediatamente
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Inicializar navegação mobile
    initMobileNav();
    
    // Sistema de Notificações Personalizadas
    const NotificationSystem = {
        container: null,
        
        init() {
            // Criar container de notificações se não existir
            if (!this.container) {
                this.container = $(`
                    <div id="notification-container" class="notification-container">
                    </div>
                `);
                $('body').append(this.container);
            }
        },
        
        show(message, type = 'info', duration = 4000) {
            this.init();
            
            const icons = {
                success: 'check-circle',
                error: 'alert-circle', 
                warning: 'alert-triangle',
                info: 'info'
            };
            
            const notification = $(`
                <div class="notification notification-${type}">
                    <div class="notification-content">
                        <i data-lucide="${icons[type]}" class="notification-icon"></i>
                        <span class="notification-message">${message}</span>
                        <button class="notification-close" onclick="NotificationSystem.close(this)">
                            <i data-lucide="x" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                    <div class="notification-progress"></div>
                </div>
            `);
            
            this.container.append(notification);
            lucide.createIcons();
            
            // Animação de entrada
            setTimeout(() => {
                notification.addClass('notification-show');
            }, 100);
            
            // Progress bar animation
            const progressBar = notification.find('.notification-progress');
            setTimeout(() => {
                progressBar.css('animation', `progress-shrink ${duration}ms linear forwards`);
            }, 100);
            
            // Auto remove
            if (duration > 0) {
                setTimeout(() => {
                    this.close(notification.find('.notification-close')[0]);
                }, duration);
            }
            
            return notification;
        },
        
        close(element) {
            const notification = $(element).closest('.notification');
            notification.removeClass('notification-show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        },
        
        success(message, duration = 4000) {
            return this.show(message, 'success', duration);
        },
        
        error(message, duration = 5000) {
            return this.show(message, 'error', duration);
        },
        
        warning(message, duration = 4500) {
            return this.show(message, 'warning', duration);
        },
        
        info(message, duration = 4000) {
            return this.show(message, 'info', duration);
        }
    };
    
    // Tornar global
    window.NotificationSystem = NotificationSystem;

    // Smooth scroll para links âncora
    $('a[href^="#"]').on('click', function(event) {
        var target = $(this.getAttribute('href'));
        if (target.length) {
            event.preventDefault();
            const headerHeight = $('#mainHeader').outerHeight() || 0;
            const offset = headerHeight + 20; // 20px de margem extra
            $('html, body').stop().animate({
                scrollTop: target.offset().top - offset
            }, 1000);
        }
    });

    // FAQ toggle
    $('.faq-pergunta').on('click', function() {
        const item = $(this).closest('.faq-item');
        item.toggleClass('active');
        $('.faq-item').not(item).removeClass('active');
    });

    // Sistema de Cotação
    const cotacao = {
        dados: {
            nome: '',
            endereco: '',
            tipoLocal: '', // rural ou capital
            telefone: '',
            cpf: '',
            valorConta: 0,
            kitEscolhido: null
        },
        
        etapaAtual: 0,
        
        kits: [
            // RESIDENCIAL - Pequeno Porte
            {
                nome: "Kit Starter 150kWh",
                potencia: "1,05kWp",
                economia: "Até R$ 135/mês",
                paineis: "2 painéis de 525Wp",
                preco: "A partir de R$ 8.500",
                kwh: 150,
                categoria: "residencial",
                ideal: "Apartamentos pequenos, 1-2 pessoas"
            },
            {
                nome: "Kit Econômico 300kWh",
                potencia: "2,1kWp",
                economia: "Até R$ 270/mês",
                paineis: "5 painéis de 420Wp",
                preco: "A partir de R$ 12.500",
                kwh: 300,
                categoria: "residencial",
                ideal: "Casas pequenas, 2-3 pessoas"
            },
            {
                nome: "Kit Básico 500kWh",
                potencia: "3,48kWp",
                economia: "Até R$ 450/mês",
                paineis: "8 painéis de 435Wp",
                preco: "A partir de R$ 12.305,09",
                kwh: 500,
                categoria: "residencial",
                ideal: "Casas médias, 3-4 pessoas"
            },
            {
                nome: "Kit Residencial 600kWh", 
                potencia: "4,2kWp",
                economia: "Até R$ 540/mês",
                paineis: "10 painéis de 420Wp",
                preco: "A partir de R$ 22.000",
                kwh: 600,
                categoria: "residencial",
                ideal: "Casas com ar condicionado"
            },
            {
                nome: "Kit Confort 700kWh",
                potencia: "5,59kWp", 
                economia: "Até R$ 630/mês",
                paineis: "13 painéis de 430Wp",
                preco: "A partir de R$ 14.578,65",
                kwh: 700,
                categoria: "residencial",
                ideal: "Casas grandes, 4-5 pessoas"
            },
            {
                nome: "Kit Premium 1000kWh",
                potencia: "6,96kWp",
                economia: "Até R$ 900/mês", 
                paineis: "16 painéis de 435Wp",
                preco: "A partir de R$ 18.585,64",
                kwh: 1000,
                categoria: "residencial",
                ideal: "Casas de alto padrão"
            },
            {
                nome: "Kit Family Plus 1200kWh",
                potencia: "8,4kWp",
                economia: "Até R$ 1.080/mês", 
                paineis: "20 painéis de 420Wp",
                preco: "A partir de R$ 20.664,77",
                kwh: 1200,
                categoria: "residencial",
                ideal: "Casas grandes com piscina"
            },
            
            // COMERCIAL - Pequeno e Médio Porte
            {
                nome: "Kit Pequeno Comércio 800kWh",
                potencia: "5,59kWp",
                economia: "Até R$ 720/mês", 
                paineis: "13 painéis de 430Wp",
                preco: "A partir de R$ 28.500",
                kwh: 800,
                categoria: "comercial",
                ideal: "Lojas, consultórios, pequenos escritórios"
            },
            {
                nome: "Kit Empresarial 1500kWh",
                potencia: "10,5kWp",
                economia: "Até R$ 1.350/mês", 
                paineis: "25 painéis de 420Wp",
                preco: "A partir de R$ 24.539,58",
                kwh: 1500,
                categoria: "comercial",
                ideal: "Escritórios médios, clínicas"
            },
            {
                nome: "Kit Comercial 2000kWh",
                potencia: "14,03kWp",
                economia: "Até R$ 1.800/mês", 
                paineis: "33 painéis de 425Wp",
                preco: "A partir de R$ 33.452,54",
                kwh: 2000,
                categoria: "comercial",
                ideal: "Padarias, farmácias, restaurantes"
            },
            {
                nome: "Kit Business 2500kWh",
                potencia: "17,4kWp",
                economia: "Até R$ 2.250/mês", 
                paineis: "40 painéis de 435Wp",
                preco: "A partir de R$ 85.000",
                kwh: 2500,
                categoria: "comercial",
                ideal: "Supermercados pequenos, academias"
            },
            {
                nome: "Kit Corporativo 3500kWh",
                potencia: "24,36kWp",
                economia: "Até R$ 3.150/mês", 
                paineis: "56 painéis de 435Wp",
                preco: "A partir de R$ 118.000",
                kwh: 3500,
                categoria: "comercial",
                ideal: "Prédios comerciais, hotéis pequenos"
            },
            
            // INDUSTRIAL - Médio e Grande Porte
            {
                nome: "Kit Industrial Básico 3000kWh",
                potencia: "21,0kWp",
                economia: "Até R$ 2.700/mês", 
                paineis: "50 painéis de 420Wp",
                preco: "A partir de R$ 95.000",
                kwh: 3000,
                categoria: "industrial",
                ideal: "Pequenas indústrias, galpões"
            },
            {
                nome: "Kit Industrial Plus 5000kWh",
                potencia: "34,8kWp",
                economia: "Até R$ 4.500/mês", 
                paineis: "80 painéis de 435Wp",
                preco: "A partir de R$ 155.000",
                kwh: 5000,
                categoria: "industrial",
                ideal: "Indústrias médias, centros de distribuição"
            },
            {
                nome: "Kit Industrial Pro 7500kWh",
                potencia: "52,2kWp",
                economia: "Até R$ 6.750/mês", 
                paineis: "120 painéis de 435Wp",
                preco: "A partir de R$ 230.000",
                kwh: 7500,
                categoria: "industrial",
                ideal: "Grandes indústrias, shopping centers"
            },
            {
                nome: "Kit Industrial Max 10000kWh",
                potencia: "69,6kWp",
                economia: "Até R$ 9.000/mês", 
                paineis: "160 painéis de 435Wp",
                preco: "A partir de R$ 305.000",
                kwh: 10000,
                categoria: "industrial",
                ideal: "Complexos industriais, hipermercados"
            },
            
            // RURAL E AGRONEGÓCIO
            {
                nome: "Kit Rural 1500kWh",
                potencia: "10,5kWp",
                economia: "Até R$ 1.350/mês", 
                paineis: "25 painéis de 420Wp",
                preco: "A partir de R$ 24.539,58",
                kwh: 1500,
                categoria: "rural",
                ideal: "Propriedades rurais, casas de campo"
            },
            {
                nome: "Kit Agro 4000kWh",
                potencia: "27,84kWp",
                economia: "Até R$ 3.600/mês", 
                paineis: "64 painéis de 435Wp",
                preco: "A partir de R$ 125.000",
                kwh: 4000,
                categoria: "rural",
                ideal: "Granjas, estufas, irrigação"
            },
            {
                nome: "Kit Fazenda 8000kWh",
                potencia: "55,68kWp",
                economia: "Até R$ 7.200/mês", 
                paineis: "128 painéis de 435Wp",
                preco: "A partir de R$ 245.000",
                kwh: 8000,
                categoria: "rural",
                ideal: "Grandes fazendas, processamento agrícola"
            }
        ],

        iniciar() {
            this.criarModal();
            this.mostrarEtapa();
            
            // Notificação de boas-vindas
            setTimeout(() => {
                NotificationSystem.info('Simulação iniciada! Preencha os dados para receber sua proposta personalizada. 🌞');
            }, 800);
        },

        criarModal() {
            const modalHTML = `
                <div id="cotacaoModal" class="cotacao-modal">
                    <div class="cotacao-container">
                        <div class="cotacao-header">
                            <div class="header-title">
                                <h3><i data-lucide="zap" style="width: 24px; height: 24px; margin-right: 8px;"></i> Simulador de Energia Solar</h3>
                            </div>
                            <button class="fechar-modal"><i data-lucide="x" style="width: 20px; height: 20px;"></i></button>
                        </div>
                        <div class="cotacao-progress">
                            <div class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                            <span class="progress-text">Etapa 1 de 6</span>
                        </div>
                        <div class="cotacao-content">
                            <div class="chat-messages"></div>
                            <div class="chat-input-area"></div>
                        </div>
                    </div>
                </div>
            `;
            
            $('body').append(modalHTML);
            lucide.createIcons(); // Inicializar ícones Lucide
            
            // Event listeners
            $('.fechar-modal').on('click', () => this.fecharModal());
            $(window).on('click', (e) => {
                if (e.target.id === 'cotacaoModal') {
                    this.fecharModal();
                }
            });
        },

        mostrarEtapa() {
            const etapas = [
                this.etapaNome.bind(this),
                this.etapaEndereco.bind(this), 
                this.etapaTipoLocal.bind(this),
                this.etapaTelefone.bind(this),
                this.etapaValorConta.bind(this),
                this.etapaEscolhaKit.bind(this)
            ];

            if (this.etapaAtual < etapas.length) {
                etapas[this.etapaAtual]();
                this.atualizarProgress();
            }
        },

        adicionarMensagem(texto, tipo = 'bot') {
            const mensagem = `
                <div class="chat-message ${tipo}">
                    <div class="message-content">
                        ${tipo === 'bot' ? '🤖' : '👤'} ${texto}
                    </div>
                </div>
            `;
            $('.chat-messages').append(mensagem);
            $('.chat-messages').scrollTop($('.chat-messages')[0].scrollHeight);
        },

        etapaNome() {
            this.adicionarMensagem('Olá! Vou te ajudar a simular um sistema de energia solar personalizado. 😊<br><br>Para começar, qual é o seu nome completo?');
            
            const inputHTML = `
                <div class="input-group">
                    <input type="text" id="nomeInput" placeholder="Digite seu nome completo..." class="chat-input">
                    <button onclick="cotacao.processarNome()" class="btn-enviar">
                        <i data-lucide="send" style="width: 16px; height: 16px;"></i> Enviar
                    </button>
                </div>
            `;
            $('.chat-input-area').html(inputHTML);
            lucide.createIcons(); // Inicializar ícones Lucide
            $('#nomeInput').focus();
            
            // Validação em tempo real
            $('#nomeInput').on('input', function() {
                const nome = $(this).val().trim();
                const inputGroup = $(this).closest('.input-group');
                
                if (nome.length >= 3) {
                    $(this).removeClass('input-error').addClass('input-success');
                    inputGroup.removeClass('input-error').addClass('input-success');
                } else if (nome.length > 0) {
                    $(this).removeClass('input-success').addClass('input-error');
                    inputGroup.removeClass('input-success').addClass('input-error');
                } else {
                    $(this).removeClass('input-success input-error');
                    inputGroup.removeClass('input-success input-error');
                }
            });
            
            $('#nomeInput').on('keypress', (e) => {
                if (e.which === 13) this.processarNome();
            });
        },

        processarNome() {
            const nome = $('#nomeInput').val().trim();
            if (nome.length < 3) {
                NotificationSystem.warning('Por favor, digite seu nome completo com pelo menos 3 caracteres.');
                $('#nomeInput').focus();
                return;
            }
            
            this.dados.nome = nome;
            this.adicionarMensagem(nome, 'user');
            this.proximaEtapa();
        },

        etapaEndereco() {
            this.adicionarMensagem(`Prazer em conhecê-lo, ${this.dados.nome}! 👋<br><br>Agora preciso saber seu endereço para calcularmos a melhor instalação:`);
            
            const inputHTML = `
                <div class="input-group">
                    <input type="text" id="enderecoInput" placeholder="Rua, número, bairro, cidade..." class="chat-input">
                    <button onclick="cotacao.processarEndereco()" class="btn-enviar">
                        <i data-lucide="send" style="width: 16px; height: 16px;"></i> Enviar
                    </button>
                </div>
            `;
            $('.chat-input-area').html(inputHTML);
            lucide.createIcons();
            $('#enderecoInput').focus();
            
            // Dica automática
            setTimeout(() => {
                NotificationSystem.info('💡 Dica: Quanto mais detalhado o endereço, melhor será nossa análise de viabilidade solar!');
            }, 2000);
            
            // Validação em tempo real
            $('#enderecoInput').on('input', function() {
                const endereco = $(this).val().trim();
                const inputGroup = $(this).closest('.input-group');
                
                if (endereco.length >= 10) {
                    $(this).removeClass('input-error').addClass('input-success');
                    inputGroup.removeClass('input-error').addClass('input-success');
                } else if (endereco.length > 0) {
                    $(this).removeClass('input-success').addClass('input-error');
                    inputGroup.removeClass('input-success').addClass('input-error');
                } else {
                    $(this).removeClass('input-success input-error');
                    inputGroup.removeClass('input-success input-error');
                }
            });
            
            $('#enderecoInput').on('keypress', (e) => {
                if (e.which === 13) this.processarEndereco();
            });
        },

        processarEndereco() {
            const endereco = $('#enderecoInput').val().trim();
            if (endereco.length < 10) {
                NotificationSystem.warning('Por favor, digite um endereço mais completo (rua, número, bairro, cidade).');
                $('#enderecoInput').focus();
                return;
            }
            
            this.dados.endereco = endereco;
            this.adicionarMensagem(endereco, 'user');
            this.proximaEtapa();
        },

        etapaTipoLocal() {
            this.adicionarMensagem('Perfeito! Para melhor atendimento, me informe o tipo de localização: 🏡');
            
            const opcoesHTML = `
                <div class="opcoes-tipo-local">
                    <button class="opcao-local" onclick="cotacao.processarTipoLocal('capital')">
                        <i data-lucide="building-2" style="width: 24px; height: 24px; margin-bottom: 8px;"></i>
                        <span class="local-title">Capital/Cidade</span>
                        <span class="local-desc">Área urbana, cidade ou capital</span>
                    </button>
                    <button class="opcao-local" onclick="cotacao.processarTipoLocal('rural')">
                        <i data-lucide="trees" style="width: 24px; height: 24px; margin-bottom: 8px;"></i>
                        <span class="local-title">Zona Rural</span>
                        <span class="local-desc">Fazenda, sítio ou área rural</span>
                    </button>
                </div>
            `;
            $('.chat-input-area').html(opcoesHTML);
            lucide.createIcons();
        },

        processarTipoLocal(tipo) {
            // Adicionar estado de loading
            $('.opcao-local').prop('disabled', true);
            
            this.dados.tipoLocal = tipo;
            const tipoExibicao = tipo === 'capital' ? 'Capital/Cidade' : 'Zona Rural';
            this.adicionarMensagem(tipoExibicao, 'user');
            
            // Feedback personalizado baseado no tipo
            if (tipo === 'rural') {
                setTimeout(() => {
                    this.adicionarMensagem('Ótimo! Temos experiência em instalações rurais e podemos incluir sistemas de bombeamento solar! 🚜⚡');
                    NotificationSystem.info('💡 Zona rural: Consideraremos distância da rede elétrica e necessidades específicas.');
                }, 500);
            } else {
                setTimeout(() => {
                    this.adicionarMensagem('Perfeito! Área urbana facilita a instalação e manutenção! 🏙️✅');
                    NotificationSystem.info('🏢 Área urbana: Instalação mais rápida e manutenção facilitada.');
                }, 500);
            }
            
            setTimeout(() => {
                this.proximaEtapa();
            }, 1500);
        },

        etapaTelefone() {
            this.adicionarMensagem('Perfeito! Agora preciso do seu número de telefone para entrarmos em contato:');
            
            const inputHTML = `
                <div class="input-group">
                    <input type="tel" id="telefoneInput" placeholder="(00) 00000-0000" class="chat-input">
                    <button onclick="cotacao.processarTelefone()" class="btn-enviar">
                        <i data-lucide="send" style="width: 16px; height: 16px;"></i> Enviar
                    </button>
                </div>
            `;
            $('.chat-input-area').html(inputHTML);
            lucide.createIcons();
            $('#telefoneInput').focus();
            
            // Máscara de telefone
            $('#telefoneInput').on('input', function() {
                let value = this.value.replace(/\D/g, '');
                value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
                value = value.replace(/(\d)(\d{4})$/, '$1-$2');
                this.value = value;
                
                const inputGroup = $(this).closest('.input-group');
                
                // Validação visual
                if (value.length >= 14) {
                    $(this).removeClass('input-error').addClass('input-success');
                    inputGroup.removeClass('input-error').addClass('input-success');
                } else if (value.length > 0) {
                    $(this).removeClass('input-success').addClass('input-error');
                    inputGroup.removeClass('input-success').addClass('input-error');
                } else {
                    $(this).removeClass('input-success input-error');
                    inputGroup.removeClass('input-success input-error');
                }
            });
            
            $('#telefoneInput').on('keypress', (e) => {
                if (e.which === 13) this.processarTelefone();
            });
        },

        processarTelefone() {
            const telefone = $('#telefoneInput').val().trim();
            if (telefone.length < 14) {
                NotificationSystem.warning('Por favor, digite um número de telefone válido com DDD.');
                $('#telefoneInput').focus();
                return;
            }
            
            this.dados.telefone = telefone;
            this.adicionarMensagem(telefone, 'user');
            this.proximaEtapa();
        },

        etapaValorConta() {
            this.adicionarMensagem('Agora a pergunta mais importante! 💡<br><br>Qual faixa de valor você paga na sua conta de energia elétrica por mês?');
            
            const opcoesHTML = `
                <div class="opcoes-valor-grid">
                    <button class="opcao-valor-compact" onclick="cotacao.processarFaixaValor(500, 800)">
                        <i data-lucide="home" style="width: 18px; height: 18px;"></i>
                        <div class="valor-info">
                            <span class="valor-range">R$ 500 - 800</span>
                            <span class="valor-desc">Residencial Básico</span>
                        </div>
                    </button>
                    <button class="opcao-valor-compact" onclick="cotacao.processarFaixaValor(850, 1200)">
                        <i data-lucide="building" style="width: 18px; height: 18px;"></i>
                        <div class="valor-info">
                            <span class="valor-range">R$ 850 - 1.200</span>
                            <span class="valor-desc">Residencial Médio</span>
                        </div>
                    </button>
                    <button class="opcao-valor-compact" onclick="cotacao.processarFaixaValor(1250, 1600)">
                        <i data-lucide="store" style="width: 18px; height: 18px;"></i>
                        <div class="valor-info">
                            <span class="valor-range">R$ 1.250 - 1.600</span>
                            <span class="valor-desc">Comercial/Premium</span>
                        </div>
                    </button>
                    <button class="opcao-valor-compact destacado" onclick="cotacao.redirecionarWhatsApp()">
                        <i data-lucide="factory" style="width: 18px; height: 18px;"></i>
                        <div class="valor-info">
                            <span class="valor-range">R$ 2.000+</span>
                            <span class="valor-desc">Empresarial</span>
                        </div>
                    </button>
                </div>
            `;
            $('.chat-input-area').html(opcoesHTML);
            lucide.createIcons();
        },

        processarFaixaValor(valorMin, valorMax) {
            // Adicionar estado de loading
            $('.opcao-valor-compact').prop('disabled', true);
            
            // Usar valor médio da faixa para os cálculos
            const valorMedio = (valorMin + valorMax) / 2;
            this.dados.valorConta = valorMedio;
            
            // Exibir a faixa de valores
            const valorExibicao = `R$ ${valorMin} - R$ ${valorMax.toLocaleString('pt-BR')}`;
            
            this.adicionarMensagem(valorExibicao, 'user');
            
            // Feedback de sucesso
            NotificationSystem.success('Faixa de valor selecionada! Calculando kits ideais... ⚡');
            
            setTimeout(() => {
                this.proximaEtapa();
            }, 800);
        },

        redirecionarWhatsApp() {
            this.dados.valorConta = 2500; // Valor padrão para contas empresariais/industriais
            this.adicionarMensagem('R$ 2.000 ou mais', 'user');
            
            setTimeout(() => {
                this.adicionarMensagem('Para contas empresariais/industriais de R$ 2.000 ou mais, nossa equipe especializada fará um atendimento personalizado! 🎯<br><br>Vou conectar você diretamente com nossos especialistas via WhatsApp para uma proposta customizada! 📱');
                
                setTimeout(() => {
                    const mensagem = this.gerarMensagemWhatsAppEmpresarial();
                    const numeroWhatsApp = '5595991316410';
                    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
                    
                    NotificationSystem.success('Redirecionando para atendimento especializado... Nossa equipe empresarial te aguarda! 🏢✅');
                    
                    setTimeout(() => {
                        window.open(url, '_blank');
                        this.fecharModal();
                    }, 1000);
                }, 2000);
            }, 500);
        },

        gerarMensagemWhatsAppEmpresarial() {
            return `🌞 *SIMULAÇÃO ENERGIA SOLAR - BVSOL* 🌞

📋 *DADOS DO CLIENTE:*
👤 Nome: ${this.dados.nome}
📍 Endereço: ${this.dados.endereco}
📞 Telefone: ${this.dados.telefone}
💰 Conta atual: R$ 2.000 ou mais/mês

� *ATENDIMENTO EMPRESARIAL/INDUSTRIAL*
✅ Cliente com alto consumo energético
✅ Necessita projeto personalizado
✅ Solicita visita técnica especializada
✅ Potencial para sistema de grande porte

📞 *Gostaria de agendar uma consulta especializada para projetos empresariais/industriais!*

_Simulação feita em: ${new Date().toLocaleDateString('pt-BR')}_`;
        },

        etapaEscolhaKit() {
            const kwh = Math.round(this.dados.valorConta / 0.9); // Estimativa kWh baseada no valor
            
            // Determinar a faixa de valor para exibição
            let faixaValor = '';
            if (this.dados.valorConta <= 650) {
                faixaValor = 'R$ 500 - R$ 800';
            } else if (this.dados.valorConta <= 1025) {
                faixaValor = 'R$ 850 - R$ 1.200';
            } else if (this.dados.valorConta <= 1425) {
                faixaValor = 'R$ 1.250 - R$ 1.600';
            } else {
                faixaValor = 'R$ 2.000 ou mais';
            }
            
            this.adicionarMensagem(`Baseado na sua conta de ${faixaValor}, você consome aproximadamente ${kwh} kWh por mês.<br><br>Aqui estão os 4 kits mais adequados para você:`);
            
            let kitsHTML = '<div class="kits-container-compact">';
            
            // Filtrar e selecionar apenas 4 kits mais relevantes
            const kitsFiltrados = this.kits.filter(kit => kit.kwh <= 1500);
            
            // Ordenar kits por proximidade do consumo
            const kitsOrdenados = kitsFiltrados.sort((a, b) => 
                Math.abs(a.kwh - kwh) - Math.abs(b.kwh - kwh)
            );
            
            // Pegar apenas os 4 kits mais relevantes
            const kitsRelevantes = kitsOrdenados.slice(0, 4);
            
            kitsRelevantes.forEach((kit, index) => {
                const isRecomendado = index === 0;
                const categoriaClass = kit.categoria || 'residencial';
                const recomendado = isRecomendado ? '<span class="recomendado-badge"><i data-lucide="star" style="width: 10px; height: 10px; margin-right: 2px;"></i>IDEAL</span>' : '';
                
                // Simplificar informações para melhor visualização
                const potenciaSimples = kit.potencia.replace('kWp', 'kW');
                const economiaSimples = kit.economia.replace('Até ', '').replace('/mês', '');
                const paineisSimples = kit.paineis.split(' ')[0] + ' painéis';
                
                kitsHTML += `
                    <div class="kit-card-compact ${isRecomendado ? 'kit-recomendado' : ''}" onclick="cotacao.escolherKit(${this.kits.indexOf(kit)})">
                        <div class="kit-header-compact">
                            <span class="kit-categoria-badge ${categoriaClass}">${categoriaClass.toUpperCase()}</span>
                            ${recomendado}
                        </div>
                        <div class="kit-title-compact">${kit.nome}</div>
                        <div class="kit-specs-compact">
                            <div class="spec-row">
                                <i data-lucide="zap" style="width: 12px; height: 12px;"></i>
                                <span>${potenciaSimples}</span>
                            </div>
                            <div class="spec-row">
                                <i data-lucide="trending-down" style="width: 12px; height: 12px;"></i>
                                <span>${economiaSimples}</span>
                            </div>
                            <div class="spec-row">
                                <i data-lucide="square" style="width: 12px; height: 12px;"></i>
                                <span>${paineisSimples}</span>
                            </div>
                        </div>
                        <div class="kit-price-compact">${kit.preco}</div>
                        ${kit.ideal ? `<div class="kit-ideal-compact">${kit.ideal}</div>` : ''}
                    </div>
                `;
            });
            
            kitsHTML += '</div>';
            $('.chat-input-area').html(kitsHTML);
            lucide.createIcons();
            
            // Notificação informativa sobre os kits
            setTimeout(() => {
                NotificationSystem.info('⚡ Kits carregados! Clique no kit ideal para você. O kit recomendado está destacado.');
            }, 1000);
        },

        escolherKit(index) {
            this.dados.kitEscolhido = this.kits[index];
            $('.kit-card').removeClass('selecionado');
            $(`.kit-card:eq(${$('.kit-card').index($('.kit-card').filter(':contains("' + this.dados.kitEscolhido.nome + '")')[0])})`).addClass('selecionado');
            
            this.adicionarMensagem(`${this.dados.kitEscolhido.nome}`, 'user');
            
            // Notificação de sucesso
            NotificationSystem.success(`Kit "${this.dados.kitEscolhido.nome}" selecionado com sucesso! 🎉`);
            
            setTimeout(() => {
                this.finalizarCotacao();
            }, 500);
        },

        finalizarCotacao() {
            this.adicionarMensagem('Perfeito! Agora vou gerar sua proposta personalizada e encaminhar para nosso WhatsApp para você receber um orçamento detalhado! 🎉');
            
            const btnHTML = `
                <button onclick="cotacao.enviarWhatsApp()" class="btn-whatsapp">
                    <img src="img/wppV.png" alt="WhatsApp" style="width: 20px; height: 20px; margin-right: 8px;">
                    Enviar para WhatsApp
                </button>
            `;
            $('.chat-input-area').html(btnHTML);
        },

        enviarWhatsApp() {
            // SALVAR DADOS ANTES DE ENVIAR
            this.salvarDadosCliente();
            
            const mensagem = this.gerarMensagemWhatsApp();
            const numeroWhatsApp = '5595991316410';
            const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
            
            // Notificação de sucesso
            NotificationSystem.success('Dados salvos! Redirecionando para o WhatsApp... 📱✅');
            
            setTimeout(() => {
                window.open(url, '_blank');
                this.fecharModal();
            }, 1000);
        },

        // === SISTEMA DE SALVAMENTO DE DADOS ===
        salvarDadosCliente() {
            const dadosCompletos = {
                ...this.dados,
                timestamp: new Date().toISOString(),
                faixaValorConta: this.obterFaixaValor(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                origem: 'website_bvsol',
                id: Date.now().toString(36) + Math.random().toString(36).substr(2)
            };
            
            // Salvar localmente
            this.salvarNoLocalStorage(dadosCompletos);
            
            // Tentar enviar para Google Sheets
            this.tentarEnviarParaGoogleSheets(dadosCompletos);
            
            // Dados do cliente salvos
        },

        obterFaixaValor() {
            if (this.dados.valorConta <= 650) return 'R$ 500 - R$ 800';
            if (this.dados.valorConta <= 925) return 'R$ 850 - R$ 1.000';
            if (this.dados.valorConta <= 1175) return 'R$ 1.050 - R$ 1.300';
            if (this.dados.valorConta <= 1425) return 'R$ 1.350 - R$ 1.500';
            return 'R$ 2.000 ou mais';
        },

        salvarNoLocalStorage(dados) {
            try {
                const historico = JSON.parse(localStorage.getItem('cotacoes_bvsol') || '[]');
                historico.push(dados);
                
                // Manter apenas últimas 50 cotações
                if (historico.length > 50) {
                    historico.splice(0, historico.length - 50);
                }
                
                localStorage.setItem('cotacoes_bvsol', JSON.stringify(historico));
                // Salvo no localStorage
            } catch (error) {
                // Erro localStorage
            }
        },

        tentarEnviarParaGoogleSheets(dados) {
            try {
                // URL do Google Apps Script configurada
                const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzscbioQzOufQvtwo30SGBEDTjNUW4kfav_CUslPcyw_OOKd4kv5VSRWZKtCjxDCpQWsQ/exec';
                
                // Usar FormData em vez de JSON para evitar problemas de CORS
                const formData = new FormData();
                formData.append('dados', JSON.stringify(dados));
                
                fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: formData
                }).then(() => {
                    // Enviado para Google Sheets
                }).catch(error => {
                    // Google Sheets indisponível, dados salvos localmente
                });
            } catch (error) {
                // Erro ao enviar para Google Sheets
            }
        },

        gerarMensagemWhatsApp() {
            // Determinar a faixa de valor baseada no valor médio armazenado
            let faixaValor = '';
            if (this.dados.valorConta <= 650) {
                faixaValor = 'R$ 500 - R$ 800';
            } else if (this.dados.valorConta <= 1025) {
                faixaValor = 'R$ 850 - R$ 1.200';
            } else if (this.dados.valorConta <= 1425) {
                faixaValor = 'R$ 1.250 - R$ 1.600';
            } else {
                faixaValor = 'R$ 2.000 ou mais';
            }

            const tipoLocalEmoji = this.dados.tipoLocal === 'rural' ? '🌾' : '🏙️';
            const tipoLocalTexto = this.dados.tipoLocal === 'rural' ? 'Zona Rural' : 'Capital/Cidade';

            return `🌞 *SIMULAÇÃO ENERGIA SOLAR - BVSOL* 🌞

📋 *DADOS DO CLIENTE:*
👤 Nome: ${this.dados.nome}
📍 Endereço: ${this.dados.endereco}
${tipoLocalEmoji} Tipo: ${tipoLocalTexto}
📞 Telefone: ${this.dados.telefone}
💰 Conta atual: ${faixaValor}

⚡ *KIT ESCOLHIDO:*
🔹 ${this.dados.kitEscolhido.nome}
🔹 Potência: ${this.dados.kitEscolhido.potencia}
🔹 Economia estimada: ${this.dados.kitEscolhido.economia}
🔹 Equipamento: ${this.dados.kitEscolhido.paineis}
🔹 Investimento: ${this.dados.kitEscolhido.preco}

✅ *Gostaria de receber um orçamento detalhado e agendar uma visita técnica gratuita!*

_Simulação feita em: ${new Date().toLocaleDateString('pt-BR')}_`;
        },

        proximaEtapa() {
            this.etapaAtual++;
            setTimeout(() => {
                this.mostrarEtapa();
            }, 500);
        },

        atualizarProgress() {
            const progresso = ((this.etapaAtual + 1) / 6) * 100;
            $('.progress-fill').css('width', progresso + '%');
            $('.progress-text').text(`Etapa ${this.etapaAtual + 1} de 6`);
        },

        fecharModal() {
            $('#cotacaoModal').remove();
            this.resetar();
        },

        resetar() {
            this.etapaAtual = 0;
            this.dados = {
                nome: '',
                endereco: '',
                tipoLocal: '',
                telefone: '',
                cpf: '',
                valorConta: 0,
                kitEscolhido: null
            };
        }
    };

    // Aguardar carregamento completo e adicionar botão de cotação
    setTimeout(() => {
        // Verificar se o botão já existe
        if ($('.botao-cotacao').length === 0) {
            // Encontrar o botão do WhatsApp e adicionar o botão do simulador antes dele
            const botaoWhatsApp = $('.botao-whatsapp');
            if (botaoWhatsApp.length > 0) {
                botaoWhatsApp.before(`
                    <button onclick="cotacao.iniciar()" class="botao-cotacao">
                        <i data-lucide="calculator" style="width: 20px; height: 20px; margin-right: 8px;"></i> SIMULAR ENERGIA SOLAR
                    </button>
                `);
                console.log('✅ Botão de simulação adicionado com sucesso');
                
                // Reinicializar ícones Lucide
                lucide.createIcons();
            } else {
                console.warn('⚠️ Botão WhatsApp não encontrado');
            }
        }
    }, 500);
    
    // Garantir que os ícones Lucide sejam inicializados
    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 1000);
    
    // Tornar cotacao global
    window.cotacao = cotacao;
});

// Função global para inicializar ícones Lucide
function initLucideIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
        return true;
    }
    return false;
}

// Tentar inicializar ícones a cada 500ms até conseguir
const iconInterval = setInterval(() => {
    if (initLucideIcons()) {
        clearInterval(iconInterval);
    }
}, 500);

// === NAVEGAÇÃO MOBILE SANFONA ===

function initMobileNav() {
    // Inicializar estado da navegação no mobile
    if (window.innerWidth <= 768) {
        const nav = $('#mainNav');
        nav.addClass('nav-collapsed');
        updateNavIcon(true);
    }
    
    // Reajustar ao redimensionar janela
    $(window).on('resize', function() {
        const nav = $('#mainNav');
        if (window.innerWidth > 768) {
            // Desktop: mostrar navegação normalmente
            nav.removeClass('nav-collapsed').show();
            $('.nav-mobile-toggle').hide();
        } else {
            // Mobile: preparar para sanfona
            $('.nav-mobile-toggle').show();
            if (!nav.hasClass('nav-collapsed')) {
                nav.addClass('nav-collapsed').hide();
                updateNavIcon(true);
            }
        }
    });
}

function toggleMobileNav() {
    const nav = $('#mainNav');
    const isCollapsed = nav.hasClass('nav-collapsed');
    
    if (isCollapsed) {
        // Expandir navegação
        nav.removeClass('nav-collapsed').slideDown(300);
        updateNavIcon(false);
    } else {
        // Recolher navegação  
        nav.addClass('nav-collapsed').slideUp(300);
        updateNavIcon(true);
    }
}

function updateNavIcon(isCollapsed) {
    const icon = $('#navToggleIcon');
    const buttonText = $('.nav-mobile-toggle span');
    
    if (isCollapsed) {
        icon.attr('data-lucide', 'menu');
        buttonText.text('Menu');
    } else {
        icon.attr('data-lucide', 'x');
        buttonText.text('Fechar');
    }
    
    // Recriar ícones Lucide
    setTimeout(() => {
        lucide.createIcons();
    }, 100);
}

// === FUNÇÃO DE TESTE GOOGLE SHEETS (GLOBAL) ===
async function testarGoogleSheets() {
    // Testando conexão com Google Sheets...
    
    const dadosTeste = {
        nome: 'Teste Sistema',
        endereco: 'Endereço de Teste',
        telefone: '(99) 99999-9999',
        valorConta: 750,
        faixaValorConta: 'R$ 500 - R$ 800',
        kitEscolhido: {
            nome: 'Kit Teste',
            potencia: '3.5kWp',
            preco: 'R$ 15.000'
        },
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        origem: 'teste_sistema',
        id: 'teste_' + Date.now()
    };
    
    try {
        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzscbioQzOufQvtwo30SGBEDTjNUW4kfav_CUslPcyw_OOKd4kv5VSRWZKtCjxDCpQWsQ/exec';
        
        // Enviando dados de teste
        
        // Usar FormData para evitar problemas de CORS
        const formData = new FormData();
        formData.append('dados', JSON.stringify(dadosTeste));
        
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        });
        
        // Teste enviado para Google Sheets
        
        // Verificar se NotificationSystem está disponível
        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.success('🧪 Teste enviado! Verifique sua planilha Google Sheets.');
        }
        
        return true;
    } catch (error) {
        // Erro no teste Google Sheets
        
        // Verificar se NotificationSystem está disponível
        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.error('❌ Erro no teste: ' + error.message);
        }
        
        return false;
    }
}
