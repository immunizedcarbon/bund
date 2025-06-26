import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import requests
import json
import urllib.parse

BASE_URL = "https://search.dip.bundestag.de/api/v1"
# Public API key provided by the Bundestag API documentation
API_KEY = "OSOegLs.PR2lwJ1dwCeje9vTj7FPOt3hvpYKtwKkhw"

class ApiGui(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Bundestag DIP API Client")
        self.geometry("800x600")
        self.create_widgets()

    def create_widgets(self):
        api_frame = ttk.Frame(self)
        api_frame.pack(fill="x", padx=10, pady=5)
        ttk.Label(api_frame, text="API Key:").pack(side="left")
        self.api_entry = ttk.Entry(api_frame, width=60)
        self.api_entry.pack(side="left", padx=5)
        # Pre-fill the entry with the public API key so the user can start immediately
        self.api_entry.insert(0, API_KEY)

        main_frame = ttk.Frame(self)
        main_frame.pack(fill="x", padx=10, pady=5)

        ttk.Label(main_frame, text="Resource:").pack(side="left")
        self.resource_var = tk.StringVar()
        resources = [
            "vorgang",
            "vorgangsposition",
            "drucksache",
            "drucksache-text",
            "plenarprotokoll",
            "plenarprotokoll-text",
            "aktivitaet",
            "person",
        ]
        self.resource_combo = ttk.Combobox(main_frame, textvariable=self.resource_var, values=resources, width=20, state="readonly")
        self.resource_combo.pack(side="left", padx=5)
        self.resource_combo.current(0)

        ttk.Label(main_frame, text="ID (optional):").pack(side="left")
        self.id_entry = ttk.Entry(main_frame, width=10)
        self.id_entry.pack(side="left", padx=5)

        ttk.Label(main_frame, text="Query (key=value&...):").pack(side="left")
        self.query_entry = ttk.Entry(main_frame, width=40)
        self.query_entry.pack(side="left", padx=5)

        ttk.Button(main_frame, text="Fetch", command=self.fetch).pack(side="left", padx=5)

        self.output = scrolledtext.ScrolledText(self, wrap="word")
        self.output.pack(fill="both", expand=True, padx=10, pady=10)

    def fetch(self):
        api_key = self.api_entry.get().strip() or API_KEY
        resource = self.resource_var.get()
        endpoint = f"/{resource}"
        item_id = self.id_entry.get().strip()
        if item_id:
            endpoint += f"/{item_id}"
        query_str = self.query_entry.get().strip()
        params = dict(urllib.parse.parse_qsl(query_str, keep_blank_values=True))
        url = BASE_URL + endpoint
        headers = {'Authorization': f'ApiKey {api_key}'}
        try:
            resp = requests.get(url, params=params, headers=headers)
            resp.raise_for_status()
            try:
                data = resp.json()
                text = json.dumps(data, indent=2, ensure_ascii=False)
            except ValueError:
                text = resp.text
            self.output.delete('1.0', tk.END)
            self.output.insert('1.0', text)
        except Exception as exc:
            messagebox.showerror("Request failed", str(exc))

if __name__ == '__main__':
    app = ApiGui()
    app.mainloop()
