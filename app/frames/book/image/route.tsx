import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Frame image generator — returns 1200x630 PNG for Farcaster Frames
// ---------------------------------------------------------------------------

export const runtime = "edge";

const WIDTH = 1200;
const HEIGHT = 630;

// Brand colours
const BG = "#0A0A0F";
const ACCENT = "#6C5CE7";
const WHITE = "#FFFFFF";
const MUTED = "#A0A0B8";
const SUCCESS = "#00D68F";
const ERROR_COLOR = "#FF6B6B";

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: WIDTH,
        height: HEIGHT,
        background: `linear-gradient(135deg, ${BG} 0%, #1A1A2E 100%)`,
        fontFamily: "sans-serif",
        padding: 60,
      }}
    >
      {children}
    </div>
  );
}

function Logo() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 32,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: ACCENT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: WHITE,
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        Z
      </div>
      <span style={{ color: WHITE, fontSize: 32, fontWeight: 700 }}>
        Zentrfi
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step renderers
// ---------------------------------------------------------------------------

function SearchStep() {
  return (
    <Container>
      <Logo />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span style={{ color: WHITE, fontSize: 48, fontWeight: 700 }}>
          Book a Flight
        </span>
        <span style={{ color: MUTED, fontSize: 24 }}>
          Enter your route below to search flights
        </span>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            padding: "16px 32px",
            borderRadius: 16,
            border: `2px solid ${ACCENT}`,
            color: MUTED,
            fontSize: 22,
          }}
        >
          e.g. LAX to JFK
        </div>
      </div>
    </Container>
  );
}

function ResultsStep(route: string, offers: string[], date: string) {
  return (
    <Container>
      <Logo />
      <span style={{ color: WHITE, fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
        {route}
      </span>
      <span style={{ color: MUTED, fontSize: 20, marginBottom: 28 }}>
        {date ? `Departing ${date}` : "Next available"}
      </span>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          width: "100%",
          maxWidth: 800,
        }}
      >
        {offers.map((offer, i) => {
          const [airline, price, duration, stops] = offer.split("|");
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(255,255,255,0.06)",
                borderRadius: 14,
                padding: "18px 28px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ color: WHITE, fontSize: 24, fontWeight: 600 }}>
                  {airline}
                </span>
                <span style={{ color: MUTED, fontSize: 18 }}>
                  {duration} · {stops === "Direct" ? "Direct" : `${stops} stop${stops === "1" ? "" : "s"}`}
                </span>
              </div>
              <span style={{ color: ACCENT, fontSize: 28, fontWeight: 700 }}>
                {price}
              </span>
            </div>
          );
        })}
      </div>
    </Container>
  );
}

function ConfirmationStep(route: string, price: string, airline: string) {
  return (
    <Container>
      <Logo />
      <div
        style={{
          display: "flex",
          width: 64,
          height: 64,
          borderRadius: 32,
          background: SUCCESS,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          fontSize: 32,
          color: WHITE,
        }}
      >
        ✓
      </div>
      <span style={{ color: WHITE, fontSize: 40, fontWeight: 700, marginBottom: 12 }}>
        Ready to Book
      </span>
      <span style={{ color: MUTED, fontSize: 24, marginBottom: 8 }}>
        {airline} · {route}
      </span>
      <span style={{ color: ACCENT, fontSize: 36, fontWeight: 700, marginBottom: 24 }}>
        ${price}
      </span>
      <span style={{ color: MUTED, fontSize: 20 }}>
        Tap &quot;Open Zentrfi&quot; to complete your booking
      </span>
    </Container>
  );
}

function ComingSoonStep() {
  return (
    <Container>
      <Logo />
      <span style={{ color: WHITE, fontSize: 44, fontWeight: 700, marginBottom: 16 }}>
        Frames Booking
      </span>
      <span style={{ color: MUTED, fontSize: 26 }}>Coming Soon</span>
    </Container>
  );
}

function ErrorStep(message: string) {
  return (
    <Container>
      <Logo />
      <div
        style={{
          display: "flex",
          width: 56,
          height: 56,
          borderRadius: 28,
          background: ERROR_COLOR,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          fontSize: 28,
          color: WHITE,
        }}
      >
        !
      </div>
      <span style={{ color: WHITE, fontSize: 32, fontWeight: 600, marginBottom: 12 }}>
        Something went wrong
      </span>
      <span style={{ color: MUTED, fontSize: 22, textAlign: "center", maxWidth: 700 }}>
        {message}
      </span>
    </Container>
  );
}

function NoResultsStep(route: string) {
  return (
    <Container>
      <Logo />
      <span style={{ color: WHITE, fontSize: 36, fontWeight: 700, marginBottom: 16 }}>
        No Flights Found
      </span>
      <span style={{ color: MUTED, fontSize: 24 }}>
        {route} — try a different route or date
      </span>
    </Container>
  );
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const step = searchParams.get("step") ?? "search";

  let element: React.ReactElement;

  switch (step) {
    case "results": {
      const route = searchParams.get("route") ?? "";
      const date = searchParams.get("date") ?? "";
      let offers: string[] = [];
      try {
        offers = JSON.parse(searchParams.get("offers") ?? "[]");
      } catch {
        offers = [];
      }
      element = ResultsStep(route, offers, date);
      break;
    }

    case "confirmation": {
      const route = searchParams.get("route") ?? "";
      const price = searchParams.get("price") ?? "";
      const airline = searchParams.get("airline") ?? "";
      element = ConfirmationStep(route, price, airline);
      break;
    }

    case "error":
      element = ErrorStep(searchParams.get("message") ?? "Unknown error");
      break;

    case "no-results":
      element = NoResultsStep(searchParams.get("route") ?? "");
      break;

    case "coming-soon":
      element = ComingSoonStep();
      break;

    case "search":
    default:
      element = SearchStep();
      break;
  }

  return new ImageResponse(element, {
    width: WIDTH,
    height: HEIGHT,
  });
}
