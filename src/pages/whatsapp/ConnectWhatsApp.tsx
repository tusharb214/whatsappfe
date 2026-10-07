 import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Globe2,
  Loader2,
  MessageCircle,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    FB?: {
      init: (options: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;

      login: (
        callback: (response: {
          authResponse?: {
            code?: string;
            accessToken?: string;
          };
          status?: string;
        }) => void,
        options: {
          config_id: string;
          response_type: string;
          override_default_response_type: boolean;
          extras?: {
            setup?: Record<string, unknown>;
          };
        }
      ) => void;
    };

    fbAsyncInit?: () => void;
  }
}

const steps = [
  {
    number: "01",
    title: "Connect Meta",
    description:
      "Connect the Meta Business account that manages your WhatsApp Business.",
    icon: Globe2,
  },
  {
    number: "02",
    title: "Choose number",
    description:
      "Select your WhatsApp Business number from the secure Meta setup.",
    icon: Smartphone,
  },
  {
    number: "03",
    title: "Start messaging",
    description:
      "Your inbox, contacts and automation will be ready after connection.",
    icon: MessageCircle,
  },
];

export default function ConnectWhatsApp() {
  const navigate = useNavigate();

  const [sdkReady, setSdkReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load Meta/Facebook SDK
   */
  useEffect(() => {
    const appId = import.meta.env.VITE_META_APP_ID;

    if (!appId) {
      setError(
        "Meta App ID is not configured. Please check your frontend environment variables."
      );
      return;
    }

    if (window.FB) {
      setSdkReady(true);
      return;
    }

    const existingScript = document.getElementById(
      "facebook-jssdk"
    );

    if (existingScript) {
      return;
    }

    window.fbAsyncInit = () => {
      if (!window.FB) {
        setError("Meta SDK could not be initialized.");
        return;
      }

      window.FB.init({
        appId,
        cookie: true,
        xfbml: true,
        version: "v23.0",
      });

      setSdkReady(true);
    };

    const script = document.createElement("script");

    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = "https://connect.facebook.net/en_US/sdk.js";

    script.onerror = () => {
      setError(
        "Unable to load Meta's connection service. Please check your internet connection."
      );
    };

    document.body.appendChild(script);

    return () => {
      window.fbAsyncInit = undefined;
    };
  }, []);

  /**
   * Start Meta Embedded Signup
   */
  const handleConnect = () => {
    setError(null);

    const appId = import.meta.env.VITE_META_APP_ID;

    const configId =
      import.meta.env.VITE_META_EMBEDDED_SIGNUP_CONFIG_ID;

    if (!appId) {
      setError(
        "Meta App ID is missing. Add VITE_META_APP_ID to your .env file."
      );
      return;
    }

    if (!configId) {
      setError(
        "Embedded Signup Configuration ID is missing. Add VITE_META_EMBEDDED_SIGNUP_CONFIG_ID to your .env file."
      );
      return;
    }

    if (!window.FB || !sdkReady) {
      setError(
        "Meta connection is still loading. Please try again in a moment."
      );
      return;
    }

    setConnecting(true);

    window.FB.login(
      (response) => {
        console.log(
          "Meta Embedded Signup response:",
          response
        );

        setConnecting(false);

        if (response.authResponse?.code) {
          /**
           * IMPORTANT:
           *
           * Do NOT exchange the code in the browser.
           * The authorization code will be sent to the
           * Spring Boot backend in the next step.
           */
          console.log(
            "Embedded Signup authorization code received."
          );

          // Temporary:
          // We will connect this to Spring Boot next.
          alert(
            "Meta connection completed. Authorization code received. Backend integration is the next step."
          );

          return;
        }

        if (response.status === "not_authorized") {
          setError(
            "Meta authorization was not completed."
          );
          return;
        }

        setError(
          "Meta connection was cancelled or could not be completed."
        );
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        extras: {},
      }
    );
  };

  return (
    <div className="min-h-full bg-[#f8f9fc] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/whatsapp")}
          className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium !text-slate-600 transition hover:bg-white hover:!text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to WhatsApp
        </button>

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Hero */}
          <div className="border-b border-slate-200 px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
            <div className="flex flex-col items-center text-center">

              {/* WhatsApp Icon */}
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 ring-1 ring-green-100">
                <MessageCircle
                  size={32}
                  strokeWidth={2}
                  className="text-green-500"
                />
              </div>

              {/* Badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                <span className="text-xs font-semibold text-green-700">
                  WhatsApp Business
                </span>
              </div>

              <h1 className="!m-0 !text-3xl !font-bold !tracking-tight !text-slate-900 sm:!text-4xl">
                Connect your WhatsApp
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 !text-slate-500 sm:text-base">
                Connect your WhatsApp Business account securely
                through Meta and start managing everything from
                one place.
              </p>

              {/* No technical setup */}
              <div className="mt-5 flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5">
                <ShieldCheck
                  size={17}
                  className="text-green-500"
                />

                <span className="text-xs font-medium text-slate-600 sm:text-sm">
                  No API tokens, IDs or technical setup required
                </span>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="px-5 py-7 sm:px-8 sm:py-9 lg:px-12">

            <div className="mb-6">
              <h2 className="!m-0 !text-lg !font-semibold !text-slate-900">
                How it works
              </h2>

              <p className="mt-1 text-sm !text-slate-500">
                Connect your account in just a few steps.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className="group rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-green-200 hover:bg-green-50/40"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                        <Icon
                          size={20}
                          className="text-green-500"
                        />
                      </div>

                      <span className="text-xs font-bold tracking-wider text-slate-300">
                        {step.number}
                      </span>
                    </div>

                    <h3 className="!m-0 !text-sm !font-semibold !text-slate-900 sm:text-base">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-5 !text-slate-500">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-5 mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:mx-8 lg:mx-12">
              <p className="text-sm leading-5 text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-6 sm:px-8 lg:px-12">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              {/* Security */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">
                  <ShieldCheck
                    size={17}
                    className="text-green-500"
                  />
                </div>

                <div>
                  <p className="!m-0 text-sm font-semibold !text-slate-800">
                    Secure Meta connection
                  </p>

                  <p className="mt-0.5 text-xs leading-5 !text-slate-500">
                    Your WhatsApp credentials are handled
                    securely.
                  </p>
                </div>
              </div>

              {/* Button */}
              <button
                type="button"
                onClick={handleConnect}
                disabled={connecting || !sdkReady}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1877F2] px-6 py-3 text-sm font-semibold !text-white shadow-sm transition hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {connecting ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Connecting...
                  </>
                ) : !sdkReady ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Loading Meta...
                  </>
                ) : (
                  <>
                    Continue with Meta
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-4 flex items-center justify-center gap-2 px-3 text-center">
          <CheckCircle2
            size={15}
            className="shrink-0 text-green-500"
          />

          <p className="text-xs !text-slate-400">
            You will be redirected to Meta's secure setup
            experience.
          </p>
        </div>
      </div>
    </div>
  );
}