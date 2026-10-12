import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:site_room')
  handleJoinSiteRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() siteId: string,
  ) {
    client.join(`site_${siteId}`);
    this.logger.log(`Client ${client.id} joined room: site_${siteId}`);
    return { event: 'joined', room: `site_${siteId}` };
  }

  @SubscribeMessage('leave:site_room')
  handleLeaveSiteRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() siteId: string,
  ) {
    client.leave(`site_${siteId}`);
    this.logger.log(`Client ${client.id} left room: site_${siteId}`);
    return { event: 'left', room: `site_${siteId}` };
  }

  @SubscribeMessage('gps:broadcast')
  handleGpsBroadcast(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { siteId: string; userId: string; fullName: string; division: string; latitude: number; longitude: number },
  ) {
    this.server.to(`site_${payload.siteId}`).emit('gps:update', {
      ...payload,
      updatedAt: new Date().toISOString(),
    });
  }

  // Method to dispatch emergency SOS to all admin dashboards
  broadcastSosAlert(alert: any) {
    this.server.emit('sos:new', alert);
    this.logger.warn(`EMERGENCY SOS BROADCAST TO ALL MONITORS: Alert ID ${alert.id}`);
  }

  // Method to broadcast checkpoint patrol scan
  broadcastPatrolScan(siteId: string, scan: any) {
    this.server.to(`site_${siteId}`).emit('patrol:checkpoint_scanned', scan);
    this.server.emit('patrol:activity', scan);
  }
}
