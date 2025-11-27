interface AlertProps {
  type: "success" | "error" | "info";
  message: string;
  onClose?: () => void;
}

export default function Alert({ type, message, onClose }: AlertProps) {
  const styles = {
    success: "bg-green-100 border-green-400 text-green-700",
    error: "bg-red-100 border-red-400 text-red-700",
    info: "bg-blue-100 border-blue-400 text-blue-700",
  };

  return (
    <div className={`${styles[type]} border px-4 py-3 rounded mb-4 flex items-center justify-between`}>
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 font-bold text-lg hover:opacity-70"
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
}
