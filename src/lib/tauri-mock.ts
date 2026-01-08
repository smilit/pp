/**
 * Tauri API Mock for Web Development Mode
 *
 * Provides mock implementations of Tauri APIs when running in web mode (npm run dev)
 * This allows the app to run in browser without Tauri backend
 */

export const isTauriAvailable = () => {
  return typeof window !== "undefined" && "__TAURI__" in window;
};

export const mockTauriAPI = () => {
  if (typeof window === "undefined") return;
  if (isTauriAvailable()) return; // Already have real Tauri

  console.log("[Mock] Initializing Tauri API mock for web mode");

  // Mock Tauri global
  (window as any).__TAURI__ = {
    invoke: async (cmd: string, args?: any) => {
      console.log(`[Mock] Tauri invoke: ${cmd}`, args);

      // Return mock data based on command
      switch (cmd) {
        case "get_config":
          return {
            language: "zh",
            theme: "system",
            proxy: "",
            minimize_to_tray: false,
            launch_on_startup: false,
            tls: {
              enable: false,
              cert_path: null,
              key_path: null,
            },
            remote_management: {
              allow_remote: false,
              secret_key: null,
              disable_control_panel: false,
            },
            quota_exceeded: {
              switch_project: true,
              switch_preview_model: false,
              cooldown_seconds: 60,
            },
          };

        case "save_config":
          console.log("[Mock] Config saved:", args);
          return { success: true };

        case "get_providers":
          return [];

        case "get_credentials":
          return [];

        case "check_server_status":
        case "get_server_status":
          return {
            running: false,
            host: "127.0.0.1",
            port: 8787,
            requests: 0,
            uptime_secs: 0,
          };

        case "start_server":
          return "Server started (mock)";

        case "stop_server":
          return "Server stopped (mock)";

        case "get_default_provider":
          return "openai";

        case "set_default_provider":
          return "Provider set (mock)";

        case "get_available_models":
          return [];

        case "get_network_info":
          return {
            local_ip: "127.0.0.1",
            public_ip: null,
            hostname: "localhost",
          };

        default:
          console.warn(`[Mock] Unhandled Tauri command: ${cmd}`);
          return null;
      }
    },

    event: {
      listen: async (event: string, _handler: any) => {
        console.log(`[Mock] Tauri listen: ${event}`);
        // Return unlisten function
        return () => {
          console.log(`[Mock] Tauri unlisten: ${event}`);
        };
      },

      emit: async (event: string, payload?: any) => {
        console.log(`[Mock] Tauri emit: ${event}`, payload);
      },

      once: async (event: string, _handler: any) => {
        console.log(`[Mock] Tauri once: ${event}`);
        return () => {};
      },
    },

    tauri: {
      invoke: async (cmd: string, args?: any) => {
        return (window as any).__TAURI__.invoke(cmd, args);
      },
    },
  };

  // Mock @tauri-apps/api modules
  (window as any).__TAURI_INVOKE__ = (window as any).__TAURI__.invoke;

  console.log("[Mock] Tauri API mock initialized");
  console.log("[Mock] Running in WEB MODE - some features may not work");
  console.log("[Mock] For full functionality, run: npm run tauri dev");
};

// Auto-initialize in development mode
if (import.meta.env.DEV && !isTauriAvailable()) {
  mockTauriAPI();
}
