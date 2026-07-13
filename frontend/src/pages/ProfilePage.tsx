export default function ProfilePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1e3a8a 0%, #0f172a 45%, #020617 100%)",
        padding: "40px",
        color: "white",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
          borderRadius: "28px",
          padding: "40px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          <img
            src="https://i.pravatar.cc/150"
            alt="avatar"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              border: "4px solid rgba(255,255,255,0.15)",
            }}
          />

          <div>
            <h1
              style={{
                fontSize: "42px",
                fontWeight: "800",
                marginBottom: "8px",
              }}
            >
              Jagadesh
            </h1>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "18px",
              }}
            >
              Full Stack Developer • Productivity Enthusiast
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
          }}
        >
          {[
            ["Tasks Completed", "128"],
            ["Productivity", "94%"],
            ["Current Streak", "16 Days"],
            ["Projects", "12"],
          ].map(([title, value]) => (
            <div
              key={title}
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "20px",
                padding: "24px",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p
                style={{
                  color: "#94a3b8",
                  marginBottom: "12px",
                }}
              >
                {title}
              </p>

              <h2
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                }}
              >
                {value}
              </h2>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}