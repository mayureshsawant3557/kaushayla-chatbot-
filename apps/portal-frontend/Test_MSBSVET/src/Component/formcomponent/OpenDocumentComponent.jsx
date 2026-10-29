import Swal from "sweetalert2";

const DocumentLink = ({ documentUrl, itemName, label }) => {

    const openDocumentPopup = () => {
        if (!documentUrl) {
            Swal.fire({
                title: "No Document",
                text: "No document available to view.",
                icon: "info"
            });
            return;
        }

        const popupWidth = 900;
        const popupHeight = 700;
        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        const popup = window.open(
            "",
            `${itemName}_PDF_Viewer`,
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        if (popup) {
            popup.document.write(`
                <html>
                    <head>
                        <title>${itemName} Document Viewer</title>
                        <style>
                            body { margin: 0; overflow: hidden; }
                            iframe { border: none; width: 100vw; height: 100vh; }
                        </style>
                    </head>
                    <body>
                        <iframe src="${documentUrl}" frameborder="0"></iframe>
                    </body>
                </html>
            `);
            popup.document.close();
            popup.focus();
        } else {
            Swal.fire({
                title: "Popup Blocked",
                text: "Please allow popups for this website to view the document.",
                icon: "error"
            });
        }
    };

    return (
        <span
            onClick={openDocumentPopup}
            className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
        >
            {label}
        </span>
    );
};

export default DocumentLink;