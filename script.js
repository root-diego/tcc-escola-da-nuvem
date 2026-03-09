// CloudVigia - Sistema Inteligente de Monitoramento Urbano
// Script principal com funcionalidades interativas

// Dados fictícios realistas para o sistema
const mockData = {
    reports: [
        {
            id: "CV-2026-0482",
            type: "irregular_waste",
            urgency: "high",
            location: "Rua das Flores, 123 - Centro",
            coordinates: [-23.5505, -46.6333],
            description: "Acúmulo de lixo doméstico em via pública próximo ao bueiro, risco de entupimento",
            date: "2026-10-05",
            status: "received",
            city: "São Paulo",
            photo: null,
            userId: "anon-001"
        },
        {
            id: "CV-2026-0481",
            type: "clogged_drain",
            urgency: "critical",
            location: "Av. Paulista, 1000",
            coordinates: [-23.5614, -46.6559],
            description: "Bueiro completamente entupido por plásticos e folhas, água começando a acumular",
            date: "2026-10-04",
            status: "in-progress",
            city: "São Paulo",
            photo: "clogged_drain_001.jpg",
            userId: "user-045"
        },
        {
            id: "CV-2026-0480",
            type: "construction_waste",
            urgency: "medium",
            location: "Rua Augusta, 500",
            coordinates: [-23.5581, -46.6589],
            description: "Entulho de construção civil descartado irregularmente em terreno baldio",
            date: "2026-10-03",
            status: "resolved",
            city: "São Paulo",
            photo: "construction_waste_003.jpg",
            userId: "user-123"
        },
        {
            id: "CV-2026-0479",
            type: "flood_risk",
            urgency: "high",
            location: "Rua da Consolação, 800",
            coordinates: [-23.5525, -46.6528],
            description: "Ponto de alagamento crônico durante chuvas fortes, necessidade de revisão do sistema de drenagem",
            date: "2026-10-02",
            status: "in-progress",
            city: "São Paulo",
            photo: "flood_risk_012.jpg",
            userId: "user-089"
        },
        {
            id: "CV-2026-0478",
            type: "illegal_dumping",
            urgency: "medium",
            location: "Rua Frei Caneca, 200",
            coordinates: [-23.5572, -46.6501],
            description: "Descarte ilegal de móveis usados e eletrodomésticos em via pública",
            date: "2026-10-01",
            status: "received",
            city: "São Paulo",
            photo: "illegal_dumping_005.jpg",
            userId: "anon-002"
        },
        {
            id: "CV-2026-0477",
            type: "irregular_waste",
            urgency: "low",
            location: "Alameda Santos, 100",
            coordinates: [-23.5641, -46.6520],
            description: "Lixo orgânico espalhado por animais nas proximidades",
            date: "2026-09-30",
            status: "resolved",
            city: "São Paulo",
            photo: null,
            userId: "user-156"
        }
    ],
    
    cities: [
        { name: "São Paulo", reports: 1247, resolved: 934, avgResponseTime: 3.2 },
        { name: "Rio de Janeiro", reports: 892, resolved: 678, avgResponseTime: 4.1 },
        { name: "Maceió", reports: 543, resolved: 412, avgResponseTime: 2.8 },
        { name: "Curitiba", reports: 421, resolved: 389, avgResponseTime: 2.1 },
        { name: "Porto Alegre", reports: 398, resolved: 312, avgResponseTime: 3.5 },
        { name: "Salvador", reports: 356, resolved: 267, avgResponseTime: 4.3 },
        { name: "Fortaleza", reports: 289, resolved: 201, avgResponseTime: 4.7 },
        { name: "Brasília", reports: 245, resolved: 198, avgResponseTime: 3.9 }
    ],
    
    stats: {
        totalReports: 2847,
        activeReports: 924,
        resolvedReports: 1923,
        avgResponseTime: 3.2,
        userEngagement: 14827,
        monthlyGrowth: 12
    },
    
    monthlyData: {
        labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out"],
        reports: [210, 245, 278, 302, 289, 312, 298, 324, 356, 382],
        resolutions: [189, 218, 245, 278, 267, 289, 276, 298, 321, 345]
    },
    
    typeDistribution: {
        irregular_waste: 42,
        clogged_drain: 28,
        construction_waste: 18,
        flood_risk: 8,
        illegal_dumping: 4
    }
};

