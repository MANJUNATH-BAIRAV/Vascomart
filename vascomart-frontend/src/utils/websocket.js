import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const createWebSocketClient = (url, onMessage, onConnect, onError) => {
  const socket = new SockJS(url);
  const client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (str) => {
      if (!str.includes('PING') && !str.includes('PONG')) {
        console.log('STOMP:', str);
      }
    },
    onConnect: (frame) => {
      console.log('STOMP: Connected to WebSocket');
      onConnect?.(frame);
    },
    onStompError: (frame) => {
      console.error('STOMP protocol error:', frame.headers?.message || 'Unknown error');
      onError?.(frame);
    },
    onWebSocketClose: () => {
      console.log('WebSocket connection closed');
    },
    onDisconnect: () => {
      console.log('STOMP client disconnected');
    }
  });

  return client;
};

export const subscribeToTopic = (client, topic, onMessage) => {
  if (!client.connected) {
    console.error('Cannot subscribe: WebSocket not connected');
    return null;
  }

  return client.subscribe(topic, (message) => {
    try {
      const payload = JSON.parse(message.body);
      onMessage(payload, message);
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });
};

export const unsubscribeFromTopic = (subscription) => {
  if (subscription) {
    try {
      subscription.unsubscribe();
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
    }
  }
};
