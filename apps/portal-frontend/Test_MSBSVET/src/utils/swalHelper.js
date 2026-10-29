import Swal from "sweetalert2";

const safeClose = () => {
  if (Swal.isVisible()) {
    Swal.close();
  }
};
const normalizeText = (value, fallback = "") => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  if (value?.message) return value.message;
  if (value?.Message) return value.Message;
  if (value?.toString) return value.toString();
  return fallback;
};

export const SwalHelper = {
  loading(title = "Please wait...", text = "") {
    safeClose();
    Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        if (Swal.isVisible()) {
          Swal.showLoading();
        }
      },
    });
  },

  success(title = "Success", text = "", options = {}) {
    safeClose();
    return Swal.fire({
      icon: "success",
      title: normalizeText(title, "Success"),
      text: normalizeText(text),
      confirmButtonText: "OK",
      ...options,
    });
  },

  error(title = "Error", html = "") {
    safeClose();
    Swal.fire({
      icon: "error",
      title: normalizeText(title, "Error"),
      html: normalizeText(html),
      confirmButtonText: "OK",
      showConfirmButton: true,
    });
  },

  warning(title, text) {
    safeClose();
    return Swal.fire({
      icon: "warning",
      title,
      text,
      confirmButtonText: "OK",
    });
  },

  info(title, text) {
    safeClose();
    return Swal.fire({
      icon: "info",
      title,
      text,
      confirmButtonText: "OK",
    });
  },
    confirm({
        title = "Are you sure?",
        text = "",
        html = "",
        confirmText = "Yes",
        cancelText = "Cancel",
    }) {
        safeClose();

        return Swal.fire({
            icon: "warning",
            title: title,

            
            ...(html
                ? { html: html }     
                : { text: text }),   

            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
        });
    },

  toast(type = "success", title) {
    safeClose();
    return Swal.fire({
      toast: true,
      position: "top-end",
      icon: type,
      title,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  },

  close() {
    safeClose();
  },
};
