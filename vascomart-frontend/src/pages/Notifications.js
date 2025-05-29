import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { FaTimes, FaCheck, FaBellSlash } from 'react-icons/fa';
import { Client } from '@stomp/stompjs';
import './Notifications.css';

// Notification Item Component
const NotificationItem = ({ notification, onMarkAsRead, onRemove, isDropdown = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`notification-item ${notification.read ? 'read' : 'unread'} ${isDropdown ? 'dropdown-item' : ''}`}>
      <div className="notification-header" onClick={handleToggle}>
        <div className="notification-title">
          <span className={`notification-badge ${notification.type}`} />
          <span className="notification-title-text">{notification.title}</span>
          <span className="notification-time">
            {formatDistanceToNow(new Date(notification.date), { addSuffix: true })}
          </span>
        </div>
        <div className="notification-actions">
          {!notification.read && (
            <button
              className="icon-button"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              title="Mark as read"
            >
              <FaCheck />
            </button>
          )}
          <button
            className="icon-button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(notification.id);
            }}
            title="Remove notification"
          >
            <FaTimes />
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="notification-body">
          <p>{notification.message}</p>
          {notification.rawData && (
            <div className="notification-meta">
              <pre>{JSON.stringify(notification.rawData, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Notifications = ({ isDropdown = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const processedMessageIds = useRef(new Set());
  const isMounted = useRef(true);
  const [showDropdown, setShowDropdown] = useState(false);

  // Format WebSocket message into notification
  const formatWebSocketMessage = useCallback((data) => {
    if (!data) return null;

    // Handle order messages
    if (data.orderId || data.id) {
      const orderId = data.orderId || data.id || 'N/A';
      let totalAmount = 0;
      
      if (data.total && data.total > 0) {
        totalAmount = parseFloat(data.total);
      } else if (data.orderDetails?.products?.length) {
        totalAmount = data.orderDetails.products.reduce((sum, product) => {
          const price = parseFloat(product.price) || 0;
          const quantity = parseInt(product.quantity) || 1;
          return sum + (price * quantity);
        }, 0);
      }
      
      const formattedTotal = totalAmount.toFixed(2);
      
      return {
        id: `order-${orderId}-${Date.now()}`,
        title: `New Order #${orderId}`,
        message: `Order total: $${formattedTotal}`,
        date: data.orderDate || new Date().toISOString(),
        type: 'success',
        read: false,
        rawData: data
      };
    }

    // Handle other message types
    return {
      id: `msg-${Date.now()}`,
      title: data.title || 'Notification',
      message: data.message || JSON.stringify(data),
      date: data.date || new Date().toISOString(),
      type: data.type || 'info',
      read: false,
      rawData: data
    };
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({
        ...notif,
        read: true
      }))
    );
  }, []);

  // Remove a notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  // Remove all notifications
  const removeAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Handle incoming WebSocket messages
  const handleIncomingMessage = useCallback((message) => {
    if (!isMounted.current || !message?.body) return;

    try {
      const parsedBody = JSON.parse(message.body);
      const messageId = parsedBody.id || parsedBody.orderId || JSON.stringify(parsedBody);
      
      // Skip if we've already processed this message
      if (processedMessageIds.current.has(messageId)) {
        return;
      }
      
      processedMessageIds.current.add(messageId);
      
      // Format the notification
      const notification = formatWebSocketMessage(parsedBody);
      if (!notification) return;
      
      // Update notifications state, ensuring no duplicates
      setNotifications(prev => {
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
        } catch (error) {
          console.error('Failed to show desktop notification:', error);
        }
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }, [formatWebSocketMessage]);

  // Initialize WebSocket connection
  useEffect(() => {
    isMounted.current = true;
    setLoading(true);
    
    // Initialize STOMP client
    const stompClient = new Client({
      brokerURL: 'ws://localhost:8080/ws',
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
        if (!isMounted.current) return;
        console.log('STOMP: Successfully connected to WebSocket');
        setLoading(false);
        
        // Subscribe to orders topic
        subscriptionRef.current = stompClient.subscribe(
          '/topic/orders',
          handleIncomingMessage
        );
      },
      onStompError: (frame) => {
        if (!isMounted.current) return;
        console.error('STOMP protocol error:', frame.headers?.message || 'Unknown error');
        setLoading(false);
      },
      onWebSocketClose: () => {
        if (!isMounted.current) return;
        setLoading(false);
      },
      onDisconnect: () => {
        if (!isMounted.current) return;
        setLoading(false);
      }
    });
    
    clientRef.current = stompClient;
    stompClient.activate();
    
    // Request notification permission
    if (window.Notification && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    // Store refs for cleanup
    const currentSubscription = subscriptionRef.current;
    const currentClient = clientRef.current;
    const currentMessageIds = processedMessageIds.current;
    
    // Cleanup function
    return () => {
      isMounted.current = false;
      
      if (currentSubscription) {
        currentSubscription.unsubscribe();
      }
      
      if (currentClient) {
        try {
          currentClient.deactivate();
        } catch (error) {
          console.error('Error deactivating WebSocket client:', error);
        }
      }
      
      currentMessageIds.clear();
    };
  }, [handleIncomingMessage]);

  // Calculate unread count (used in parent component)

  if (loading && !isDropdown) {
    return <div className="notifications-loading">Loading notifications...</div>;
  }

  if (isDropdown) {
    return (
      <div className="notifications-dropdown-content">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <FaBellSlash />
            <p>No new notifications</p>
          </div>
        ) : (
          notifications.slice(0, 5).map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onRemove={removeNotification}
              isDropdown={true}
            />
          ))
        )}
        {notifications.length > 5 && (
          <div className="dropdown-footer">
            <Link to="/notifications" className="view-all-link" onClick={() => setShowDropdown(false)}>
              View all notifications
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h3>Notifications</h3>
        <div className="notifications-actions">
          {notifications.length > 0 && (
            <>
              <button 
                onClick={markAllAsRead}
                disabled={notifications.every(n => n.read)}
                className="action-button"
              >
                Mark all as read
              </button>
              <button 
                onClick={removeAllNotifications}
                className="action-button"
              >
                Clear all
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <FaBellSlash />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onRemove={removeNotification}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;
