import { useEffect, useState } from "react";
import { useNotification } from "../../hooks/NotificationProvider";

const notificationStyles = {
  success: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    icon: "✓",
    accentColor: "#d1fae5",
  },
  error: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    icon: "✕",
    accentColor: "#fee2e2",
  },
  warning: {
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    icon: "⚠",
    accentColor: "#fef3c7",
  },
  info: {
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    icon: "ℹ",
    accentColor: "#dbeafe",
  },
  critical: {
    background: "linear-gradient(135deg, #1f2937 0%, #991b1b 100%)",
    icon: "⚡",
    accentColor: "#fca5a5",
  },
};

export default function NotificationRenderer() {
  const { notifications, removeNotification } = useNotification();
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    // Add new notifications with enter state
    notifications.forEach((notification) => {
      if (!visibleNotifications.find((n) => n.id === notification.id)) {
        setVisibleNotifications((prev) => [
          ...prev,
          { ...notification, state: "entering" },
        ]);

        // Transition to visible
        setTimeout(() => {
          setVisibleNotifications((prev) =>
            prev.map((n) =>
              n.id === notification.id ? { ...n, state: "visible" } : n
            )
          );
        }, 50);

        // Start exit animation before removal
        setTimeout(() => {
          setVisibleNotifications((prev) =>
            prev.map((n) =>
              n.id === notification.id ? { ...n, state: "exiting" } : n
            )
          );
        }, 5400);

        // Remove after exit animation
        setTimeout(() => {
          removeNotification(notification.id);
          setVisibleNotifications((prev) =>
            prev.filter((n) => n.id !== notification.id)
          );
        }, 6000);
      }
    });

    // Clean up removed notifications
    setVisibleNotifications((prev) =>
      prev.filter((vn) => notifications.find((n) => n.id === vn.id))
    );
  }, [notifications, removeNotification]);

  const handleClose = (id) => {
    setVisibleNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, state: "exiting" } : n))
    );

    setTimeout(() => {
      removeNotification(id);
      setVisibleNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 600);
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          pointerEvents: "none",
        }}
      >
        {visibleNotifications.map((notification) => {
          const style = notificationStyles[notification.type] || notificationStyles.info;

          return (
            <div
              key={notification.id}
              className={`notification notification-${notification.state}`}
              style={{
                background: style.background,
                color: "#ffffff",
                padding: "16px 20px",
                borderRadius: 16,
                minWidth: 360,
                maxWidth: 420,
                fontSize: 15,
                fontWeight: 500,
                boxShadow:
                  "0 20px 40px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
                pointerEvents: "auto",
                position: "relative",
                overflow: "hidden",
                backdropFilter: "blur(10px)",
                letterSpacing: "0.01em",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: style.accentColor,
                  color: style.background.split(" ")[1].split(",")[0],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 700,
                  flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
              >
                {style.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingTop: 2 }}>
                {notification.message}
              </div>

              {/* Close button */}
              <button
                onClick={() => handleClose(notification.id)}
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "none",
                  borderRadius: 8,
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#ffffff",
                  fontSize: 18,
                  fontWeight: 600,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  flexShrink: 0,
                  lineHeight: 1,
                  padding: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                ×
              </button>

              {/* Progress bar */}
              <div
                className="progress-bar"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: "rgba(255, 255, 255, 0.3)",
                  transformOrigin: "left",
                }}
              />

              {/* Shine effect overlay */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                  animation: "shine 3s ease-in-out infinite",
                  pointerEvents: "none",
                }}
              />
            </div>
          );
        })}
      </div>

      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(calc(100% + 24px));
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes slideOutRight {
            from {
              transform: translateX(0) scale(1);
              opacity: 1;
            }
            to {
              transform: translateX(calc(100% + 24px)) scale(0.95);
              opacity: 0;
            }
          }

          @keyframes progressShrink {
            from {
              transform: scaleX(1);
            }
            to {
              transform: scaleX(0);
            }
          }

          @keyframes shine {
            0% {
              left: -100%;
            }
            50%, 100% {
              left: 100%;
            }
          }

          .notification {
            transform-origin: right center;
          }

          .notification-entering {
            animation: slideInRight 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }

          .notification-visible {
            animation: none;
            transform: translateX(0);
            opacity: 1;
          }

          .notification-visible .progress-bar {
            animation: progressShrink 5.4s linear forwards;
          }

          .notification-exiting {
            animation: slideOutRight 0.6s cubic-bezier(0.4, 0, 1, 1) forwards;
          }

          @media (max-width: 480px) {
            .notification {
              min-width: auto;
              max-width: calc(100vw - 48px);
            }
          }
        `}
      </style>
    </>
  );
}