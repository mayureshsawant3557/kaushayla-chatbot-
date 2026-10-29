const DashboardCard = ({
    title,
    value,
    icon,
    bgColor,
    link,
    showPercent
}) => {
    return (
        <div
            className="card h-100 w-100"
            style={{ backgroundColor: bgColor, cursor: "pointer" }}
            onClick={() => link && (window.location.href = link)}
        >
            <div className="card-body d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="text-dark">{icon}</div>
                    <h3 className="mb-0 fw-bold">{value}</h3>
                </div>

                <div>
                    <h6 className="mt-3 mb-0 text-dark">{title}</h6>
                    {showPercent && (
                        <small className="text-muted">Updated recently</small>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardCard;
