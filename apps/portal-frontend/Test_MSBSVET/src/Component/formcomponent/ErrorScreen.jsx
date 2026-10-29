const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
    },
    card: {
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        textAlign: "center",
        maxWidth: "400px",
        width: "100%",
    },
    spinner: {
        border: "4px solid #f3f3f3",
        borderTop: "4px solid #3498db",
        borderRadius: "50%",
        width: "50px",
        height: "50px",
        animation: "spin 1s linear infinite",
        margin: "0 auto 20px",
    },
    title: {
        color: "#333",
        marginBottom: "10px",
        fontSize: "24px",
    },
    message: {
        color: "#666",
        fontSize: "16px",
    },
};


const ErrorScreen = ({ message, onRetry }) => {
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={{ color: "#c33" }}>Error</h2>
                <p>{message}</p>

                {onRetry && (
                    <button style={styles.retryButton} onClick={onRetry}>
                        Retry
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorScreen;