export default function Card({
    title,
    icon,
    children,
    footer,
    status = "default",   // default | success | warning | danger | info
    clickable = false,
    shadow = "sm",        // none | sm | md | lg
    onClick,
}) {
    const statusStyles = {
        default: "border-gray-300",
        success: "border-green-500",
        warning: "border-yellow-500",
        danger: "border-red-500",
        info: "border-blue-500",
    };
    const shadowStyles = {
        none: "shadow-none",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
    };

    return (
        <div
            onClick={onClick}
            className={`
                bg-(--bg-color-card-body) border ${statusStyles[status]}
                border rounded-md overflow-hidden
                ${shadowStyles[shadow]}
                ${clickable ? "cursor-pointer hover:shadow-lg transition" : ""}
      `     }
        >
            {/* Header */}
            {(title || icon) && (
                <div
                    className={`flex items-center gap-2 border-b ${statusStyles[status]} bg-(--bg-color-card-header)
                                px-3 py-2 md:py-4`}
                >
                    {icon && <span className="font-semibold text-(--font-color-card) text-sm md:text-base">{icon}</span>}
                    {title && (
                        <h3 className="font-semibold text-(--font-color-card) text-sm md:text-base">
                            {title}
                        </h3>
                    )}
                </div>
            )}
            {/* Body */}
            <div className="text-(--font-color-card) px-3 py-2 md:py-3 text-sm">
                {children}
            </div>
            {/* Footer */}
            {footer && (
                <div
                    className={`border-t ${statusStyles[status]} bg-(--bg-color-card-footer) flex justify-end
                        px-3 py-2 md:py-3`}
                >
                    {footer}
                </div>
            )}
        </div>
    );
}
