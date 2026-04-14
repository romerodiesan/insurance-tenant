type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      style={{
        borderRadius: "8px",
        border: "1px solid #d0d7de",
        padding: "0.5rem 0.75rem",
        background: "#fff",
        cursor: "pointer"
      }}
      {...props}
    >
      {children}
    </button>
  );
}
