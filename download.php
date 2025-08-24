<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
set_time_limit(0);

class YouTubeDownloader {
    private $ytDlpPath;
    private $downloadPath;
    private $videoUrl;
    private $progressFile;
    
    public function __construct($videoUrl, $downloadPath) {
        $this->videoUrl = $videoUrl;
        $this->downloadPath = rtrim($downloadPath, DIRECTORY_SEPARATOR);
        
        // Detecta sistema operacional
        $isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
        
        // Tenta encontrar yt-dlp em diferentes locais baseado no SO
        if ($isWindows) {
            $possiblePaths = [
                'yt-dlp.exe',
                'yt-dlp',
                'C:\\Python\\Scripts\\yt-dlp.exe',
                'C:\\Users\\' . get_current_user() . '\\AppData\\Local\\Programs\\Python\\Python*\\Scripts\\yt-dlp.exe'
            ];
            $whereCommand = 'where';
        } else {
            $possiblePaths = [
                'yt-dlp',
                '/usr/local/bin/yt-dlp',
                '/usr/bin/yt-dlp',
                '/home/' . get_current_user() . '/.local/bin/yt-dlp',
                'python3 -m yt_dlp'
            ];
            $whereCommand = 'which';
        }
        
        $this->ytDlpPath = null;
        foreach ($possiblePaths as $path) {
            if (strpos($path, 'python3 -m') === 0) {
                // Testa módulo Python diretamente
                $testCommand = "$path --version 2>&1";
                $output = shell_exec($testCommand);
                if (!empty($output) && strpos($output, 'yt-dlp') !== false) {
                    $this->ytDlpPath = $path;
                    break;
                }
            } else {
                $testCommand = "$whereCommand $path 2>/dev/null";
                $output = shell_exec($testCommand);
                if (!empty($output)) {
                    $this->ytDlpPath = trim($output);
                    break;
                }
            }
        }
        
        if (!$this->ytDlpPath) {
            $this->ytDlpPath = 'yt-dlp'; // Fallback
        }
        
        $this->progressFile = sys_get_temp_dir() . '/youtube_download_progress.txt';
        
        if (!is_dir($this->downloadPath)) {
            if (!mkdir($this->downloadPath, 0755, true)) {
                throw new Exception("Não foi possível criar a pasta de download: " . $this->downloadPath);
            }
        }
    }
    
    public function getVideoInfo() {
        $command = escapeshellcmd($this->ytDlpPath) . ' --get-title --get-duration --get-filename -f "best[height>=1080]" ' . escapeshellarg($this->videoUrl) . ' 2>&1';
        $output = [];
        $returnCode = 0;
        
        exec($command, $output, $returnCode);
        
        if ($returnCode !== 0) {
            throw new Exception("Erro ao obter informações do vídeo: " . implode("\n", $output));
        }
        
        if (count($output) >= 3) {
            return [
                'title' => trim($output[0]),
                'duration' => trim($output[1]),
                'filename' => trim($output[2])
            ];
        }
        
        throw new Exception("Não foi possível obter todas as informações do vídeo");
    }
    
    public function normalizeFilename($title) {
        // Converte para "normal case" - remove caracteres especiais e mantém espaços
        $filename = preg_replace('/[^\w\s\-\.\(\)]/', '', $title);
        $filename = preg_replace('/\s+/', ' ', $filename);
        $filename = trim($filename);
        
        // Adiciona extensão .mp4 se não tiver
        if (!preg_match('/\.(mp4|mkv|webm)$/i', $filename)) {
            $filename .= '.mp4';
        }
        
        return $filename;
    }
    
    public function download() {
        try {
            echo "<script>updateProgress(5, 'Verificando yt-dlp...');</script>";
            flush();
            
            // Verifica se yt-dlp está funcionando
            $testCommand = escapeshellcmd($this->ytDlpPath) . ' --version 2>&1';
            $testOutput = shell_exec($testCommand);
            
            if (empty($testOutput) || strpos($testOutput, 'not found') !== false || strpos($testOutput, 'not recognized') !== false) {
                throw new Exception("yt-dlp não encontrado. Instale usando: pip install yt-dlp");
            }
            
            echo "<script>updateProgress(10, 'Obtendo informações do vídeo...');</script>";
            flush();
            
            $videoInfo = $this->getVideoInfo();
            $normalizedFilename = $this->normalizeFilename($videoInfo['title']);
            $fullPath = $this->downloadPath . DIRECTORY_SEPARATOR . $normalizedFilename;
            
            echo "<script>showVideoInfo('" . addslashes($videoInfo['title']) . "', 'Duração: " . addslashes($videoInfo['duration']) . "');</script>";
            echo "<script>updateProgress(20, 'Iniciando download em Full HD...');</script>";
            flush();
            
            // Comando yt-dlp com progresso
            $command = escapeshellcmd($this->ytDlpPath) . ' ' .
                      '-f "best[height>=1080]/best" ' .
                      '--newline ' .
                      '--progress ' .
                      '-o ' . escapeshellarg($fullPath) . ' ' .
                      escapeshellarg($this->videoUrl) . ' 2>&1';
            
            echo "<script>console.log('Comando: " . addslashes($command) . "');</script>";
            flush();
            
            $this->executeWithProgress($command);
            
            if (file_exists($fullPath)) {
                $fileSize = $this->formatBytes(filesize($fullPath));
                echo "<script>updateProgress(100, 'Download concluído! Arquivo salvo em: " . addslashes($fullPath) . " (Tamanho: $fileSize)');</script>";
                echo "<script>document.getElementById('statusMessage').className = 'status-message success';</script>";
            } else {
                throw new Exception("O arquivo não foi criado corretamente");
            }
            
        } catch (Exception $e) {
            echo "<script>updateProgress(0, 'Erro: " . addslashes($e->getMessage()) . "');</script>";
            echo "<script>document.getElementById('statusMessage').className = 'status-message error';</script>";
        }
        
        echo "<script>resetForm();</script>";
        flush();
    }
    
