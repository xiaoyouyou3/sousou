{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [
    pkgs.flutter
    pkgs.firebase-tools
    (pkgs.python311.withPackages (ps: [
      ps.fastapi
      ps.uvicorn
      ps.python-dotenv
      ps.google-generativeai
    ]))
  ];
  env = {
    # IMPORTANT: Replace with your actual Gemini API Key
    GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
  };
  idx = {
    extensions = [
      "google.gemini-cli-vscode-ide-companion"
      "dart-code.flutter"
      "ms-python.python"
    ];
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["uvicorn" "backend.main:app" "--host" "0.0.0.0" "--port" "$PORT"];
          manager = "web";
        };
      };
    };
    workspace = {
      onCreate = {
        default.openFiles = [ ".idx/dev.nix" "README.md" ];
      };
      onStart = {};
    };
  };
}
