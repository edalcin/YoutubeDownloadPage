class YouTubeDownloader {
    constructor() {
        this.form = document.getElementById('downloadForm');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.progressContainer = document.getElementById('progressContainer');
        this.resultContainer = document.getElementById('resultContainer');
        this.errorContainer = document.getElementById('errorContainer');
        
        this.isDownloading = false;
        this.websocket = null;
        
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        document.getElementById('downloadAnother').addEventListener('click', this.resetForm.bind(this));
        document.getElementById('tryAgain').addEventListener('click', this.resetForm.bind(this));
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isDownloading) return;
        
        const formData = new FormData(this.form);
        const data = {
            url: formData.get('youtube_url').trim(),
            quality: formData.get('quality')
        };
        
        if (!this.validateURL(data.url)) {
            this.showError('Por favor, insira uma URL válida do YouTube');
            return;
        }
        
        this.startDownload(data);
    }
    
    validateURL(url) {
        const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/;
        return youtubeRegex.test(url);
    }
    
    startDownload(data) {
        this.isDownloading = true;
        this.updateButtonState(true);
        this.showProgress();
        this.hideResults();
        
        // Conectar WebSocket para receber updates em tempo real
        this.connectWebSocket();
        
        // Enviar requisição de download
        fetch('/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
        })
        .catch(error => {
            this.showError(error.message || 'Erro ao iniciar download');
            this.resetDownloadState();
        });
    }
    
    connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        this.websocket = new WebSocket(wsUrl);
        
        this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };
        
        this.websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.showError('Erro de conexão com o servidor');
            this.resetDownloadState();
        };
        
        this.websocket.onclose = () => {
            if (this.isDownloading) {
                // Reconectar se ainda estiver baixando
                setTimeout(() => this.connectWebSocket(), 1000);
            }
        };
    }
    
    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'progress':
                this.updateProgress(data.percent, data.status, data.title);
                break;
            case 'success':
                this.showSuccess(data.message, data.filename, data.size);
                this.resetDownloadState();
                break;
            case 'error':
                this.showError(data.message);
                this.resetDownloadState();
                break;
            case 'info':
                this.updateVideoInfo(data.title);
                break;
        }
    }
    
    updateProgress(percent, status, title = null) {
        document.getElementById('progressFill').style.width = `${percent}%`;
        document.getElementById('progressPercent').textContent = `${Math.round(percent)}%`;
        document.getElementById('statusMessage').textContent = status;
        
        if (title) {
            document.getElementById('videoTitle').textContent = title;
        }
    }
    
    updateVideoInfo(title) {
        document.getElementById('videoTitle').textContent = title;
    }
    
    showProgress() {
        this.progressContainer.style.display = 'block';
        this.updateProgress(0, 'Iniciando download...');
    }
    
    hideResults() {
        this.resultContainer.style.display = 'none';
        this.errorContainer.style.display = 'none';
    }
    
    showSuccess(message, filename, size) {
        this.progressContainer.style.display = 'none';
        this.resultContainer.style.display = 'block';
        
        let resultMessage = message;
        if (filename && size) {
            resultMessage += `<br><strong>Arquivo:</strong> ${filename}<br><strong>Tamanho:</strong> ${size}`;
        }
        
        document.getElementById('resultMessage').innerHTML = resultMessage;
    }
    
    showError(message) {
        this.progressContainer.style.display = 'none';
        this.errorContainer.style.display = 'block';
        document.getElementById('errorMessage').textContent = message;
    }
    
    updateButtonState(loading) {
        const btnText = document.querySelector('.btn-text');
        const btnIcon = document.querySelector('.btn-icon');
        
        if (loading) {
            this.downloadBtn.disabled = true;
            this.downloadBtn.classList.add('loading');
            btnText.textContent = 'Processando...';
        } else {
            this.downloadBtn.disabled = false;
            this.downloadBtn.classList.remove('loading');
            btnText.textContent = 'Iniciar Download';
        }
    }
    
    resetDownloadState() {
        this.isDownloading = false;
        this.updateButtonState(false);
        
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
    }
    
    resetForm() {
        this.hideResults();
        this.progressContainer.style.display = 'none';
        this.resetDownloadState();
        
        // Limpar campos do formulário
        this.form.reset();
        
        // Foco no campo URL
        document.getElementById('youtube_url').focus();
    }
}

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new YouTubeDownloader();
});

// Utilitários
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}