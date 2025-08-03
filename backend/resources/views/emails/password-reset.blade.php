<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>パスワードリセット</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>旅行プランナー</h1>
        <p>パスワードリセット</p>
    </div>
    
    <div class="content">
        <h2>{{ $userName }} 様</h2>
        
        <p>パスワードリセットのリクエストを受け付けました。</p>
        
        <p>以下のボタンをクリックして、新しいパスワードを設定してください：</p>
        
        <div style="text-align: center;">
            <a href="{{ $resetUrl }}" class="button">
                パスワードをリセット
            </a>
        </div>
        
        <p>ボタンがクリックできない場合は、以下のURLをブラウザにコピー&ペーストしてください：</p>
        <p style="word-break: break-all; color: #667eea;">
            {{ $resetUrl }}
        </p>
        
        <div class="warning">
            <strong>⚠️ セキュリティに関する重要なお知らせ</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>このリンクは24時間後に無効になります</li>
                <li>このリクエストを送信していない場合は、このメールを無視してください</li>
                <li>パスワードは安全に保管し、他の人と共有しないでください</li>
            </ul>
        </div>
        
        <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
    </div>
    
    <div class="footer">
        <p>このメールは旅行プランナーから送信されました。</p>
        <p>このメールに心当たりがない場合は、無視していただいて構いません。</p>
    </div>
</body>
</html> 