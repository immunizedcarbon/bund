# bund

## Bundestag API GUI

This repository provides a small Python application with a graphical user interface to query the public Bundestag DIP API.

### Installation (Linux)

Below is a step-by-step guide using a Python virtual environment. The commands can be copied directly into a terminal on most Debian/Ubuntu based distributions.

1. **Install dependencies** (Python, `venv` module and git):

   ```bash
   sudo apt update
   sudo apt install python3 python3-venv git -y
   ```

2. **Download the project** (replace the URL with the location of this repository if different):

   ```bash
   git clone https://example.com/bund.git
   cd bund
   ```

3. **Create and activate a virtual environment**:

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

4. **Install the required Python package**:

   ```bash
   pip install requests
   ```

5. **Start the GUI**:

   ```bash
   python api_gui.py
   ```

### Usage

The application includes a public API key so it works out of the box. Select a resource from the drop-down list, optionally enter an ID and query parameters (`key=value&other=123`). Press **Fetch** to request data from the API. The response will appear as formatted JSON in the text area.
