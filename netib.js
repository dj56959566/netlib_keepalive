// cf_works.js
// 🌐 netlib.re 保活任务 for Cloudflare Workers

export default {
  async fetch(request, env, ctx) {
    const USER = env.UZANTONOMO;
    const PASS = env.PASVORTO;
    const BOT_TOKEN = env.TELEGRAM_SIGNALO;
    const CHAT_ID = env.TELEGRAM_BABILO_ID;

    let log = [`🌐 netlib.re 域名保活报告`, `🧑‍💻 正在登录账号：${USER}`];

    try {
      // 1️⃣ 模拟登录请求
      const loginUrl = "https://www.netlib.re/login";
      const loginBody = new URLSearchParams({
        username: USER,
        password: PASS
      });

      const res = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded"
        },
        body: loginBody
      });

      const text = await res.text();

      // 2️⃣ 检查返回是否包含成功信息
      if (text.includes("exclusive owner of the following domains")) {
        log.push("✅ 登录成功，账号保活成功！");
      } else if (text.includes("Invalid credentials")) {
        log.push("❌ 登录失败：Invalid credentials");
      } else if (text.includes("login size should be")) {
        log.push("❌ 登录失败：用户名长度不符");
      } else {
        log.push("⚠️ 登录失败：未知错误");
      }

    } catch (e) {
      log.push(`💥 请求异常：${e}`);
    }

    // 3️⃣ 发送 Telegram 通知
    const message = log.join("\n");
    await sendTelegram(message, BOT_TOKEN, CHAT_ID);

    return new Response(message, {
      headers: { "content-type": "text/plain;charset=utf-8" }
    });
  }
};

// 🔔 发送 Telegram 通知
async function sendTelegram(text, token, chatId) {
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        chat_id: chatId,
        text: text
      })
    });
  } catch (e) {
    console.log("⚠️ Telegram 发送失败", e);
  }
}
