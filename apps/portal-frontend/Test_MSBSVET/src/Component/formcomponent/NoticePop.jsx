import { useContext, useCallback } from "react";
import Swal from "sweetalert2";
import { ThemeContext } from "../../Component/Context/ThemeContext"; // adjust path to match your project structure


const VALID_ICONS = ["success", "error", "warning", "info", "question"];

const isEmpty = (val) =>
    val === undefined ||
    val === null ||
    (typeof val === "string" && val.trim() === "");

/** Normalizes any input (string, number, Error, {message}, array, object) into a safe string. */
const normalizeText = (value, fallback = "") => {
    if (isEmpty(value)) return fallback;
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean")
        return value.toString();
    if (Array.isArray(value))
        return value.map((v) => normalizeText(v)).join("<br/>");
    if (value?.message) return normalizeText(value.message, fallback);
    if (value?.Message) return normalizeText(value.Message, fallback);
    if (
        typeof value?.toString === "function" &&
        value.toString() !== "[object Object]"
    ) {
        return value.toString();
    }
    return fallback;
};

/** Escapes plain text so it can't accidentally break out as HTML when isHtml=false. */
const escapeHtml = (str = "") =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Accepts flexible "content" shapes and turns them into a single HTML string:
 *  - string (plain text)                        -> escaped + wrapped
 *  - string (already HTML, isHtml=true)          -> used as-is
 *  - array of strings                            -> joined with <br/>
 *  - array of { heading, text, html }            -> rendered as sections
 */
// const buildBodyHtml = (content, isHtml) => {
//     if (isEmpty(content)) return "";

//     if (
//         Array.isArray(content) &&
//         content.length &&
//         typeof content[0] === "object"
//     ) {
//         return content
//             .map((section) => {
//                 const heading = section.heading
//                     ? `<b class="block mt-3 mb-1 text-gray-700">${escapeHtml(normalizeText(section.heading))}</b>`
//                     : "";
//                 const body = section.html
//                     ? normalizeText(section.html)
//                     : escapeHtml(normalizeText(section.text));
//                 return `${heading}<p class="my-1 leading-relaxed">${body}</p>`;
//             })
//             .join("");
//     }

//     if (Array.isArray(content)) {
//         return content.map((line) => normalizeText(line)).join("<br/>");
//     }

//     const text = normalizeText(content);
//     return isHtml ? text : escapeHtml(text).replace(/\n/g, "<br/>");
// };
const buildBodyHtml = (content, isHtml = false) => {
    if (isHtml) return content;

    if (Array.isArray(content)) {
        return content
            .map((item) => {
                if (typeof item === "string") {
                    return `<p>${escapeHtml(item)}</p>`;
                }

                return `
                    <p class="${item.className || ""}">
                        ${escapeHtml(item.text)}
                    </p>
                `;
            })
            .join("");
    }

    return `<p>${escapeHtml(content)}</p>`;
};

const safeClose = () => {
    if (Swal.isVisible()) Swal.close();
};

// Lightweight icon renderer used ONLY when a `header` is present — since
// SweetAlert2's native icon/title always render above everything (including
// our injected header bar), we build our own so icon+title can sit correctly
// BELOW the header instead of above it.
const ICON_STYLES = {
    info: { glyph: "i", color: "#38bdf8" },
    success: { glyph: "✓", color: "#22c55e" },
    error: { glyph: "✕", color: "#ef4444" },
    warning: { glyph: "!", color: "#f59e0b" },
    question: { glyph: "?", color: "#38bdf8" },
};

const renderInlineIcon = (iconType) => {
    const style = ICON_STYLES[iconType] || ICON_STYLES.info;
    return `<div class="flex items-center justify-center w-14 h-14 rounded-full border-4 mx-auto" style="border-color:${style.color};color:${style.color};">
    <span class="text-2xl font-bold leading-none">${style.glyph}</span>
  </div>`;
};

/**
 * React hook — returns a `showNoticePopup` function that already has your
 * app's ThemeContext color wired in as the default header bar color.
 *
 * Usage:
 *   const { showNoticePopup } = useNoticePopup();
 *   showNoticePopup({ header: "Important Notice", content: "..." });
 */
