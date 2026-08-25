import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI client server-side
  let ai: GoogleGenAI | null = null;
  const getAi = () => {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing in server environment");
      }
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return ai;
  };

  // Health Endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "ALLDAY Home", version: "1.0.0" });
  });

  // Weather API simulation / data endpoint
  app.get("/api/weather", (_req, res) => {
    res.json({
      location: "São Paulo, SP",
      temperature: 24,
      condition: "Sol com poucas nuvens",
      icon: "sun-cloud",
      high: 27,
      low: 18,
      humidity: 62,
      windSpeed: 12,
      rainChance: 15,
      uvIndex: 6,
      forecast: [
        { day: "Hoje", temp: 24, icon: "sun-cloud", text: "Poucas nuvens" },
        { day: "Sáb", temp: 26, icon: "sun", text: "Ensolarado" },
        { day: "Dom", temp: 22, icon: "rain", text: "Pancadas de chuva" },
        { day: "Seg", temp: 23, icon: "cloud", text: "Nublado" },
        { day: "Ter", temp: 25, icon: "sun", text: "Limpo" },
      ],
      hourly: [
        { time: "08:00", temp: 19, icon: "sun" },
        { time: "11:00", temp: 22, icon: "sun-cloud" },
        { time: "14:00", temp: 26, icon: "sun" },
        { time: "17:00", temp: 24, icon: "sun-cloud" },
        { time: "20:00", temp: 20, icon: "moon" },
      ]
    });
  });

  // Natural Language AI Processing for Voice/Text Quick Commands
  app.post("/api/ai/parse", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Campo 'text' é obrigatório." });
      }

      const client = getAi();
      const prompt = `Você é o assistente inteligente do ALLDAY Home, o painel da família do Thiago, Erika e Zoe.
Analise a seguinte instrução falada ou digitada em português e determine qual ação executar na casa.

Texto recebido: "${text}"

Responda ESTRITAMENTE em formato JSON seguindo este esquema:
{
  "intent": "add_shopping" | "add_calendar" | "add_task" | "add_meal" | "organize_routine" | "general_response",
  "summary": "Resumo amigável em 1 frase para ser exibido no painel em português",
  "data": {
    "shoppingItem": string ou null (ex: "Leite desnatado e pão de fôrma"),
    "shoppingCategory": "Supermercado" | "Farmácia" | "Feira" | "Casa" | "Outros" ou null,
    "eventTitle": string ou null (ex: "Reunião de negócios com João"),
    "eventDate": string YYYY-MM-DD ou null (se disser quarta/amanhã/hoje, calcule baseado na data atual ${new Date().toISOString().split('T')[0]}),
    "eventTime": string HH:mm ou null (ex: "14:00"),
    "eventMember": "Thiago" | "Erika" | "Zoe" | "Família" ou null,
    "taskTitle": string ou null (ex: "Trocar o filtro do ar condicionado"),
    "taskCategory": "Lembrete" | "Manutenção" | "Limpeza" | "Trabalho" | "Pessoal" ou null,
    "taskPriority": "low" | "medium" | "high" ou null,
    "mealDay": "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo" ou null,
    "mealType": "Almoço" | "Jantar" ou null,
    "mealName": string ou null,
    "routineAdvice": array de strings com sugestões de rotina se a intenção for 'organize_routine'
  }
}`;

      const response = await client.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intent: { type: Type.STRING },
              summary: { type: Type.STRING },
              data: {
                type: Type.OBJECT,
                properties: {
                  shoppingItem: { type: Type.STRING, nullable: true },
                  shoppingCategory: { type: Type.STRING, nullable: true },
                  eventTitle: { type: Type.STRING, nullable: true },
                  eventDate: { type: Type.STRING, nullable: true },
                  eventTime: { type: Type.STRING, nullable: true },
                  eventMember: { type: Type.STRING, nullable: true },
                  taskTitle: { type: Type.STRING, nullable: true },
                  taskCategory: { type: Type.STRING, nullable: true },
                  taskPriority: { type: Type.STRING, nullable: true },
                  mealDay: { type: Type.STRING, nullable: true },
                  mealType: { type: Type.STRING, nullable: true },
                  mealName: { type: Type.STRING, nullable: true },
                  routineAdvice: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    nullable: true,
                  },
                },
              },
            },
            required: ["intent", "summary", "data"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("Erro na API AI Parse:", err);
      return res.status(500).json({
        error: "Falha ao processar com IA Gemini",
        details: err?.message || String(err),
      });
    }
  });

  // ==========================================
  // REALTIME REMOTE CONTROL & SYNC (SSE)
  // ==========================================
  interface SSEClient {
    id: string;
    device: "kiosk" | "mobile" | "unknown";
    res: express.Response;
  }

  let sseClients: SSEClient[] = [];
  let sharedState: any = null;

  function broadcastSSE(data: any, excludeId?: string) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    sseClients.forEach((client) => {
      if (client.id !== excludeId) {
        try {
          client.res.write(payload);
        } catch (e) {
          // Client disconnected
        }
      }
    });
  }

  // SSE Stream Endpoint
  app.get("/api/remote/events", (req, res) => {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const device = (req.query.device as string) === "mobile" ? "mobile" : (req.query.device as string) === "kiosk" ? "kiosk" : "unknown";

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    const client: SSEClient = { id: clientId, device, res };
    sseClients.push(client);

    // Initial connection message
    res.write(
      `data: ${JSON.stringify({
        type: "CONNECTED",
        clientId,
        device,
        connectedDevices: sseClients.length,
        timestamp: Date.now(),
      })}\n\n`
    );

    // Notify other clients about connection count change
    broadcastSSE(
      {
        type: "DEVICE_PRESENCE",
        connectedDevices: sseClients.length,
        action: "joined",
        device,
        timestamp: Date.now(),
      },
      clientId
    );

    // Keep connection alive with heartbeat
    const interval = setInterval(() => {
      try {
        res.write(`data: ${JSON.stringify({ type: "HEARTBEAT", timestamp: Date.now() })}\n\n`);
      } catch (e) {
        clearInterval(interval);
      }
    }, 25000);

    req.on("close", () => {
      clearInterval(interval);
      sseClients = sseClients.filter((c) => c.id !== clientId);
      broadcastSSE({
        type: "DEVICE_PRESENCE",
        connectedDevices: sseClients.length,
        action: "left",
        device,
        timestamp: Date.now(),
      });
    });
  });

  // Send Remote Command from Phone or Panel
  app.post("/api/remote/command", (req, res) => {
    try {
      const { command, sender, payload, clientId } = req.body;
      if (!command) {
        return res.status(400).json({ error: "Campo 'command' é obrigatório" });
      }

      const eventPayload = {
        type: "REMOTE_COMMAND",
        command,
        payload,
        sender: sender || "Celular",
        clientId,
        timestamp: Date.now(),
      };

      // Broadcast command to all connected screens (and companion devices)
      broadcastSSE(eventPayload, clientId);

      return res.json({ success: true, deliveredTo: sseClients.length });
    } catch (e: any) {
      console.error("Erro ao enviar comando remoto:", e);
      return res.status(500).json({ error: "Falha ao despachar comando", details: e?.message });
    }
  });

  // Send Announcement / Banner to Screen
  app.post("/api/remote/announce", (req, res) => {
    try {
      const { message, sender, type = "info" } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Mensagem é obrigatória" });
      }

      const announcement = {
        type: "ANNOUNCEMENT",
        id: `ann_${Date.now()}`,
        message,
        sender: sender || "Celular",
        announcementType: type,
        timestamp: Date.now(),
      };

      broadcastSSE(announcement);
      return res.json({ success: true, announcement });
    } catch (e: any) {
      return res.status(500).json({ error: "Falha no envio de aviso", details: e?.message });
    }
  });

  // State Sync Endpoints (keeps mobile and monitor in sync across instances)
  app.get("/api/remote/state", (_req, res) => {
    return res.json({ state: sharedState, timestamp: Date.now() });
  });

  app.post("/api/remote/state", (req, res) => {
    const { state, sender, clientId } = req.body;
    if (state) {
      sharedState = { ...state, updatedAt: Date.now() };
      broadcastSSE(
        {
          type: "STATE_UPDATED",
          state: sharedState,
          sender: sender || "Dispositivo",
          timestamp: Date.now(),
        },
        clientId
      );
    }
    return res.json({ success: true });
  });

  // Status endpoint
  app.get("/api/remote/status", (_req, res) => {
    return res.json({
      connectedDevices: sseClients.length,
      devices: sseClients.map((c) => ({ id: c.id, device: c.device })),
    });
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ALLDAY Home Server rodando na porta ${PORT}`);
  });
}

startServer();
