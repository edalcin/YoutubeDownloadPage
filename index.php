<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouTube Video Downloader</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: #555;
        }
        input[type="url"], input[type="text"], select {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        }
        input[type="url"]:focus, input[type="text"]:focus, select:focus {
            border-color: #4CAF50;
            outline: none;
        }
        .submit-btn {
            background-color: #4CAF50;
            color: white;
            padding: 14px 28px;
            font-size: 16px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            width: 100%;
            transition: background-color 0.3s;
        }
        .submit-btn:hover {
            background-color: #45a049;
        }
        .submit-btn:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        .progress-container {
            margin-top: 20px;
            display: none;
        }
        .progress-bar {
            width: 100%;
            height: 30px;
            background-color: #f0f0f0;
            border-radius: 15px;
            overflow: hidden;
            position: relative;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(45deg, #4CAF50, #45a049);
            width: 0%;
            transition: width 0.3s ease;
            position: relative;
        }
        .progress-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #333;
            font-weight: bold;
            z-index: 1;
        }
        .status-message {
            margin-top: 15px;
            padding: 10px;
            border-radius: 5px;
            font-weight: bold;
        }
        .success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .info { background-color: #cce7ff; color: #004085; border: 1px solid #b3d7ff; }
        .video-info {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
            border-left: 4px solid #4CAF50;
        }
        .video-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .video-details {
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎥 YouTube Video Downloader</h1>
        
        <form id="downloadForm" method="POST">
            <div class="form-group">
                <label for="youtube_url">URL do YouTube:</label>
                <input type="url" id="youtube_url" name="youtube_url" required 
                       placeholder="https://www.youtube.com/watch?v=..." 
                       value="<?php echo htmlspecialchars($_POST['youtube_url'] ?? ''); ?>">
            </div>
            
            <div class="form-group">
                <label for="download_path">Pasta de Download:</label>
                <input type="text" id="download_path" name="download_path" required 
                       placeholder="P:\youtube" 
                       value="<?php echo htmlspecialchars($_POST['download_path'] ?? 'P:\youtube'); ?>">
            </div>
            
            <button type="submit" class="submit-btn" id="downloadBtn">
                🚀 Iniciar Download
            </button>
        </form>

        <div class="progress-container" id="progressContainer">
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
                <div class="progress-text" id="progressText">0%</div>
            </div>
            <div id="statusMessage" class="status-message info" style="display: none;"></div>
        </div>

        <div id="videoInfo" class="video-info" style="display: none;">
            <div class="video-title" id="videoTitle"></div>
            <div class="video-details" id="videoDetails"></div>
        </div>
    </div>


    <script>
        let downloadInProgress = false;
        
        document.getElementById('downloadForm').addEventListener('submit', function(e) {
            if (downloadInProgress) {
                e.preventDefault();
                return;
            }
            
            const btn = document.getElementById('downloadBtn');
            const progressContainer = document.getElementById('progressContainer');
            
            btn.disabled = true;
            btn.textContent = '⏳ Processando...';
            downloadInProgress = true;
            
            progressContainer.style.display = 'block';
            updateProgress(0, 'Iniciando download...');
        });

        function updateProgress(percent, message) {
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            const statusMessage = document.getElementById('statusMessage');
            
            progressFill.style.width = percent + '%';
            progressText.textContent = Math.round(percent) + '%';
            
            if (message) {
                statusMessage.textContent = message;
                statusMessage.style.display = 'block';
            }
        }

        function showVideoInfo(title, details) {
            const videoInfo = document.getElementById('videoInfo');
            const videoTitle = document.getElementById('videoTitle');
            const videoDetails = document.getElementById('videoDetails');
            
            videoTitle.textContent = title;
            videoDetails.textContent = details;
            videoInfo.style.display = 'block';
        }

        function resetForm() {
            const btn = document.getElementById('downloadBtn');
            btn.disabled = false;
            btn.textContent = '🚀 Iniciar Download';
            downloadInProgress = false;
        }

    </script>

<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['youtube_url'])) {
    include 'download.php';
}
?>
</body>
</html>