import { RemoteCommandType, RemoteCommand, RemoteToastNotification } from "../types";

export type ConnectionStatus = "connected" | "connecting" | "disconnected";

type CommandCallback = (cmd: RemoteCommand) => void;
type AnnouncementCallback = (ann: RemoteToastNotification) => void;
type StateCallback = (state: any) => void;
type StatusCallback = (status: ConnectionStatus, connectedCount: number) => void;

class RemoteClientManager {
  private eventSource: EventSource | null = null;
  private clientId: string = `client_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  private deviceType: "kiosk" | "mobile" = "kiosk";
  private senderName: string = "Celular";
  private status: ConnectionStatus = "disconnected";
  private connectedCount: number = 0;
  private reconnectTimer: any = null;

  private commandListeners: Set<CommandCallback> = new Set();
  private announcementListeners: Set<AnnouncementCallback> = new Set();
  private stateListeners: Set<StateCallback> = new Set();
  private statusListeners: Set<StatusCallback> = new Set();

  public init(deviceType: "kiosk" | "mobile" = "kiosk", senderName: string = "Celular") {
    this.deviceType = deviceType;
    this.senderName = senderName;
    this.connect();
  }

  public setSenderName(name: string) {
    this.senderName = name;
  }

  public getSenderName() {
    return this.senderName;
  }

  public getClientId() {
    return this.clientId;
  }

  public getStatus() {
    return this.status;
  }

  public getConnectedCount() {
    return this.connectedCount;
  }

  private setStatus(status: ConnectionStatus, count?: number) {
    this.status = status;
    if (typeof count === "number") {
      this.connectedCount = count;
    }
    this.statusListeners.forEach((cb) => cb(this.status, this.connectedCount));
  }

  public connect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.setStatus("connecting");

    try {
      const url = `/api/remote/events?device=${this.deviceType}&clientId=${this.clientId}`;
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        this.setStatus("connected");
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleEvent(data);
        } catch (e) {
          console.error("Erro ao ler SSE payload:", e);
        }
      };

      this.eventSource.onerror = () => {
        this.setStatus("disconnected");
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        // Auto-reconnect after 4s
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.connect();
        }, 4000);
      };
    } catch (e) {
      console.error("Falha ao abrir SSE:", e);
      this.setStatus("disconnected");
    }
  }

  private handleEvent(data: any) {
    if (!data) return;

    if (data.type === "CONNECTED") {
      this.setStatus("connected", data.connectedDevices || 1);
    } else if (data.type === "DEVICE_PRESENCE") {
      this.connectedCount = data.connectedDevices || 1;
      this.setStatus("connected", this.connectedCount);
    } else if (data.type === "REMOTE_COMMAND") {
      const cmd: RemoteCommand = {
        id: `cmd_${Date.now()}_${Math.random()}`,
        type: data.command as RemoteCommandType,
        payload: data.payload,
        sender: data.sender || "Dispositivo",
        timestamp: data.timestamp || Date.now(),
      };
      this.commandListeners.forEach((cb) => cb(cmd));
    } else if (data.type === "ANNOUNCEMENT") {
      const ann: RemoteToastNotification = {
        id: data.id || `ann_${Date.now()}`,
        title: `Aviso de ${data.sender || "Celular"}`,
        message: data.message,
        sender: data.sender || "Celular",
        type: data.announcementType || "info",
        timestamp: data.timestamp || Date.now(),
      };
      this.announcementListeners.forEach((cb) => cb(ann));
    } else if (data.type === "STATE_UPDATED") {
      this.stateListeners.forEach((cb) => cb(data.state));
    }
  }

  public async sendCommand(command: RemoteCommandType, payload?: any, customSender?: string): Promise<boolean> {
    try {
      const sender = customSender || this.senderName;
      const res = await fetch("/api/remote/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command,
          payload,
          sender,
          clientId: this.clientId,
        }),
      });
      return res.ok;
    } catch (e) {
      console.error("Erro ao enviar comando:", e);
      return false;
    }
  }

  public async sendAnnouncement(message: string, type: "info" | "success" | "alert" = "info", customSender?: string): Promise<boolean> {
    try {
      const sender = customSender || this.senderName;
      const res = await fetch("/api/remote/announce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          sender,
          type,
        }),
      });
      return res.ok;
    } catch (e) {
      console.error("Erro ao enviar aviso:", e);
      return false;
    }
  }

  public async syncSharedState(state: any): Promise<boolean> {
    try {
      const res = await fetch("/api/remote/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state,
          sender: this.senderName,
          clientId: this.clientId,
        }),
      });
      return res.ok;
    } catch (e) {
      console.error("Erro ao sincronizar estado:", e);
      return false;
    }
  }

  public async fetchSharedState(): Promise<any> {
    try {
      const res = await fetch("/api/remote/state");
      if (res.ok) {
        const json = await res.json();
        return json.state;
      }
    } catch (e) {
      console.error("Erro ao buscar estado compartilhado:", e);
    }
    return null;
  }

  public onCommand(callback: CommandCallback) {
    this.commandListeners.add(callback);
    return () => this.commandListeners.delete(callback);
  }

  public onAnnouncement(callback: AnnouncementCallback) {
    this.announcementListeners.add(callback);
    return () => this.announcementListeners.delete(callback);
  }

  public onStateUpdate(callback: StateCallback) {
    this.stateListeners.add(callback);
    return () => this.stateListeners.delete(callback);
  }

  public onStatusChange(callback: StatusCallback) {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }
}

export const remoteClient = new RemoteClientManager();