export function useNoticePopup() {
    const { color } = useContext(ThemeContext);

    /**
     * @param {Object}   opts
     * @param {string}   [opts.icon="info"]            success | error | warning | info | question
     * @param {string}   [opts.iconHtml]                Custom icon (emoji/svg/html) overriding built-in icon
     * @param {string}   [opts.title="Notice"]          Built-in icon/title area heading
     * @param {string}   [opts.header]                  Optional colored header bar text (e.g. "Sign In"), separate from `title`
     * @param {string}   [opts.headerIcon]               Optional icon/emoji/svg inside the header bar
     * @param {string}   [opts.headerColor]              Header bar color. Defaults to ThemeContext `color`. Override per-call if needed.
     * @param {boolean}  [opts.showHeaderCloseButton=true] Show a working × inside the header bar
     * @param {string|Array|Object} [opts.content]        Body — string, array of lines, or array of {heading, text/html} sections
     * @param {boolean}  [opts.isHtml=false]             Treat string `content` as raw HTML
     * @param {boolean}  [opts.showCloseButton=false]    Show SweetAlert2's own × icon (off by default)
     * @param {boolean}  [opts.showConfirmButton=true]
     * @param {string}   [opts.confirmText="OK"]
     * @param {string}   [opts.confirmButtonColor]
     * @param {boolean}  [opts.showCancelButton=false]
     * @param {string}   [opts.cancelText="Cancel"]
     * @param {string}   [opts.cancelButtonColor]
     * @param {string|number} [opts.width]
     * @param {boolean}  [opts.allowOutsideClick=false]
     * @param {boolean}  [opts.allowEscapeKey=false]
     * @param {string}   [opts.footer]
     * @param {Object}   [opts.customClass]
     * @param {Function} [opts.onConfirm]
     * @param {Function} [opts.onCancel]
     * @param {Function} [opts.onClose]
     * @param {Object}   [opts.extra]                    Raw SweetAlert2 passthrough
     * @returns {Promise}
     */
    const showNoticePopup = useCallback(
        (opts = {}) => {
            const {
                icon = "info",
                iconHtml,
                title = "Notice",
                header,
                headerIcon,
                headerColor = color, // <-- defaults to ThemeContext color automatically
                showHeaderCloseButton = true,
                content = "",
                isHtml = false,
                showCloseButton = false,
                showConfirmButton = true,
                confirmText = "OK",
                confirmButtonColor,
                showCancelButton = false,
                cancelText = "Cancel",
                cancelButtonColor,
                width,
                allowOutsideClick = false,
                allowEscapeKey = false,
                footer,
                customClass = {},
                onConfirm,
                onCancel,
                onClose,
                extra = {},
            } = opts;

            safeClose();

            const showIcon = icon !== null; // pass icon: null to hide the built-in icon entirely
            const safeIcon = VALID_ICONS.includes(icon) ? icon : "info";
            const titleText = title === "" ? "" : normalizeText(title, "Notice"); // pass title: "" to hide it entirely
            const bodyHtml = buildBodyHtml(content, isHtml);

            // headerColor can be either a raw CSS color (#hex, rgb(), hsl(), named color)
            // OR a Tailwind class (e.g. "bg-blue-900", "bg-[#0B1B33]") coming from ThemeContext.
            const isRawCssColor = (val) =>
                typeof val === "string" &&
                (/^#([0-9a-f]{3}){1,2}$/i.test(val) ||
                    /^(rgb|hsl)a?\(/i.test(val) ||
                    /^[a-z]+$/i.test(val));

            const headerUsesClass =
                !isEmpty(headerColor) && !isRawCssColor(headerColor);
            const headerBgStyle =
                !isEmpty(headerColor) && isRawCssColor(headerColor)
                    ? `background-color:${headerColor};`
                    : "";
            const headerBgClass = headerUsesClass ? headerColor : "";

            // Header bar owns its own padding — no negative margins needed, since the
            // popup itself has zero padding (see customClass.popup below) and clips
            // via overflow-hidden. This matches the pattern used in ErrorListPopup.
            const headerBarHtml = !isEmpty(header)
                ? `<div style="${headerBgStyle}" class="${headerBgClass} px-6 py-4 flex justify-between items-center text-white">
            <div class="flex items-center gap-2">
              ${headerIcon ? `<span class="text-xl leading-none">${headerIcon}</span>` : ""}
              <h2 class="text-lg font-semibold text-white">${escapeHtml(normalizeText(header))}</h2>
            </div>
            ${showHeaderCloseButton
                    ? `<button type="button" id="notice-header-close-btn" class="text-white hover:text-gray-300 text-2xl leading-none" aria-label="Close">&times;</button>`
                    : ""
                }
          </div>`
                : "";

            // Body content gets its own padding wrapper (independent of header padding)
            const bodyWrapperHtml = `<div class="px-6 py-5 text-left">${bodyHtml}</div>`;

            const finalHtml = `${headerBarHtml}${bodyWrapperHtml}`;

            return Swal.fire({
                ...(iconHtml ? { iconHtml } : showIcon ? { icon: safeIcon } : {}),
                ...(titleText ? { title: titleText } : {}),
                html: finalHtml,
                width,
                footer: footer ? normalizeText(footer) : undefined,
                showCloseButton,
                showConfirmButton,
                confirmButtonText: normalizeText(confirmText, "OK"),
                ...(confirmButtonColor ? { confirmButtonColor } : {}),
                showCancelButton,
                cancelButtonText: normalizeText(cancelText, "Cancel"),
                ...(cancelButtonColor ? { cancelButtonColor } : {}),
                allowOutsideClick,
                allowEscapeKey,
                reverseButtons: true,
                customClass: {
                    popup: "!p-0 !rounded-lg !overflow-hidden !shadow-xl",
                    title: !isEmpty(header)
                        ? "!hidden"
                        : "!font-bold !text-gray-700 !pt-6",
                    icon: !isEmpty(header) ? "!mt-6" : "",
                    htmlContainer: "!m-0 !p-0 !text-gray-600 !leading-relaxed",
                    actions: "!px-6 !pb-6 !pt-2",
                    closeButton:
                        "!text-gray-400 hover:!text-gray-600 focus:!shadow-none !top-4 !right-4",
                    ...customClass,
                },
                didOpen: (popupEl) => {
                    const headerCloseBtn = popupEl.querySelector(
                        "#notice-header-close-btn",
                    );
                    if (headerCloseBtn) {
                        headerCloseBtn.addEventListener("click", () => Swal.close());
                    }
                    if (typeof extra.didOpen === "function") extra.didOpen(popupEl);
                },
                ...extra,
            }).then((result) => {
                if (result.isConfirmed && typeof onConfirm === "function")
                    onConfirm(result);
                else if (
                    result.dismiss === Swal.DismissReason.cancel &&
                    typeof onCancel === "function"
                )
                    onCancel(result);
                else if (result.dismiss && typeof onClose === "function")
                    onClose(result);
                return result;
            });
        },
        [color],
    );

    return { showNoticePopup, closeNoticePopup: safeClose };
}

export default useNoticePopup;