    private function executeWithProgress($command) {
        $process = popen($command, 'r');
        if (!$process) {
            throw new Exception("Não foi possível iniciar o processo de download");
        }
        
        $lastProgress = 0;
        $hasOutput = false;
        
        while (!feof($process)) {
            $line = fgets($process);
            if ($line) {
                $hasOutput = true;
                $line = trim($line);
                
                // Debug: mostrar todas as linhas do yt-dlp
                echo "<script>console.log('yt-dlp: " . addslashes($line) . "');</script>";
                flush();
                
                // Procura por padrões de progresso do yt-dlp
                if (preg_match('/(\d+\.?\d*)%/', $line, $matches)) {
                    $progress = floatval($matches[1]);
                    if ($progress > $lastProgress) {
                        $displayProgress = 20 + ($progress * 0.75); // Mapeia para 20-95%
                        echo "<script>updateProgress($displayProgress, 'Baixando... $progress%');</script>";
                        $lastProgress = $progress;
                        flush();
                    }
                } elseif (strpos($line, '[download]') !== false && strpos($line, '%') !== false) {
                    // Padrão alternativo de progresso
                    if (preg_match('/(\d+\.?\d*)%/', $line, $matches)) {
                        $progress = floatval($matches[1]);
                        $displayProgress = 20 + ($progress * 0.75);
                        echo "<script>updateProgress($displayProgress, 'Baixando... $progress%');</script>";
                        flush();
                    }
                } elseif (strpos($line, 'Downloading') !== false) {
                    echo "<script>updateProgress(25, 'Baixando arquivo...');</script>";
                    flush();
                } elseif (strpos($line, 'download completed') !== false || strpos($line, '100%') !== false) {
                    echo "<script>updateProgress(95, 'Finalizando download...');</script>";
                    flush();
                } elseif (strpos($line, 'ERROR') !== false || strpos($line, 'Error') !== false) {
                    throw new Exception("Erro no yt-dlp: " . $line);
                }
            }
        }
        
        $returnCode = pclose($process);
        
        if (!$hasOutput) {
            throw new Exception("Nenhuma saída do yt-dlp. Verifique se está instalado corretamente.");
        }
        
        if ($returnCode !== 0) {
            throw new Exception("Erro durante o download (código de saída: $returnCode)");
        }
    }
    
    private function formatBytes($size, $precision = 2) {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $size > 1024 && $i < count($units) - 1; $i++) {
            $size /= 1024;
        }
        
        return round($size, $precision) . ' ' . $units[$i];
    }
}

// Processamento principal
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $videoUrl = trim($_POST['youtube_url'] ?? '');
    $downloadPath = trim($_POST['download_path'] ?? '');
    
    if (empty($videoUrl)) {
        echo "<script>updateProgress(0, 'URL do YouTube é obrigatória');</script>";
        echo "<script>document.getElementById('statusMessage').className = 'status-message error';</script>";
        echo "<script>resetForm();</script>";
        exit;
    }
    
    if (empty($downloadPath)) {
        echo "<script>updateProgress(0, 'Pasta de download é obrigatória');</script>";
        echo "<script>document.getElementById('statusMessage').className = 'status-message error';</script>";
        echo "<script>resetForm();</script>";
        exit;
    }
    
    // Valida se é uma URL do YouTube
    if (!preg_match('/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/', $videoUrl)) {
        echo "<script>updateProgress(0, 'URL inválida. Use uma URL do YouTube válida.');</script>";
        echo "<script>document.getElementById('statusMessage').className = 'status-message error';</script>";
        echo "<script>resetForm();</script>";
        exit;
    }
    
    try {
        $downloader = new YouTubeDownloader($videoUrl, $downloadPath);
        $downloader->download();
    } catch (Exception $e) {
        echo "<script>updateProgress(0, 'Erro: " . addslashes($e->getMessage()) . "');</script>";
        echo "<script>document.getElementById('statusMessage').className = 'status-message error';</script>";
        echo "<script>resetForm();</script>";
    }
}
?>