// Variáveis globais
let mainMap, previewMap;
let currentLocation = null;
let reportsChart = null;
let trendChart = null;

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    initApplication();
});

// Função principal de inicialização
function initApplication() {
    initMaps();
    initCharts();
    loadReportsTable();
    setupEventListeners();
    setupFormValidation();
    simulateRealTimeUpdates();
    updateDashboardStats();
    
    // Inicializar animação dos passos
    initJourneyAnimation();
    
    // Atualizar estatísticas iniciais
    updateStatsDisplay();
}

// Inicializar mapas
function initMaps() {
    // Mapa principal
    mainMap = L.map('mainMap').setView([-23.5505, -46.6333], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mainMap);
    
    // Adicionar marcadores fictícios
    mockData.reports.forEach(report => {
        const markerColor = getMarkerColor(report.type, report.status);
        const markerIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        
        const marker = L.marker(report.coordinates, { icon: markerIcon }).addTo(mainMap);
        
        marker.bindPopup(`
            <div style="min-width: 250px;">
                <h4 style="margin: 0 0 10px 0; color: #1e293b;">${report.id}</h4>
                <p style="margin: 0 0 5px 0; font-size: 14px;"><strong>Tipo:</strong> ${getTypeLabel(report.type)}</p>
                <p style="margin: 0 0 5px 0; font-size: 14px;"><strong>Status:</strong> ${getStatusLabel(report.status)}</p>
                <p style="margin: 0 0 5px 0; font-size: 14px;"><strong>Local:</strong> ${report.location}</p>
                <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Data:</strong> ${formatDate(report.date)}</p>
                <div style="text-align: right;">
                    <button onclick="viewReportDetails('${report.id}')" style="background: #2563eb; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">Ver Detalhes</button>
                </div>
            </div>
        `);
    });
    
    // Mapa de pré-visualização
    previewMap = L.map('previewMap').setView([-23.5505, -46.6333], 14);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(previewMap);
    
    // Adicionar evento de clique no mapa de pré-visualização
    previewMap.on('click', function(e) {
        setReportLocation(e.latlng.lat, e.latlng.lng);
    });
}

