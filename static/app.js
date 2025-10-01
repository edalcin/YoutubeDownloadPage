class YouTubeDownloader {
    constructor() {
        this.form = document.getElementById('downloadForm');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.progressContainer = document.getElementById('progressContainer');
        this.resultContainer = document.getElementById('resultContainer');
        this.errorContainer = document.getElementById('errorContainer');

        this.isDownloading = false;
        this.websocket = null;
        this.selectedDirectory = null;
        this.selectedFilename = null;

        this.init();
    }

    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        document.getElementById('downloadAnother').addEventListener('click', this.resetForm.bind(this));
        document.getElementById('tryAgain').addEventListener('click', this.resetForm.bind(this));
        document.getElementById('chooseSaveBtn').addEventListener('click', this.handleChooseSave.bind(this));

        // Carregar último diretório salvo
        this.loadLastDirectory();
    }

    async loadLastDirectory() {
        // Tentar carregar do localStorage
        const lastPath = localStorage.getItem('lastSavePath');
        if (lastPath) {
            document.getElementById('savePath').value = lastPath;
            document.getElementById('downloadBtn').disabled = false;
        }
    }

    async handleChooseSave() {
        try {
            // Verificar se o navegador suporta File System Access API
            if (!('showDirectoryPicker' in window)) {
                // Fallback: apenas mostrar mensagem e habilitar download
                alert('Seu navegador não suporta seleção de diretório. O arquivo será salvo na pasta padrão de Downloads do navegador.');
                document.getElementById('savePath').value = 'Pasta padrão de Downloads';
                document.getElementById('downloadBtn').disabled = false;
                return;
            }

            // Abrir seletor de diretório
            const directoryHandle = await window.showDirectoryPicker({
                mode: 'readwrite'
            });

            this.selectedDirectory = directoryHandle;

            // Mostrar caminho selecionado
            const path = directoryHandle.name;
            document.getElementById('savePath').value = path;

            // Salvar no localStorage
            localStorage.setItem('lastSavePath', path);

            // Habilitar botão de download
            document.getElementById('downloadBtn').disabled = false;

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Erro ao selecionar diretório:', error);
                this.showError('Erro ao selecionar diretório: ' + error.message);
            }
        }
    }

    saveLastPath(path) {
        try {
            // Armazenar último arquivo baixado no localStorage
            localStorage.setItem('lastDownloadedFile', path);
            localStorage.setItem('lastDownloadTime', new Date().toISOString());
        } catch (error) {
            console.error('Erro ao salvar informação:', error);
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();

        if (this.isDownloading) return;

        const formData = new FormData(this.form);
        const data = {
            url: formData.get('youtube_url').trim(),
            quality: 'best' // Sempre melhor qualidade
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
                this.handleDownloadComplete(data.filename, data.message, data.size);
                break;
            case 'error':
                this.showError(data.message);
                this.resetDownloadState();
                break;
            case 'info':
                this.updateVideoInfo(data.title);
                break;
            case 'strategy':
                this.updateStrategy(data.strategy, data.attempt);
                break;
        }
    }

    async handleDownloadComplete(filename, message, size) {
        try {
            this.updateProgress(98, 'Preparando para salvar arquivo...');

            // Baixar o arquivo como blob
            const response = await fetch(`/api/download-file/${encodeURIComponent(filename)}`);
            if (!response.ok) {
                throw new Error('Erro ao baixar arquivo do servidor');
            }

            const blob = await response.blob();

            // Se temos um diretório selecionado e o navegador suporta, salvar lá
            if (this.selectedDirectory && 'showDirectoryPicker' in window) {
                await this.saveToSelectedDirectory(filename, blob);
            } else {
                // Fallback: download automático
                this.downloadFileFallback(filename, blob);
            }

            // Salvar informação no localStorage
            this.saveLastPath(filename);

            this.showSuccess(message, filename, size);
            this.resetDownloadState();
        } catch (error) {
            console.error('Erro ao salvar arquivo:', error);
            this.showError('Erro ao salvar arquivo: ' + error.message);
            this.resetDownloadState();
        }
    }

    async saveToSelectedDirectory(filename, blob) {
        try {
            // Criar arquivo no diretório selecionado
            const fileHandle = await this.selectedDirectory.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
        } catch (error) {
            console.error('Erro ao salvar no diretório selecionado:', error);
            // Se falhar, usar fallback
            this.downloadFileFallback(filename, blob);
        }
    }

    downloadFileFallback(filename, blob) {
        // Download automático para navegadores sem suporte
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
    
    updateStrategy(strategy, attempt) {
        const statusMessage = document.getElementById('statusMessage');
        if (attempt > 1) {
            statusMessage.textContent = `Tentativa ${attempt} com estratégia: ${strategy}`;
        }
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