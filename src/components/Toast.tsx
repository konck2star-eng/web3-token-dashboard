interface ToastProps {
    type: "success" | "error" | "info";
    message: string;
    onClose: () => void;
  }
  
  function Toast({
    type,
    message,
    onClose,
  }: ToastProps) {
    const getIcon = () => {
      if (type === "success") {
        return "✓";
      }
  
      if (type === "error") {
        return "!";
      }
  
      return "i";
    };
  
    return (
      <div
        className={`toast toast-${type}`}
      >
        <div className="toast-icon">
          {getIcon()}
        </div>
  
        <div className="toast-content">
          <strong>
            {type === "success"
              ? "Success"
              : type === "error"
                ? "Error"
                : "Notice"}
          </strong>
  
          <span>
            {message}
          </span>
        </div>
  
        <button
          type="button"
          className="toast-close"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    );
  }
  
  export default Toast;