import React from "react";
import { logError } from "../../utils/errorLogger";
import { notify } from "../../utils/notificationService";

class ErrorBoundaryWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    // Required method: Update state when error occurs
    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        // Update state with error details
        this.setState({
            error: error,
            errorInfo: info
        });

        // Log error and notify
        logError(error, info);
        notify("Application crashed. Team notified.", "critical");
    }

    render() {
        // If there's an error, you can render a fallback UI here
        // For now, just rendering children (error will be logged and notified)
        return this.props.children;
    }
}

export default ErrorBoundaryWrapper;