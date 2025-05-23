import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './Notifications.css';

// Simple notification item component
const NotificationItem = ({ notification, onMarkAsRead }) => (
  <div 
    className={`notification ${notification.type} ${notification.read ? 'read' : 'unread'}`}
    onClick={() => onMarkAsRead(notification.id)}
  >
    <div className="notification-content">
      <h4>{notification.title}</h4>
      <p>{notification.message}</p>
      <span className="notification-time">
        {new Date(notification.date).toLocaleString()}
      </span>
    </div>
  </div>
);

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 'welcome',
      title: 'Notifications',
      message: 'Waiting for new orders...',
      date: new Date().toISOString(),
      read: true,
      type: 'info',
      showInApp: true
    }
  ]);
  const [connected, setConnected] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const clientRef = useRef(null);
  const notificationsEndRef = useRef(null);
  
  // Auto-scroll to bottom when new notifications arrive
  useEffect(() => {
    if (notificationsEndRef.current) {
      notificationsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [notifications]);

  /**
   * Formats incoming WebSocket messages into notification objects
   * @param {string|object} message - The raw message from WebSocket
   * @returns {object} Formatted notification object
   */
  const formatMessage = (message) => {
    // Return early for falsy values
    if (!message) {
      console.warn('Received empty message');
      return createFallbackNotification('Empty message received');
    }

    let parsedData;
    
    // Parse JSON if message is a string
    if (typeof message === 'string') {
      try {
        parsedData = JSON.parse(message);
      } catch (e) {
        console.warn('Failed to parse message as JSON, using as plain text');
        return createFallbackNotification(message);
      }
    } else {
      parsedData = message;
    }

    // Handle order messages
    if (parsedData.orderId || parsedData.id) {
      // Log the full message for debugging
      console.log('Processing order data:', parsedData);
      
      // Extract order ID
      const orderId = parsedData.orderId || parsedData.id || 'N/A';
      
      // Calculate total from order details if available
      let totalAmount = 0;
      
      // First try to use the total from the message if it's valid
      if (parsedData.total && parsedData.total > 0) {
        totalAmount = parseFloat(parsedData.total);
      } 
      // If no valid total, calculate from products
      else if (parsedData.orderDetails && Array.isArray(parsedData.orderDetails.products)) {
        totalAmount = parsedData.orderDetails.products.reduce((sum, product) => {
          // Ensure we have valid numbers
          const price = parseFloat(product.price) || 0;
          const quantity = parseInt(product.quantity) || 1;
          return sum + (price * quantity);
        }, 0);
      }
      
      // Format the total amount to 2 decimal places
      const formattedTotal = totalAmount.toFixed(2);
      
      console.log('Final calculated total:', formattedTotal);
      
      // Create a detailed message with order information
      let message = `New Order #${orderId}\n`;
      message += `Total: $${formattedTotal}\n`;
      
      // Add product details if available
      if (parsedData.orderDetails?.products?.length > 0) {
        message += '\nItems:\n';
        parsedData.orderDetails.products.forEach((product, index) => {
          message += `${index + 1}. ${product.name || 'Item'} x${product.quantity || 1} - $${(product.price * (product.quantity || 1)).toFixed(2)}\n`;
        });
      }
      
      // Add customer info if available
      if (parsedData.customerName || parsedData.customerEmail) {
        message += '\nCustomer: ';
        if (parsedData.customerName) message += parsedData.customerName;
        if (parsedData.customerEmail) message += ` (${parsedData.customerEmail})`;
        message += '\n';
      }
      
      return {
        id: `order-${orderId}-${Date.now()}`,
        title: 'New Order Received!',
        message: message.trim(),
        date: parsedData.timestamp || new Date().toISOString(),
        read: false,
        type: 'order',
        rawData: parsedData
      };
    }

    // Handle other structured messages
    if (typeof parsedData === 'object') {
      return {
        id: `msg-${Date.now()}`,
        title: parsedData.title || 'New Notification',
        message: parsedData.message || JSON.stringify(parsedData, null, 2),
        date: parsedData.timestamp || new Date().toISOString(),
        read: false,
        type: parsedData.type || 'info',
        rawData: parsedData
      };
    }

    // Fallback for any other message type
    return createFallbackNotification(String(message));
  };

  /**
   * Creates a fallback notification for invalid messages
   * @param {string} message - The message to display
   * @returns {object} A fallback notification object
   */
  const createFallbackNotification = (message) => ({
    id: `fallback-${Date.now()}`,
    title: 'New Message',
    message: String(message),
    date: new Date().toISOString(),
    read: false,
    type: 'info',
    rawData: message
  });

  useEffect(() => {
    console.log('Initializing WebSocket connection to http://localhost:8086/ws...');
    
    // Request notification permission
    const requestNotificationPermission = async () => {
      if (window.Notification) {
        console.log('Current notification permission:', Notification.permission);
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
          try {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
          } catch (error) {
            console.error('Error requesting notification permission:', error);
          }
        }
      }
    };
    
    requestNotificationPermission();
    
    // Track processed message IDs to prevent duplicates
    const processedMessageIds = new Set();
    let subscription = null;
    
    // Create SockJS connection with debug handlers
    const socket = new SockJS('http://localhost:8086/ws');
    
    // Add socket event listeners for debugging
    socket.onopen = () => {
      console.log('SockJS connection opened');
      setConnected(true);
    };
    
    socket.onclose = (e) => {
      console.log('SockJS connection closed', e);
      setConnected(false);
    };
    
    socket.onerror = (e) => {
      console.error('SockJS error', e);
      setConnected(false);
    };
    
    // Create STOMP client with detailed debug logging
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        // Filter out heartbeat logs for cleaner console
        if (!str.includes('PING') && !str.includes('PONG')) {
          console.log('STOMP:', str);
        }
      },
      onConnect: (frame) => {
        console.log('STOMP: Successfully connected to WebSocket');
        console.log('Connected headers:', frame.headers);
        setConnected(true);
        
        // Add a connection status notification
        const connectionNotification = {
          id: 'connection-' + Date.now(),
          title: 'Connected to Notification Service',
          message: 'Ready to receive order notifications',
          date: new Date().toISOString(),
          type: 'success',
          read: false
        };
        
        setNotifications(prev => [connectionNotification, ...prev.filter(n => !n.id.startsWith('connection-'))]);
        
        // Subscribe to orders topic with enhanced error handling
        subscription = client.subscribe('/topic/orders', (message) => {
          console.group('WebSocket Message Received');
          console.log('Raw message:', message);
          
          try {
            if (!message || !message.body) {
              throw new Error('Empty message or message body received');
            }
            
            console.log('Message body:', message.body);
            
            // Parse the message body once
            let parsedBody;
            try {
              parsedBody = JSON.parse(message.body);
              console.log('Parsed message body:', parsedBody);
            } catch (e) {
              console.error('Failed to parse message body as JSON:', e);
              console.groupEnd();
              return;
            }
            
            // Skip if we've already processed this message
            const messageId = parsedBody.id || parsedBody.orderId || JSON.stringify(parsedBody);
            if (processedMessageIds.has(messageId)) {
              console.log('Skipping duplicate message ID:', messageId);
              console.groupEnd();
              return;
            }
            
            // Add to processed messages
            processedMessageIds.add(messageId);
            
            // Format the notification
            const notification = formatMessage(parsedBody);
            console.log('Processed notification:', notification);
            
            // Update notifications state, ensuring no duplicates
            setNotifications(prev => {
              // Remove any existing notifications with the same order ID
              const filtered = prev.filter(n => 
                n.id !== notification.id && 
                n.rawData?.orderId !== parsedBody.orderId
              );
              return [notification, ...filtered].slice(0, 49);
            });
            
            // Show desktop notification if permission is granted
            if (window.Notification && Notification.permission === 'granted') {
              try {
                new Notification(notification.title, {
                  body: notification.message,
                  icon: '/logo192.png',
                  requireInteraction: true
                });
                console.log('Desktop notification shown');
              } catch (notifError) {
                console.error('Failed to show desktop notification:', notifError);
              }
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', {
              error: error.message,
              stack: error.stack,
              rawMessage: message,
              timestamp: new Date().toISOString()
            });
          } finally {
            console.groupEnd();
          }
        });
        
        console.log('STOMP: Subscribed to /topic/orders');
      },
      onStompError: (frame) => {
        console.error('STOMP protocol error:', frame.headers?.message || 'Unknown error');
        console.error('Error details:', frame.body);
        setConnected(false);
      },
      onWebSocketClose: (event) => {
        console.log('WebSocket connection closed:', event);
        setConnected(false);
      },
      onDisconnect: () => {
        console.log('STOMP client disconnected');
        setConnected(false);
      }
    });
    
    // Store client reference for cleanup
    clientRef.current = client;
    
    // Activate the client
    console.log('Activating STOMP client...');
    try {
      client.activate();
      console.log('STOMP client activation initiated');
      
      // Fallback to SockJS if WebSocket connection fails
      client.onWebSocketClose = () => {
        console.log('WebSocket connection closed, trying SockJS fallback...');
        const sock = new SockJS('http://localhost:8086/ws');
        client.webSocketFactory = () => sock;
        client.activate();
      };
    } catch (error) {
      console.error('Failed to activate STOMP client:', error);
      setConnected(false);
    }

    // Add unhandled rejection handler
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      if (event.reason && event.reason.message && 
          event.reason.message.includes('in STATE_CLOSING')) {
        console.warn('WebSocket is closing, attempting to reconnect...');
        setTimeout(() => {
          if (clientRef.current && typeof clientRef.current.activate === 'function') {
            clientRef.current.activate()
              .then(() => {
                console.log('Reconnected to WebSocket');
                setConnected(true);
              })
              .catch(err => {
                console.error('Reconnection failed:', err);
                setConnected(false);
              });
          }
        }, 1000);
      }
    };
    
    // Add the event listener
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup function
    const cleanup = () => {
      console.log('Cleaning up WebSocket connection...');
      
      // Deactivate the client if it exists
      if (clientRef.current) {
        try {
          console.log('Deactivating STOMP client...');
          clientRef.current.deactivate()
            .then(() => console.log('STOMP client deactivated'))
            .catch(err => console.error('Error deactivating STOMP client:', err))
            .finally(() => {
              clientRef.current = null;
            });
        } catch (error) {
          console.error('Error during WebSocket cleanup:', error);
          clientRef.current = null;
        }
      }
    };
    
    // Return the cleanup function
    return cleanup;
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="notifications-page">
      <div className={`notifications-container ${showNotifications ? 'show-notifications' : ''}`}>
        <div 
          className="notifications-header"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <h2>
            <i className="fas fa-bell"></i> Order Notifications
            <span className={`connection-badge ${connected ? 'connected' : 'disconnected'}`}>
              <span className="status-dot"></span>
              {connected ? 'Live' : 'Offline'}
            </span>
          </h2>
          <div className="notification-indicator">
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="unread-count">
                {Math.min(notifications.filter(n => !n.read).length, 9)}
                {notifications.filter(n => !n.read).length > 9 ? '+' : ''}
              </span>
            )}
            <i className={`fas fa-chevron-${showNotifications ? 'up' : 'down'}`}></i>
          </div>
        </div>
        
        <div className="notifications-dropdown">
          <div className="notifications-list">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <NotificationItem 
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))
            ) : (
              <div className="no-notifications">
                <i className="fas fa-inbox"></i>
                <p>No new notifications</p>
              </div>
            )}
            <div ref={notificationsEndRef} />
          </div>
          
          <div className="notifications-actions">
            <button 
              className="mark-all-read"
              onClick={() => markAllAsRead()}
              disabled={notifications.every(n => n.read) || notifications.length <= 1}
            >
              Mark all as read
            </button>
            <small className="notification-count">
              {notifications.filter(n => !n.read).length} unread
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
