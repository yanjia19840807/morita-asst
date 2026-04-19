const appName = "森田助手";

function layout(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: #18181b; padding: 24px 32px; color: #ffffff; font-size: 20px; font-weight: 600; }
    .body { padding: 32px; color: #27272a; font-size: 15px; line-height: 1.6; }
    .body p { margin: 0 0 16px; }
    .btn { display: inline-block; padding: 10px 24px; background: #18181b; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px; }
    .code { display: inline-block; padding: 8px 20px; background: #f4f4f5; border-radius: 6px; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #18181b; }
    .footer { padding: 16px 32px; text-align: center; color: #a1a1aa; font-size: 12px; border-top: 1px solid #f4f4f5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">${appName}</div>
    <div class="body">${content}</div>
    <div class="footer">&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</div>
  </div>
</body>
</html>`;
}

export function verifyEmailTemplate({
  name,
  url,
}: {
  name: string;
  url: string;
}) {
  return {
    subject: `验证你的邮箱 - ${appName}`,
    body: layout(`
      <p>你好，${name}！</p>
      <p>感谢你注册 ${appName}，请点击下方按钮验证你的邮箱地址：</p>
      <p style="text-align:center; margin: 24px 0;">
        <a class="btn" href="${url}">验证邮箱</a>
      </p>
      <p>如果按钮无法点击，请复制以下链接到浏览器打开：</p>
      <p style="word-break:break-all; color:#71717a; font-size:13px;">${url}</p>
      <p>如果你没有注册过账号，请忽略此邮件。</p>
    `),
  };
}

export function resetPasswordTemplate({
  name,
  url,
}: {
  name: string;
  url: string;
}) {
  return {
    subject: `重置密码 - ${appName}`,
    body: layout(`
      <p>你好，${name}！</p>
      <p>你正在请求重置密码，请点击下方按钮进行操作：</p>
      <p style="text-align:center; margin: 24px 0;">
        <a class="btn" href="${url}">重置密码</a>
      </p>
      <p>如果按钮无法点击，请复制以下链接到浏览器打开：</p>
      <p style="word-break:break-all; color:#71717a; font-size:13px;">${url}</p>
      <p>链接有效期为 1 小时。如果你没有请求重置密码，请忽略此邮件。</p>
    `),
  };
}
