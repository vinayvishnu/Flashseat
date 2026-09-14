import { io, Socket } from 'socket.io-client';

const URL = 'http://localhost:5000';

class RealSocket {
  private socket: Socket;

  constructor() {
    this.socket = io(URL, {
      autoConnect: false,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to real Socket.io backend.');
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from backend.');
    });
  }

  public connect() {
    this.socket.connect();
  }

  public disconnect() {
    this.socket.disconnect();
  }

  public on(event: string, callback: (data: any) => void) {
    this.socket.on(event, callback);
  }

  public off(event: string, callback: (data: any) => void) {
    this.socket.off(event, callback);
  }

  public emit(event: string, data: any) {
    this.socket.emit(event, data);
  }
}

export const socket = new RealSocket();
