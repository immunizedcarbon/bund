# bund

## Bundestag API GUI

This repository contains a small Python application with a graphical user interface to query the Bundestag DIP API.

### Requirements
* Python 3 with the `requests` library.
* A valid API key for `https://search.dip.bundestag.de/api/v1`.

### Usage
Run the GUI with:

```bash
python3 api_gui.py
```

Enter your API key, the endpoint path (e.g. `/vorgang` or `/vorgang/84343`) and optional query parameters (`key=value&other=123`).
Press **Fetch** to request data from the API. The response will be shown as formatted JSON in the text area.