// Inicializar gráficos
function initCharts() {
    const typeCtx = document.getElementById('typeChart').getContext('2d');
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    
    // Gráfico de distribuição por tipo
    reportsChart = new Chart(typeCtx, {
        type: 'doughnut',
        data: {
            labels: [
                'Descarte Irregular',
                'Bueiros Entupidos',
                'Entulho',
                'Risco de Alagamento',
                'Descarte Ilegal'
            ],
            datasets: [{
                data: [
                    mockData.typeDistribution.irregular_waste,
                    mockData.typeDistribution.clogged_drain,
                    mockData.typeDistribution.construction_waste,
                    mockData.typeDistribution.flood_risk,
                    mockData.typeDistribution.illegal_dumping
                ],
                backgroundColor: [
                    '#ef4444',
                    '#3b82f6',
                    '#f59e0b',
                    '#10b981',
                    '#8b5cf6'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed}%`;
                        }
                    }
                }
            }
        }
    });
    
    // Gráfico de tendência
    trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: mockData.monthlyData.labels,
            datasets: [
                {
                    label: 'Denúncias',
                    data: mockData.monthlyData.reports,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Resoluções',
                    data: mockData.monthlyData.resolutions,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Carregar tabela de denúncias
function loadReportsTable() {
    const tableBody = document.getElementById('reportsTableBody');
    tableBody.innerHTML = '';
    
    // Ordenar denúncias por data (mais recentes primeiro)
    const sortedReports = [...mockData.reports].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    sortedReports.forEach(report => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${report.id}</td>
            <td>${getTypeLabel(report.type)}</td>
            <td>${report.location}</td>
            <td>${formatDate(report.date)}</td>
            <td><span class="status-badge ${getStatusClass(report.status)}">${getStatusLabel(report.status)}</span></td>
            <td><span class="urgency-badge ${getUrgencyClass(report.urgency)}">${getUrgencyLabel(report.urgency)}</span></td>
            <td>
                <button class="btn-action" onclick="viewReportDetails('${report.id}')" title="Ver detalhes">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action" onclick="downloadReport('${report.id}')" title="Baixar relatório">
                    <i class="fas fa-download"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Navegação
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Fechar menu mobile se aberto
                const nav = document.querySelector('.main-nav');
                nav.classList.remove('active');
            }
        });
    });
    
    // Botão de menu mobile
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.querySelector('.main-nav');
    
    mobileMenuBtn.addEventListener('click', function() {
        mainNav.classList.toggle('active');
    });
    
    // Botão de login
    document.getElementById('loginBtn').addEventListener('click', function() {
        showNotification('Sistema de login em desenvolvimento. Em breve disponível!', 'info');
    });
    
    // Botão de pontos de coleta
    document.getElementById('collectionPointsBtn').addEventListener('click', function() {
        showNotification('Mapa de pontos de coleta será exibido em breve!', 'info');
    });
    
    // Botão de fazer denúncia
    document.getElementById('reportBtn').addEventListener('click', function() {
        document.getElementById('report').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Botão de assistir vídeo
    document.getElementById('watchVideoBtn').addEventListener('click', function() {
        showNotification('Vídeo explicativo será exibido em breve!', 'info');
    });
    
    // Botão de localização automática
    document.getElementById('getLocationBtn').addEventListener('click', function() {
        getCurrentLocation();
    });
    
    // Upload de foto
    const uploadArea = document.getElementById('uploadArea');
    const photoUpload = document.getElementById('photoUpload');
    
    uploadArea.addEventListener('click', function() {
        photoUpload.click();
    });
    
    photoUpload.addEventListener('change', function(e) {
        handlePhotoUpload(e.target.files[0]);
    });
    
    // Drag and drop para upload
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#2563eb';
        this.style.backgroundColor = 'rgba(37, 99, 235, 0.05)';
    });
    
    uploadArea.addEventListener('dragleave', function() {
        this.style.borderColor = '#e2e8f0';
        this.style.backgroundColor = 'transparent';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#e2e8f0';
        this.style.backgroundColor = 'transparent';
        
        if (e.dataTransfer.files.length) {
            handlePhotoUpload(e.dataTransfer.files[0]);
        }
    });
    
    // Formulário de denúncia
    const reportForm = document.getElementById('reportForm');
    reportForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitReport();
    });
    
    // Botão limpar formulário
    document.getElementById('clearFormBtn').addEventListener('click', function() {
        clearReportForm();
    });
    
    // Atualizar pré-visualização em tempo real
    const formInputs = ['problemType', 'urgency', 'location', 'description'];
    formInputs.forEach(inputId => {
        document.getElementById(inputId).addEventListener('change', updatePreview);
        document.getElementById(inputId).addEventListener('input', updatePreview);
    });
    
    // Filtros do dashboard
    document.getElementById('cityFilter').addEventListener('change', filterDashboard);
    document.getElementById('timeFilter').addEventListener('change', filterDashboard);
    document.getElementById('typeFilter').addEventListener('change', filterDashboard);
    
    // Botão exportar dados
    document.getElementById('exportDataBtn').addEventListener('click', function() {
        exportDashboardData();
    });
    
    // Botão atualizar tabela
    document.getElementById('refreshTableBtn').addEventListener('click', function() {
        loadReportsTable();
        showNotification('Tabela atualizada com sucesso!', 'success');
    });
    
    // Botão contato
    document.getElementById('contactBtn').addEventListener('click', function() {
        window.open('mailto:contato@cloudvigia.org', '_blank');
    });
    
    // Botão documentação
    document.getElementById('documentationBtn').addEventListener('click', function() {
        showNotification('Documentação técnica disponível em breve!', 'info');
    });
    
    // Modal
    document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
    document.getElementById('modalOkBtn').addEventListener('click', closeModal);
    document.getElementById('modalPrintBtn').addEventListener('click', function() {
        printReportReceipt();
    });
    
    // Animações de scroll
    window.addEventListener('scroll', handleScrollAnimations);
    
    // Atualizar hora atual no preview
    updatePreviewDate();
}

// Configurar validação de formulário
function setupFormValidation() {
    const reportForm = document.getElementById('reportForm');
    
    reportForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validação básica
        const problemType = document.getElementById('problemType').value;
        const urgency = document.getElementById('urgency').value;
        const location = document.getElementById('location').value;
        const description = document.getElementById('description').value;
        
        if (!problemType || !urgency || !location || !description) {
            showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        if (description.length < 20) {
            showNotification('Por favor, forneça uma descrição mais detalhada (mínimo 20 caracteres).', 'error');
            return;
        }
        
        // Se passou na validação, enviar
        submitReport();
    });
}

// Enviar denúncia
function submitReport() {
    // Mostrar loading
    showLoading(true);
    
    // Simular processamento
    setTimeout(() => {
        // Gerar ID único
        const reportId = generateReportId();
        
        // Criar objeto da denúncia
        const newReport = {
            id: reportId,
            type: document.getElementById('problemType').value,
            urgency: document.getElementById('urgency').value,
            location: document.getElementById('location').value,
            coordinates: currentLocation || [-23.5505, -46.6333],
            description: document.getElementById('description').value,
            date: new Date().toISOString().split('T')[0],
            status: 'received',
            city: 'São Paulo',
            photo: document.getElementById('photoUpload').files[0] ? 'uploaded_photo.jpg' : null,
            userId: document.getElementById('anonymous').checked ? 'anonymous' : 'user-' + Math.floor(Math.random() * 1000)
        };
        
        // Adicionar aos dados (em um sistema real, seria uma chamada API)
        mockData.reports.unshift(newReport);
        
        // Atualizar estatísticas
        updateStatsAfterReport();
        
        // Limpar formulário
        clearReportForm();
        
        // Mostrar modal de sucesso
        showSuccessModal(reportId);
        
        // Atualizar tabela
        loadReportsTable();
        
        // Atualizar mapa
        addReportToMap(newReport);
        
        // Esconder loading
        showLoading(false);
        
        // Mostrar notificação
        showNotification('Denúncia enviada com sucesso!', 'success');
        
    }, 1500);
}

// Mostrar modal de sucesso
function showSuccessModal(reportId) {
    document.getElementById('modalReportId').textContent = reportId;
    document.getElementById('successModal').style.display = 'flex';
}

// Fechar modal
function closeModal() {
    document.getElementById('successModal').style.display = 'none';
}

// Imprimir comprovante
function printReportReceipt() {
    const reportId = document.getElementById('modalReportId').textContent;
    const receiptContent = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: #2563eb; text-align: center;">CloudVigia - Comprovante de Denúncia</h2>
            <hr>
            <p><strong>ID da Denúncia:</strong> ${reportId}</p>
            <p><strong>Data de Envio:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            <p><strong>Status:</strong> Recebida</p>
            <p><strong>Tipo:</strong> ${getTypeLabel(document.getElementById('problemType').value)}</p>
            <p><strong>Urgência:</strong> ${getUrgencyLabel(document.getElementById('urgency').value)}</p>
            <p><strong>Localização:</strong> ${document.getElementById('location').value}</p>
            <hr>
            <p style="text-align: center; font-size: 12px; color: #666;">
                Este comprovante atesta que sua denúncia foi recebida pelo sistema CloudVigia.<br>
                Você receberá atualizações sobre o andamento por e-mail.
            </p>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.print();
}

// Obter localização atual
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showNotification('Geolocalização não suportada pelo seu navegador.', 'error');
        return;
    }
    
    showNotification('Obtendo sua localização...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            setReportLocation(lat, lng);
            
            // Usar Geocoding reverso para obter endereço (simulado)
            setTimeout(() => {
                const fakeAddresses = [
                    'Rua das Flores, 123 - Centro',
                    'Av. Paulista, 1000 - Bela Vista',
                    'Rua Augusta, 500 - Consolação',
                    'Alameda Santos, 100 - Jardins'
                ];
                
                const randomAddress = fakeAddresses[Math.floor(Math.random() * fakeAddresses.length)];
                document.getElementById('location').value = randomAddress;
                
                updatePreview();
                showNotification('Localização obtida com sucesso!', 'success');
            }, 500);
        },
        function(error) {
            console.error('Erro ao obter localização:', error);
            showNotification('Não foi possível obter sua localização. Por favor, insira manualmente.', 'error');
        }
    );
}

// Definir localização no formulário
function setReportLocation(lat, lng) {
    currentLocation = [lat, lng];
    
    // Atualizar mapa de pré-visualização
    if (previewMap) {
        previewMap.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                previewMap.removeLayer(layer);
            }
        });
        
        L.marker([lat, lng]).addTo(previewMap);
        previewMap.setView([lat, lng], 16);
    }
    
    // Atualizar estatísticas locais (simulado)
    updateLocalStats();
}

// Atualizar pré-visualização
function updatePreview() {
    const problemType = document.getElementById('problemType');
    const urgency = document.getElementById('urgency');
    const location = document.getElementById('location');
    
    document.getElementById('previewType').textContent = 
        problemType.value ? problemType.options[problemType.selectedIndex].text : 'Não definido';
    
    document.getElementById('previewUrgency').textContent = 
        urgency.value ? getUrgencyLabel(urgency.value) : 'Não definida';
    
    document.getElementById('previewLocation').textContent = 
        location.value || 'Não selecionada';
    
    // Atualizar cor do status baseado na urgência
    const previewStatus = document.getElementById('previewStatus');
    if (urgency.value === 'critical') {
        previewStatus.textContent = 'Crítica';
        previewStatus.style.backgroundColor = '#ef4444';
    } else if (urgency.value === 'high') {
        previewStatus.textContent = 'Alta';
        previewStatus.style.backgroundColor = '#f59e0b';
    } else if (urgency.value === 'medium') {
        previewStatus.textContent = 'Média';
        previewStatus.style.backgroundColor = '#3b82f6';
    } else if (urgency.value === 'low') {
        previewStatus.textContent = 'Baixa';
        previewStatus.style.backgroundColor = '#94a3b8';
    } else {
        previewStatus.textContent = 'Rascunho';
        previewStatus.style.backgroundColor = '#94a3b8';
    }
}

// Atualizar data na pré-visualização
function updatePreviewDate() {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    document.getElementById('previewDate').textContent = formattedDate;
}

// Atualizar estatísticas locais (simulado)
function updateLocalStats() {
    const localReports = Math.floor(Math.random() * 50) + 5;
    const avgResolution = (Math.random() * 5 + 1).toFixed(1);
    
    document.getElementById('localReports').textContent = localReports;
    document.getElementById('avgResolution').textContent = avgResolution;
}

// Lidar com upload de foto
function handlePhotoUpload(file) {
    if (!file) return;
    
    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
        showNotification('Tipo de arquivo não suportado. Use JPG, PNG ou HEIC.', 'error');
        return;
    }
    
    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('Arquivo muito grande. Tamanho máximo: 10MB.', 'error');
        return;
    }
    
    // Mostrar pré-visualização
    const reader = new FileReader();
    reader.onload = function(e) {
        const uploadPreview = document.getElementById('uploadPreview');
        uploadPreview.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                <img src="${e.target.result}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                <div>
                    <p style="margin: 0 0 5px 0; font-size: 14px; font-weight: 500;">${file.name}</p>
                    <p style="margin: 0; font-size: 12px; color: #64748b;">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button onclick="removeUploadedPhoto()" style="margin-left: auto; background: none; border: none; color: #ef4444; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        uploadPreview.style.display = 'block';
    };
    
    reader.readAsDataURL(file);
}

// Remover foto carregada
function removeUploadedPhoto() {
    document.getElementById('photoUpload').value = '';
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('uploadPreview').innerHTML = '';
}

// Limpar formulário
function clearReportForm() {
    document.getElementById('reportForm').reset();
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('uploadPreview').innerHTML = '';
    currentLocation = null;
    
    // Limpar mapa de pré-visualização
    if (previewMap) {
        previewMap.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                previewMap.removeLayer(layer);
            }
        });
        previewMap.setView([-23.5505, -46.6333], 14);
    }
    
    updatePreview();
    updatePreviewDate();
}

// Filtrar dashboard
function filterDashboard() {
    const city = document.getElementById('cityFilter').value;
    const period = document.getElementById('timeFilter').value;
    const type = document.getElementById('typeFilter').value;
    
    // Em um sistema real, aqui seria uma chamada API
    // Por enquanto, apenas simulamos com um delay
    showLoading(true);
    
    setTimeout(() => {
        // Atualizar estatísticas baseado nos filtros (simulado)
        updateFilteredStats(city, period, type);
        showLoading(false);
    }, 800);
}

// Exportar dados do dashboard
function exportDashboardData() {
    const data = {
        filters: {
            city: document.getElementById('cityFilter').value,
            period: document.getElementById('timeFilter').value,
            type: document.getElementById('typeFilter').value
        },
        stats: mockData.stats,
        reports: mockData.reports.slice(0, 50), // Limitar para demonstração
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cloudvigia-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Dados exportados com sucesso!', 'success');
}

// Inicializar animação da jornada
function initJourneyAnimation() {
    const steps = document.querySelectorAll('.step');
    let currentStep = 0;
    
    function animateSteps() {
        steps.forEach(step => step.classList.remove('active'));
        
        if (currentStep >= steps.length) {
            currentStep = 0;
        }
        
        steps[currentStep].classList.add('active');
        currentStep++;
        
        setTimeout(animateSteps, 3000);
    }
    
    // Iniciar animação
    setTimeout(animateSteps, 1000);
}

// Simular atualizações em tempo real
function simulateRealTimeUpdates() {
    // Atualizar contadores periodicamente
    setInterval(() => {
        // Simular novas denúncias
        if (Math.random() > 0.7) {
            const newReportCount = Math.floor(Math.random() * 3) + 1;
            mockData.stats.totalReports += newReportCount;
            mockData.stats.activeReports += newReportCount;
            
            updateStatsDisplay();
        }
        
        // Simular resoluções
        if (Math.random() > 0.8 && mockData.stats.activeReports > 0) {
            const resolvedCount = Math.floor(Math.random() * 2) + 1;
            mockData.stats.activeReports = Math.max(0, mockData.stats.activeReports - resolvedCount);
            mockData.stats.resolvedReports += resolvedCount;
            
            updateStatsDisplay();
        }
    }, 10000); // A cada 10 segundos
}

// Atualizar estatísticas após nova denúncia
function updateStatsAfterReport() {
    mockData.stats.totalReports++;
    mockData.stats.activeReports++;
    mockData.stats.userEngagement++;
    
    updateStatsDisplay();
}

// Atualizar estatísticas com base em filtros (simulado)
function updateFilteredStats(city, period, type) {
    // Esta função simularia a busca de dados filtrados da API
    // Por simplicidade, vamos apenas modificar ligeiramente os valores exibidos
    
    let filteredActive = mockData.stats.activeReports;
    let filteredResolved = mockData.stats.resolvedReports;
    
    if (city !== 'all') {
        // Ajustar para cidade específica
        filteredActive = Math.floor(filteredActive * 0.6);
        filteredResolved = Math.floor(filteredResolved * 0.6);
    }
    
    if (type !== 'all') {
        // Ajustar para tipo específico
        filteredActive = Math.floor(filteredActive * 0.4);
        filteredResolved = Math.floor(filteredResolved * 0.4);
    }
    
    // Atualizar display
    document.getElementById('dashboardActiveReports').textContent = filteredActive.toLocaleString();
    document.getElementById('dashboardResolved').textContent = filteredResolved.toLocaleString();
}

// Atualizar display das estatísticas
function updateStatsDisplay() {
    document.getElementById('reportsCount').textContent = mockData.stats.activeReports.toLocaleString();
    document.getElementById('resolvedCount').textContent = mockData.stats.resolvedReports.toLocaleString();
    document.getElementById('responseTime').textContent = mockData.stats.avgResponseTime.toFixed(1);
    document.getElementById('citiesCount').textContent = mockData.cities.length;
    
    document.getElementById('dashboardActiveReports').textContent = mockData.stats.activeReports.toLocaleString();
    document.getElementById('dashboardResolved').textContent = mockData.stats.resolvedReports.toLocaleString();
}

// Atualizar estatísticas do dashboard
function updateDashboardStats() {
    // Esta função seria chamada quando os filtros mudam
    // Por enquanto, apenas exibe os dados totais
    updateStatsDisplay();
}

// Adicionar nova denúncia ao mapa
function addReportToMap(report) {
    const markerColor = getMarkerColor(report.type, report.status);
    const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3); animation: pulse 2s infinite;"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
    
    const marker = L.marker(report.coordinates, { icon: markerIcon }).addTo(mainMap);
    
    marker.bindPopup(`
        <div style="min-width: 250px;">
            <h4 style="margin: 0 0 10px 0; color: #1e293b;">${report.id}</h4>
            <p style="margin: 0 0 5px 0; font-size: 14px;"><strong>Tipo:</strong> ${getTypeLabel(report.type)}</p>
            <p style="margin: 0 0 5px 0; font-size: 14px;"><strong>Status:</strong> ${getStatusLabel(report.status)}</p>
            <p style="margin: 0 0 5px 0; font-size: 14px;"><strong>Local:</strong> ${report.location}</p>
            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Data:</strong> ${formatDate(report.date)}</p>
            <div style="text-align: right;">
                <button onclick="viewReportDetails('${report.id}')" style="background: #2563eb; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">Ver Detalhes</button>
            </div>
        </div>
    `);
    
    // Animação de destaque
    marker.openPopup();
    setTimeout(() => {
        marker.closePopup();
    }, 3000);
}

// Ver detalhes da denúncia
function viewReportDetails(reportId) {
    const report = mockData.reports.find(r => r.id === reportId);
    if (!report) return;
    
    const detailsHtml = `
        <div style="max-width: 500px;">
            <h3 style="color: #1e293b; margin-bottom: 20px;">Detalhes da Denúncia</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <p style="margin: 0 0 5px 0; font-size: 14px; color: #64748b;"><strong>ID:</strong></p>
                    <p style="margin: 0; font-weight: 500;">${report.id}</p>
                </div>
                <div>
                    <p style="margin: 0 0 5px 0; font-size: 14px; color: #64748b;"><strong>Data:</strong></p>
                    <p style="margin: 0; font-weight: 500;">${formatDate(report.date)}</p>
                </div>
                <div>
                    <p style="margin: 0 0 5px 0; font-size: 14px; color: #64748b;"><strong>Tipo:</strong></p>
                    <p style="margin: 0; font-weight: 500;">${getTypeLabel(report.type)}</p>
                </div>
                <div>
                    <p style="margin: 0 0 5px 0; font-size: 14px; color: #64748b;"><strong>Urgência:</strong></p>
                    <p style="margin: 0;"><span class="urgency-badge ${getUrgencyClass(report.urgency)}">${getUrgencyLabel(report.urgency)}</span></p>
                </div>
                <div>
                    <p style="margin: 0 0 5px 0; font-size: 14px; color: #64748b;"><strong>Status:</strong></p>
                    <p style="margin: 0;"><span class="status-badge ${getStatusClass(report.status)}">${getStatusLabel(report.status)}</span></p>
                </div>
                <div>
                    <p style="margin: 0 0 5px 0; font-size: 14px; color: #64748b;"><strong>Cidade:</strong></p>
                    <p style="margin: 0; font-weight: 500;">${report.city}</p>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p style="margin: 0 0 5px 0; font-size: 14px; color: #64748b;"><strong>Localização:</strong></p>
                <p style="margin: 0; font-weight: 500;">${report.location}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p style="margin: 0 0 5px 0; font-size: 14px; color: #64748b;"><strong>Descrição:</strong></p>
                <p style="margin: 0;">${report.description}</p>
            </div>
            
            ${report.photo ? `
            <div style="margin-bottom: 20px;">
                <p style="margin: 0 0 5px 0; font-size: 14px; color: #64748b;"><strong>Foto:</strong></p>
                <div style="width: 100%; height: 200px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #64748b;">
                    <i class="fas fa-image" style="font-size: 40px;"></i>
                </div>
            </div>
            ` : ''}
            
            <div style="text-align: right; margin-top: 20px;">
                <button onclick="closeDetailsModal()" style="background: #64748b; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">Fechar</button>
                <button onclick="shareReport('${report.id}')" style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Compartilhar</button>
            </div>
        </div>
    `;
    
    // Em um sistema real, você usaria um modal dedicado
    // Por simplicidade, usaremos um alert estilizado
    Swal.fire({
        html: detailsHtml,
        width: 600,
        showCloseButton: true,
        showConfirmButton: false
    });
}

// Fechar modal de detalhes (se usando SweetAlert)
function closeDetailsModal() {
    Swal.close();
}

// Compartilhar denúncia
function shareReport(reportId) {
    const report = mockData.reports.find(r => r.id === reportId);
    if (!report) return;
    
    const shareText = `Denúncia ${report.id} no CloudVigia: ${getTypeLabel(report.type)} em ${report.location}. Status: ${getStatusLabel(report.status)}.`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'Denúncia CloudVigia',
            text: shareText,
            url: shareUrl
        });
    } else {
        // Fallback para copiar para área de transferência
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        showNotification('Link copiado para a área de transferência!', 'success');
    }
}

// Baixar relatório
function downloadReport(reportId) {
    const report = mockData.reports.find(r => r.id === reportId);
    if (!report) return;
    
    const reportContent = `
        RELATÓRIO DE DENÚNCIA - CLOUDVIGIA
        ====================================
        
        ID da Denúncia: ${report.id}
        Data: ${formatDate(report.date)}
        Tipo: ${getTypeLabel(report.type)}
        Urgência: ${getUrgencyLabel(report.urgency)}
        Status: ${getStatusLabel(report.status)}
        Cidade: ${report.city}
        Localização: ${report.location}
        
        DESCRIÇÃO:
        ${report.description}
        
        ====================================
        Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}
        CloudVigia - Sistema de Monitoramento Urbano
        www.cloudvigia.org
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${report.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Relatório baixado com sucesso!', 'success');
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        max-width: 350px;
        font-size: 14px;
    `;
    
    // Adicionar ícone
    const icon = type === 'error' ? 'fa-exclamation-circle' : 
                 type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas ${icon}" style="font-size: 18px;"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Mostrar/ocultar loading
function showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (show) {
        loadingOverlay.style.display = 'flex';
    } else {
        loadingOverlay.style.display = 'none';
    }
}

// Gerar ID de denúncia
function generateReportId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const sequence = String(mockData.reports.length + 1).padStart(3, '0');
    
    return `CV-${year}${month}${day}-${sequence}`;
}

// Funções auxiliares
function getMarkerColor(type, status) {
    if (status === 'resolved') return '#10b981';
    
    const colorMap = {
        irregular_waste: '#ef4444',
        clogged_drain: '#3b82f6',
        construction_waste: '#f59e0b',
        flood_risk: '#8b5cf6',
        illegal_dumping: '#ec4899'
    };
    
    return colorMap[type] || '#64748b';
}

function getTypeLabel(type) {
    const typeMap = {
        irregular_waste: 'Descarte Irregular',
        clogged_drain: 'Bueiro Entupido',
        construction_waste: 'Entulho',
        flood_risk: 'Risco de Alagamento',
        illegal_dumping: 'Descarte Ilegal',
        other: 'Outro'
    };
    
    return typeMap[type] || type;
}

function getStatusLabel(status) {
    const statusMap = {
        received: 'Recebida',
        'in-progress': 'Em Andamento',
        resolved: 'Resolvida'
    };
    
    return statusMap[status] || status;
}

function getStatusClass(status) {
    const classMap = {
        received: 'status-received',
        'in-progress': 'status-in-progress',
        resolved: 'status-resolved'
    };
    
    return classMap[status] || 'status-received';
}

function getUrgencyLabel(urgency) {
    const urgencyMap = {
        low: 'Baixa',
        medium: 'Média',
        high: 'Alta',
        critical: 'Crítica'
    };
    
    return urgencyMap[urgency] || urgency;
}

function getUrgencyClass(urgency) {
    const classMap = {
        low: 'urgency-low',
        medium: 'urgency-medium',
        high: 'urgency-high',
        critical: 'urgency-critical'
    };
    
    return classMap[urgency] || 'urgency-low';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Animações de scroll
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.problem-card, .stat-card, .team-member');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Adicionar estilos CSS dinâmicos para animações
const style = document.createElement('style');
style.textContent = `
    .problem-card, .stat-card, .team-member {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }
    
    .custom-marker {
        background: none !important;
        border: none !important;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    .btn-action {
        background: none;
        border: 1px solid #e2e8f0;
        color: #64748b;
        width: 30px;
        height: 30px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-right: 5px;
    }
    
    .btn-action:hover {
        background-color: #f1f5f9;
        color: #2563eb;
        border-color: #2563eb;
    }
`;
document.head.appendChild(style);

// Inicializar animações de scroll
setTimeout(() => {
    handleScrollAnimations();
    window.addEventListener('scroll', handleScrollAnimations);
}, 100);
