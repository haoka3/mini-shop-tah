export default function ChatBubble() {
  const size = "clamp(52px, 4vw, 64px)";

  return (
    <a
      href="https://m.me/61586198105881"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat Messenger"
      style={{
      position: "fixed",
        bottom: 16,
      right: 16,
        width: size,
        height: size,
      borderRadius: "50%",
      backgroundColor: "#0084ff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
        fontSize: "clamp(22px, 3vw, 28px)",
      textDecoration: "none",
        boxShadow: "0 8px 16px rgba(0,0,0,0.25)",
        zIndex: 9999,
      cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
        onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.04)";
        e.currentTarget.style.boxShadow = "0 10px 18px rgba(0,0,0,0.28)";
        }}
        onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.25)";
        }}
      title="Chat với shop trên Messenger"
      >
        💬
      </a>
  );
}
