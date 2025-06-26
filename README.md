# bund

## Bundestag API GUI

This repository provides a small Python application with a graphical user interface to query the Bundestag DIP API.

### Requirements
- Python 3 with the `requests` library.
- A valid API key for `https://search.dip.bundestag.de/api/v1`.

### Usage
Run the GUI with:

```bash
python3 api_gui.py
```

Select a resource from the drop-down list, optionally enter an ID and query parameters (`key=value&other=123`). Press **Fetch** to request data from the API. The response will be shown as formatted JSON in the text area.

