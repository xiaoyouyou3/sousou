# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "unstable"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.flutter
    pkgs.chromium
    pkgs.cmake
    pkgs.python3
    pkgs.pip
  ];

  # Sets environment variables in the workspace
  env = {
    # Add the chromium bin to the path so flutter can find it
    CHROME_EXECUTABLE = "${pkgs.chromium}/bin/chromium-browser";
  };

  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "dart-code.dart-code",
      "dart-code.flutter",
      "ms-python.python"
    ];

    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        # These commands are run in the 'my_app' directory
        # Enable web support for flutter
        flutter-enable-web = "cd my_app && flutter config --enable-web";
        # Get flutter dependencies
        flutter-pub-get = "cd my_app && flutter pub get";
        # Install python dependencies
        pip-install = "pip install -r requirements.txt";
      };
    };

    # Configures the web preview
    previews = {
      enable = true;
      previews = {
        # This name is arbitrary, but 'web' is a good default.
        web = {
          # Command to run for the preview.
          # We add 'flutter clean' to ensure a fresh build on every start.
          command = [ "sh" "-c" "cd my_app && flutter clean && flutter run -d web-server --web-port $PORT" ];
          # The manager tells IDX how to handle the preview (e.g., 'web' for a browser)
          manager = "web";
        };
        api = {
          command = [ "sh" "-c" "cd api && uvicorn main:app --host 0.0.0.0 --port $PORT" ];
          manager = "web";
        };
      };
    };
  };
}
