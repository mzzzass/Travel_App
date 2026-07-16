import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // DeepSeek API generator endpoint
  app.post('/api/generate-plan', async (req, res) => {
    try {
      const { destination, days, travelers, style } = req.body;
      
      if (!destination || !days) {
        return res.status(400).json({ error: '请提供目的地和旅行天数！' });
      }

      const parsedDays = parseInt(days, 10);
      if (isNaN(parsedDays) || parsedDays <= 0 || parsedDays > 30) {
        return res.status(400).json({ error: '请提供有效的旅行天数（1-30天之间）' });
      }

      // Read API Key - check env first, fallback to user-supplied key in their prompt
      const apiKey = process.env.DEEPSEEK_API_KEY || 'sk-56d73f7d68394a9091988199d34e9718';

      if (!apiKey || apiKey === 'MY_DEEPSEEK_API_KEY') {
        return res.status(401).json({
          error: '未配置 DeepSeek API Key。请在 AI Studio 侧边栏的 Secrets 面板中添加 DEEPSEEK_API_KEY。'
        });
      }

      const systemPrompt = `你是一个拥有10年丰富经验的资深全球旅行规划师。熟悉国内、国外各大城市、景区的游玩特色、交通方式、美食特产、住宿选择、避坑指南。
擅长根据目的地特点和精准天数，定制高性价比、不赶行程、沉浸式游玩的专属旅行攻略。行程节奏松弛有度，不赶路、不绕路，景点就近串联，规避网红鸡肋景点，优先推荐本地人常去、口碑优质的游玩地和美食。
适配人群：普通出行人群，无高端小众定制，主打大众落地实用。
内容底线：无虚假信息、无过期攻略、不推荐天价消费项目，标注避雷点和注意事项，拒绝强制消费、购物套路景点。

请针对用户的输入信息，严格按照以下 JSON schema 格式返回结构化数据，严禁返回任何 Markdown 标记之外的纯文本，必须是合法的 JSON 对象。

JSON schema 要求：
{
  "overview": {
    "destination": "目的地名称",
    "duration": 天数(数字),
    "features": ["核心游玩特色1", "特色2", ...],
    "bestSeason": "最适合旅行的季节及原因",
    "budgetRange": "整体消费预算人均区间 (例如: 1500-2500元)",
    "packingList": ["物品1", "物品2", ...],
    "highlights": ["整体行程核心亮点总结1", "亮点2", ...]
  },
  "dailyPlans": [
    {
      "day": 1,
      "theme": "第一天主题/节奏说明",
      "morning": {
        "activities": "上午行程详情及游玩建议",
        "duration": "建议游玩时长 (例如: 2.5小时)",
        "openTime": "参考开放时间 (例如: 08:30-17:00)"
      },
      "afternoon": {
        "activities": "下午行程详情及游玩建议",
        "duration": "建议游玩时长 (例如: 3小时)",
        "openTime": "参考开放时间"
      },
      "evening": {
        "activities": "晚上行程及夜间游玩/散步推荐",
        "duration": "建议游玩时长 (例如: 2小时)",
        "openTime": "参考开放时间"
      },
      "food": {
        "recommendations": ["当地特色美食/正餐推荐1", "特色小吃2"],
        "locations": ["建议的美食街或具体店面聚集地 (例如: 建设路小吃街)"]
      },
      "transport": "当日出行交通贴士 (例如: 地铁2号线直达，或建议打车)"
    }
  ],
  "accommodations": [
    {
      "tier": "性价比平价",
      "area": "推荐区域名称 (例如: 春熙路/天府广场周边)",
      "reason": "选址理由、交通便利度、生活配套分析",
      "targetGroup": "适合人群描述 (例如: 学生、穷游党)",
      "priceRange": "每晚参考价位区间 (例如: 150-250元/晚)",
      "recommendations": ["具体推荐的优质快捷酒店或特色民宿名1", "推荐2"]
    },
    {
      "tier": "中端舒适",
      "area": "推荐区域名称",
      "reason": "选址理由及环境分析",
      "targetGroup": "适合人群描述 (例如: 白领、情侣出游)",
      "priceRange": "每晚参考价位区间 (例如: 300-500元/晚)",
      "recommendations": ["具体中端酒店/精品客栈推荐1", "推荐2"]
    },
    {
      "tier": "高端品质",
      "area": "推荐区域名称",
      "reason": "豪华体验、风景或配套分析",
      "targetGroup": "适合人群描述 (例如: 亲子家庭、品质追求者)",
      "priceRange": "每晚参考价位区间 (例如: 800-1500元/晚)",
      "recommendations": ["高端高星酒店/顶级度假别墅推荐1", "推荐2"]
    }
  ],
  "foodAndSouvenirs": {
    "mustEat": ["必吃美食名1", "必吃小吃2", ...],
    "dineIn": ["推荐去店里堂食的特色正餐1", "美食街/苍蝇馆子推荐2", ...],
    "souvenirs": ["必买当地特产名1", "特产2", ...],
    "takeAway": ["适合买来带走送人的手信/特产伴手礼", ...],
    "avoidList": ["美食避坑项/不推荐的网红虚高店/过度包装特产", ...]
  },
  "transportGuide": {
    "external": ["大交通抵达建议 (如: 飞机落地XX机场，高铁选择XX站)", ...],
    "internal": ["市内出行首选工具及扫码乘车建议 (如: 下载XX公交APP/使用微信小程序)", ...],
    "connection": ["景点间衔接交通技巧 (如: 景区直通车、打车性价比较高)", ...],
    "parking": "针对自驾游的停车/租车贴士 (若是非自驾城市，给出打车或步行友好度评估)"
  },
  "trapsAndTips": {
    "commonTraps": ["常见旅游套路/野鸡旅行团/强制消费避坑1", "隐形消费点2", ...],
    "avoidSpots": ["过度商业化或性价比极低的避雷景点/平替景点建议1", "平替2", ...],
    "clothingAndWeather": "近期/最佳季节的天气适配、穿衣指数及必备携带（防雨/防晒等）说明",
    "reservationNotice": ["哪些核心景点必须提前预约，具体的预约天数和官方渠道", ...],
    "safetyTips": ["目的地安全注意事项、防偷盗防野导等", ...]
  },
  "budgetDetail": {
    "perPerson": {
      "tickets": 门票费用(数字),
      "food": 餐饮费用(数字),
      "accommodation": 住宿单人分摊费用(数字),
      "transport": 交通费用(数字),
      "others": 杂费(数字)
    },
    "totalRange": "精准人均总预算区间 (例如: 1200-1800元/人)",
    "note": "预算说明及性价比最大化技巧"
  }
}

特殊适配规则（必须在生成内容时自动根据天数和类型调整）：
- 若天数是短途1-2天：精简行程，主打核心经典景点，不安排偏远小众景点，行程紧凑但不疲惫；
- 若天数是3-5天：均衡搭配经典景点 + 小众打卡点 + 休闲美食探店，节奏舒缓；
- 若天数是6天以上：拆分区域游玩，分片区规划景点，增加休闲放松时段，避免每日高强度游玩；
- 自动区分城市游/山水景区/古镇/海岛等目的地类型，针对性调整行程风格（海岛侧重休闲玩水，山水侧重自然风光，城市侧重人文美食与交通便利）。`;

      const userPrompt = `我要去【${destination}】玩【${parsedDays}】天。
出行人群：${travelers || '通用普通出行人群'}。
出行风格：${style || '舒适游、不赶路、重美食和地道风情'}。
请帮我规划一期完美的、专属的沉浸式旅行攻略，符合你的专业旅行规划师角色，并严格输出要求的JSON格式。`;

      console.log(`[API] Fetching from DeepSeek for ${destination}, ${parsedDays} days...`);
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          response_format: {
            type: 'json_object'
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[API] DeepSeek returned error status:', response.status, errorText);
        throw new Error(`DeepSeek API 响应错误 (状态码: ${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('[API] Received response from DeepSeek.');

      const contentString = data.choices?.[0]?.message?.content;
      if (!contentString) {
        throw new Error('未获取到 DeepSeek 生成的内容，请重试');
      }

      // Parse JSON safely
      let itinerary;
      try {
        itinerary = JSON.parse(contentString);
      } catch (err) {
        console.error('[API] Failed to parse JSON from AI response:', contentString);
        throw new Error('AI 返回的内容格式不是合法的 JSON，请重新生成');
      }

      return res.json(itinerary);

    } catch (error: any) {
      console.error('[API Error]', error);
      return res.status(500).json({
        error: error.message || '行程生成失败，请检查网络或 API Key 设置。'
      });
    }
  });

  // Serve static assets or mount Vite dev middleware
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Import Vite dynamically to support development middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`[Server] AI旅行规划师 full-stack server running on port ${port}`);
  });
}

startServer();
